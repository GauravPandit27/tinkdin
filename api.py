from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import io
import json

from extractor import extract_content
from github_validator import validate_links
from llm_scorer import analyze_jd, score_candidate

load_dotenv()

app = FastAPI(title="Tinkdin API")

# Configure CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import Optional

@app.post("/api/analyze-jd")
async def api_analyze_jd(
    jd_text: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    api_key: Optional[str] = Form(None)
):
    actual_api_key = api_key or os.getenv("GROQ_API_KEY")
    if not actual_api_key:
        raise HTTPException(status_code=401, detail="Groq API key is required")
        
    final_jd_text = ""
    
    if jd_text and jd_text.strip():
        final_jd_text = jd_text
    elif jd_file:
        file_bytes = await jd_file.read()
        file_stream = io.BytesIO(file_bytes)
        extracted_text, _ = extract_content(file_stream, jd_file.filename)
        final_jd_text = extracted_text
        
    if not final_jd_text or not final_jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text or file is required")
        
    try:
        jd_analysis = analyze_jd(final_jd_text, actual_api_key)
        return {"jd_analysis": jd_analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process-resume")
async def api_process_resume(
    file: UploadFile = File(...),
    jd_analysis: str = Form(...),
    api_key: str = Form(None)
):
    actual_api_key = api_key or os.getenv("GROQ_API_KEY")
    if not actual_api_key:
        raise HTTPException(status_code=401, detail="Groq API key is required")
        
    try:
        jd_analysis_dict = json.loads(jd_analysis)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid jd_analysis format")

    try:
        file_bytes = await file.read()
        file_stream = io.BytesIO(file_bytes)
        
        text, links = extract_content(file_stream, file.filename)
        github_stats, other_links = validate_links(links)
        
        scorecard = score_candidate(text, jd_analysis_dict, github_stats, actual_api_key)
        
        return {
            "candidate": file.filename,
            "scorecard": scorecard,
            "github_stats": github_stats,
            "all_links": links
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
