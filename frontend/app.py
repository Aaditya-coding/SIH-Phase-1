import streamlit as st
import requests
from PIL import Image
import sys
import os
import json
import datetime
from fpdf import FPDF

# Ensure the multimodal module can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from multimodal.ocr_reader import extract_text_from_image

# 1. Function to generate the PDF in memory
def create_pdf(report_text):
    pdf = FPDF()
    pdf.add_page()
    
    # Add a title
    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(200, 10, txt="Intelligence Brief", ln=True, align="C")
    
    # Add the report content
    pdf.set_font("Arial", size=12)
    # Ensure text is latin-1 compatible for FPDF
    safe_text = report_text.encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 10, txt=safe_text)
    
    # Return the PDF as bytes so Streamlit can download it directly
    return pdf.output(dest="S").encode("latin-1")


@st.cache_data(ttl=3600, show_spinner=False)
def fetch_verification_cached(claim_text: str) -> dict:
    """
    Sends claim text to backend API and caches response for 1 hour (3600s).
    Prevents repeated expensive verification API calls on UI re-renders.
    """
    response = requests.post(
        "http://localhost:8000/analyze",
        json={"input_type": "text", "content": claim_text},
        timeout=30
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise RuntimeError(f"API returned error status code: {response.status_code}")


# 2. Main Streamlit UI Setup
st.set_page_config(page_title="Truth Intelligence", layout="centered")
st.title("AI Fake News & Misinformation Verifier")

input_mode = st.radio("Choose Input Mode:", ["Direct Text Input", "Upload Image / Screenshot"], horizontal=True, key="input_mode_selector")
user_claim = ""

if input_mode == "Direct Text Input":
    user_claim = st.text_area("Enter suspicious statement or news claim:", height=120, key="direct_text_input")
else:
    uploaded_file = st.file_uploader("Upload image (e.g., WhatsApp notice, screenshot, circular):", type=["png", "jpg", "jpeg"], key="image_uploader_file") 
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Image Preview", use_container_width=True)
        with st.spinner("Extracting text via OCR..."):
            extracted = extract_text_from_image(uploaded_file)
        if extracted:
            user_claim = st.text_area("Extracted Text (You can edit before verifying):", value=extracted, height=120, key="ocr_extracted_text_area")
        else:
            st.warning("No readable text detected in this image. You can type the claim manually below.")
            user_claim = st.text_area("Enter claim manually:", height=100, key="ocr_manual_fallback_text_area")  

# 3. Verification Pipeline
if st.button("Verify Claim", type="primary"):
    cleaned_claim = user_claim.strip() if user_claim else ""
    if not cleaned_claim:
        st.warning("Please provide a valid claim or upload an image containing text.")
    else:
        with st.spinner("Running verification pipeline against web sources..."):
            try:
                # Call cached backend function
                data = fetch_verification_cached(cleaned_claim)

                st.divider()

                verdict = data.get("verdict", "UNKNOWN")
                confidence_pct = int(data.get("confidence", 0) * 100)

                if verdict == "SUPPORTED":
                    st.success(f"### VERDICT: {verdict}")
                elif verdict == "REFUTED":
                    st.error(f"### VERDICT: {verdict}")
                elif verdict == "CONFLICTING":
                    st.warning(f"### VERDICT: {verdict}")
                else: 
                    st.info(f"### VERDICT: {verdict}")

                st.write(f"**Confidence Score:** {confidence_pct}%")
                st.write(f"**Explanation:** {data.get('reason')}")

                st.divider()
                st.subheader("Retrieved Evidence & Sources")
                evidence_list = data.get("evidence", [])
                
                if evidence_list:
                    for idx, item in enumerate(evidence_list, start=1):
                        source_tag = item.get("source", "UNKNOWN")
                        title = item.get("title", "Source Link")
                        url = item.get("url", "#")
                        snippet = item.get("snippet", "No preview available.")
                        score = item.get("similarity_score", None)

                        score_str = f" | *Relevance Score: {score}*" if score is not None else ""
                        st.markdown(f"**{idx}. [{source_tag}]** [{title}]({url}){score_str}")
                        st.caption(snippet)
                else:
                    st.write("No external evidence links returned.")

                # --- PHASE 3 / PHASE 4: REPORT EXPORTING FEATURE ---
                st.divider()
                st.subheader("Export Verification Report")

                # Prepare JSON report structure
                report_data = {
                    "timestamp": datetime.datetime.now().isoformat(),
                    "claim": user_claim.strip(),
                    "verdict": verdict,
                    "confidence_score": f"{confidence_pct}%",
                    "explanation": data.get('reason'),
                    "evidence_sources": evidence_list
                }

                # Format as clean text block for Markdown and PDF reading
                md_lines = [
                    "Truth Intelligence - Verification Report",
                    "----------------------------------------",
                    f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                    f"Claim: {user_claim.strip()}",
                    f"Verdict: {verdict}",
                    f"Confidence Score: {confidence_pct}%",
                    f"\nExplanation:\n{data.get('reason')}",
                    "\nRetrieved Sources:"
                ]
                for idx, item in enumerate(evidence_list, start=1):
                    md_lines.append(f"{idx}. [{item.get('source', 'UNKNOWN')}] {item.get('title', 'Link')} ({item.get('url', '#')})")
                    md_lines.append(f"   > {item.get('snippet', '')}")

                markdown_report = "\n".join(md_lines)
                
                # Generate PDF using the formatted text
                pdf_bytes = create_pdf(markdown_report)

                # Output buttons in 3 columns
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.download_button(
                        label="📄 Download as JSON",
                        data=json.dumps(report_data, indent=4),
                        file_name=f"verification_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                        mime="application/json"
                    )
                with col2:
                    st.download_button(
                        label="📄 Download as Markdown",
                        data=markdown_report,
                        file_name=f"verification_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.md",
                        mime="text/markdown"
                    )
                with col3:
                    st.download_button(
                        label="📄 Download as PDF",
                        data=pdf_bytes,
                        file_name=f"verification_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                        mime="application/pdf"
                    )

            except Exception as e:
                # Catching the dangling exception from your original snippet
                st.error(f"An error occurred during verification: {str(e)}")
