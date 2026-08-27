# Implement extract_text_from_image(image_path) using PaddleOCR to parse text from notices or screenshots so it can be passed into extract_claims().

from PIL import Image
import pytesseract
import io
import os

tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = tesseract_path

def extract_text_from_image(image_input) -> str:
    try:
        if isinstance(image_input, Image.Image):
            img = image_input
        else:
            img = Image.open(image_input)
            
        extracted_text = pytesseract.image_to_string(img)
        return extracted_text.strip()
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""      