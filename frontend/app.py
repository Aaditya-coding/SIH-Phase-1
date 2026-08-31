import streamlit as st
import requests
from PIL import Image
import sys
import os
import json
import datetime
import uuid
import time

BACKEND_URL = "http://localhost:8000"


def check_backend():
  try:
    response = requests.get(f"{BACKEND_URL}/health")
    return response.status_code == 200
  except requests.exceptions.ConnectionError:
    return False

if "backend_ready" not in st.session_state:
  st.session_state.backend_ready = False

if not st.session_state.backend_ready:
  with st.spinner(
      "Tu!! Haan Tu BSDK whi aake maarunga!...backend load hone de!!!"
  ):
    while not check_backend():
      time.sleep(1)
    st.session_state.backend_ready = True
    st.rerun()

st.title("Truth Intelligence - Fake News Detection")

# Set up paths to access backend and multimodal modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from multimodal.ocr_reader import extract_text_from_image

# --- NEW IMPORTS FOR PHASE 2 & 3 ---
from backend.security.audit_logger import CryptographicAuditLogger
from frontend.components.charts import (
    render_velocity_curve,
    render_source_distribution,
    render_narrative_graph
)


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


st.set_page_config(page_title="Truth Intelligence", layout="centered", page_icon="🛡️")
st.title("🛡️ Truth Intelligence: AI Misinformation Verifier")

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
                
                # --- Map evidence to our graph format ---
                mapped_sources = []
                if evidence_list:
                    for idx, item in enumerate(evidence_list, start=1):
                        source_tag = item.get("source", "UNKNOWN")
                        title = item.get("title", "Source Link")
                        url = item.get("url", "#")
                        snippet = item.get("snippet", "No preview available.")
                        score = item.get("similarity_score", None)

                        # Add to UI
                        score_str = f" | *Relevance Score: {score}*" if score is not None else ""
                        st.markdown(f"**{idx}. [{source_tag}]** [{title}]({url}){score_str}")
                        st.caption(snippet)
                        
                        # Add to mapped sources for the Graph Analytics
                        stance = "debunking" if verdict == "REFUTED" else "spreading"
                        mapped_sources.append({
                            "domain": source_tag, 
                            "stance": stance, 
                            "trust_score": float(score) if score else 0.5, 
                            "frequency": 1
                        })
                    else:
                        pass # Executes if loop completes without break
                else:
                    st.write("No external evidence links returned.")

                # --- NEW: EXECUTIVE THREAT INTELLIGENCE DASHBOARD ---
                st.divider()
                st.subheader("📊 Threat Intelligence & Narrative Analytics")
                
                tab_graph, tab_velocity, tab_sources = st.tabs([
                    "🕸️ Narrative Spread Graph",
                    "📈 Viral Velocity Curves",
                    "🌐 Source Distribution"
                ])
                
                # Generate a mock claim ID for tracking if the backend didn't provide one
                claim_id = data.get("claim_id", f"CLM-{uuid.uuid4().hex[:8].upper()}")
                keywords = data.get("keywords", ["Misinformation", "Viral Claim"])

                with tab_graph:
                    fig_graph = render_narrative_graph(claim_id, cleaned_claim, keywords, mapped_sources)
                    st.plotly_chart(fig_graph, use_container_width=True)

                with tab_velocity:
                    fig_velocity = render_velocity_curve() # Uses default mockup velocity for now
                    st.plotly_chart(fig_velocity, use_container_width=True)

                with tab_sources:
                    if mapped_sources:
                        fig_sources = render_source_distribution(mapped_sources)
                        st.plotly_chart(fig_sources, use_container_width=True)
                    else:
                        st.info("Not enough source data to render distribution.")

                # --- PHASE 3 / PHASE 4: SECURE REPORT EXPORTING FEATURE ---
                st.divider()
                st.subheader("🔐 Export Cryptographic Verification Report")
                st.markdown("Download a tamper-proof, SHA-256 signed copy of this verdict.")
                
                # Prepare report data
                report_data = {
                    "claim_id": claim_id,
                    "timestamp": datetime.datetime.now().isoformat(),
                    "claim": cleaned_claim,
                    "verdict": verdict,
                    "confidence_score": f"{confidence_pct}%",
                    "explanation": data.get('reason'),
                    "evidence_sources": evidence_list
                }

                # Format as clean Markdown text block
                md_lines = [
                    "# Truth Intelligence - Verification Report",
                    f"**Date:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                    f"**Claim ID:** {claim_id}",
                    f"**Claim:** {cleaned_claim}",
                    f"**Verdict:** {verdict}",
                    f"**Confidence Score:** {confidence_pct}%",
                    f"\n## Explanation\n{data.get('reason')}",
                    "\n## Retrieved Sources"
                ]
                for idx, item in enumerate(evidence_list, start=1):
                    md_lines.append(f"{idx}. **[{item.get('source', 'UNKNOWN')}]** [{item.get('title', 'Link')}]({item.get('url', '#')})")
                    md_lines.append(f"   > {item.get('snippet', '')}")
                
                markdown_report = "\n".join(md_lines)

                # --- Apply Cryptographic Signatures ---
                signed_json, json_hash = CryptographicAuditLogger.generate_json_signature(report_data)
                signed_md, md_hash = CryptographicAuditLogger.generate_markdown_signature(markdown_report, claim_id)

                st.success(f"✅ Signatures Generated (SHA-256: `{json_hash[:12]}...`)")

                col1, col2 = st.columns(2)
                with col1:
                    st.download_button(
                        label="📥 Download Signed JSON",
                        data=json.dumps(signed_json, indent=4),
                        file_name=f"secure_report_{claim_id}.json",
                        mime="application/json"
                    )
                with col2:
                    st.download_button(
                        label="📥 Download Signed Markdown",
                        data=signed_md,
                        file_name=f"secure_report_{claim_id}.md",
                        mime="text/markdown"
                    )

            except Exception as e:
                st.error(f"Failed to connect to backend server or render analytics: {e}")