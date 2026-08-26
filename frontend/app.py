import streamlit as st
import requests

st.set_page_config(page_title="Truth Intelligence", layout="centered")
st.title("AI Fake News & Misinformation Verifier")

user_input = st.text_area("Enter suspicious text or claim to verify:", height=120)

if st.button("Analyze Claim"):
    if not user_input.strip():
        st.warning("Please enter some text first.")
    else:
        with st.spinner("Verifying claim against evidence..."):
            try:
                response = requests.post(
                    "http://localhost:8000/analyze",
                    json={"input_type": "text", "content": user_input},
                    timeout=15
                )
                if response.status_code == 200:
                    data = response.json()
                    
                    st.divider()
                    st.subheader(f"Verdict: {data.get('verdict')}")
                    st.write(f"**Confidence:** {int(data.get('confidence', 0) * 100)}%")
                    st.info(f"**Why?** {data.get('reason')}")
                    
                    st.subheader("Evidence Sources")
                    for item in data.get("evidence", []):
                        st.markdown(f"- **[{item.get('source')}]** [{item.get('title')}]({item.get('url')}): {item.get('snippet')}")
                else:
                    st.error(f"Error {response.status_code}: Unable to process request.")
            except Exception as e:
                st.error(f"Failed to connect to backend: {e}")