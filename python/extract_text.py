import sys
import pdfplumber
import docx
import os

def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ''
        for page in pdf.pages:
            text += page.extract_text()
        return text

def extract_text_from_docx(docx_path):
    doc = docx.Document(docx_path)
    text = ''
    for para in doc.paragraphs:
        text += para.text + '\n'
    return text

def extract_text(file_path):
    file_extension = os.path.splitext(file_path)[1].lower()  
    print(f"File extension: {file_extension}")
    if file_extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension == '.docx':
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_path}")

if __name__ == '__main__':
    file_path = sys.argv[1]  
    print(extract_text(file_path))  
