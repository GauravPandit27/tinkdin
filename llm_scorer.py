from groq import Groq
import json

def analyze_jd(jd_text: str, api_key: str):
    """Analyzes the Job Description and returns structured criteria."""
    client = Groq(api_key=api_key)
    
    prompt = f"""
    Analyze the following Job Description and extract the key requirements.
    
    Job Description:
    {jd_text}
    
    You must return ONLY a valid JSON object with the following exact structure:
    {{
        "experience_required": "string describing experience",
        "core_skills": ["skill1", "skill2"],
        "keywords": ["keyword1", "keyword2"]
    }}
    """
    
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        temperature=0.0
    )
    
    return json.loads(chat_completion.choices[0].message.content)

def score_candidate(resume_text: str, jd_analysis: dict, github_stats: dict, api_key: str):
    """Scores a candidate's resume against the JD analysis and returns a scorecard."""
    client = Groq(api_key=api_key)
    
    github_context = "No GitHub profile found or 0 repos."
    if github_stats:
        github_context = "GitHub profiles found:\n" + "\n".join([f"- {url}: {repos} public repositories" for url, repos in github_stats.items()])
        
    prompt = f"""
    You are an expert technical recruiter. Evaluate the following candidate's resume against the job requirements.
    
    Job Requirements (extracted from JD):
    Experience Required: {jd_analysis.get('experience_required')}
    Core Skills: {', '.join(jd_analysis.get('core_skills', []))}
    Keywords: {', '.join(jd_analysis.get('keywords', []))}
    
    GitHub Validation (Verified External Data):
    {github_context}
    (Note: If the candidate has a GitHub with many active repositories, this is a strong positive signal for technical engagement, especially for freshers. Higher repos e.g. >10 is a very good sign. Factor this into your reasoning and score).
    
    Candidate Resume:
    {resume_text}
    
    You must return ONLY a valid JSON object with the following exact structure:
    {{
        "match_score": integer between 0 and 100,
        "contact_email": "extracted email or null",
        "contact_phone": "extracted phone number or null",
        "extracted_skills": ["skill1", "skill2"],
        "extracted_experience": "Brief summary of their experience timeline and roles",
        "extracted_projects": ["project1", "project2"],
        "reasoning": "Detailed explanation of the score",
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"]
    }}
    """
    
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        temperature=0.0
    )
    
    return json.loads(chat_completion.choices[0].message.content)
