import streamlit as st
import requests
from PIL import Image
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from multimodal.ocr_reader import extract_text_from_image

st.set_page_config(page_title="Truth Intelligence", layout="centered")
st.title("AI Fake News & Misinformation Verifier")

input_mode = st.radio("Choose Input Mode:", ["Direct Text Input", "Upload Image / Screenshot"], horizontal=True)
user_claim = ""

if input_mode == "Direct Text Input":
    user_claim = st.text_area("Enter suspicious statement or news claim:", height=120)
else:
    uploaded_file = st.file_uploader("Upload image (e.g., WhatsApp notice, screenshot, circular):", type=["png", "jpg", "jpeg"]) 
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Image Preview", use_container_width = True)
        with st.spinner("Extracting text via OCR..."):
            extracted = extract_text_from_image(uploaded_file)
        if extracted:
            user_claim = st.text_area("Extracted Text (You can edit before verifying):", value=extracted, height=120)
        else:
            st.warning("No readable text detected in this image. You can type the claim manually below.")
            user_claim = st.text_area("Enter claim manually:", height=100)  

if st.button("Verify Claim", type="primary"):
    if not user_claim or not user_claim.strip():
        st.warning("Please provide a valid claim or upload an image containing text.")
    else:
        with st.spinner("Running verification pipeline against web sources..."):
            try:
                response = requests.post(
                    "http://localhost:8000/analyze",
                    json={"input_type": "text", "content": user_claim.strip()},
                    timeout=30
                )
                if response.status_code == 200:
                    data = response.json()
                    st.divider()

                    verdict = data.get("verdict","UNKNOWN")
                    confidence_pct = int(data.get("confidence", 0)*100)

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
                else:
                    st.error(f"API returned error status code: {response.status_code}")
            except Exception as e:
                st.error(f"Failed to connect to backend server: {e}")                                                            