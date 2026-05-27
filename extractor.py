import pymupdf as fitz
import docx
import re

def extract_text_and_links_from_pdf(file_stream):
    """Extracts text and clickable links from a PDF file stream."""
    doc = fitz.open("pdf", file_stream)
    text = ""
    links = []
    
    for page in doc:
        text += page.get_text() + "\n"
        for link in page.get_links():
            if 'uri' in link:
                uri = link['uri']
                if uri and uri not in links:
                    links.append(uri)
                    
    # Additionally, fallback regex for plain text links
    url_pattern = re.compile(r'(https?://[^\s]+)')
    text_links = url_pattern.findall(text)
    for link in text_links:
        if link not in links:
            links.append(link)
            
    return text, list(set(links))

def extract_text_and_links_from_docx(file_stream):
    """Extracts text from a Word document stream. (Basic link extraction via regex for now)"""
    doc = docx.Document(file_stream)
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    
    url_pattern = re.compile(r'(https?://[^\s]+)')
    links = list(set(url_pattern.findall(text)))
    
    return text, links

def extract_content(file, filename):
    file.seek(0)
    file_bytes = file.read()
    if filename.lower().endswith(".pdf"):
        return extract_text_and_links_from_pdf(file_bytes)
    elif filename.lower().endswith(".docx"):
        file.seek(0)
        return extract_text_and_links_from_docx(file)
    else:
        # Fallback for plain text
        text = file_bytes.decode("utf-8", errors="ignore")
        url_pattern = re.compile(r'(https?://[^\s]+)')
        links = list(set(url_pattern.findall(text)))
        return text, links
