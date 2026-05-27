import streamlit as st
import os
from dotenv import load_dotenv

from extractor import extract_content
from github_validator import validate_links
from llm_scorer import analyze_jd, score_candidate

# Load environment variables
load_dotenv()

st.set_page_config(page_title="Tinkdin", page_icon="🔥", layout="wide")

# Sidebar for configuration
st.sidebar.header("Configuration")
api_key = st.sidebar.text_input("Groq API Key", value=os.getenv("GROQ_API_KEY", ""), type="password")

if not api_key:
    st.warning("Please enter your Groq API Key in the sidebar to proceed.")
    st.stop()

# Initialize Session State
if 'page' not in st.session_state:
    st.session_state.page = "Upload"
if 'results' not in st.session_state:
    st.session_state.results = []
if 'current_idx' not in st.session_state:
    st.session_state.current_idx = 0
if 'shortlisted' not in st.session_state:
    st.session_state.shortlisted = []

# Router logic
def go_to_swipe():
    st.session_state.page = "Swipe"
def go_to_shortlist():
    st.session_state.page = "Shortlist"
def go_to_upload():
    st.session_state.results = []
    st.session_state.current_idx = 0
    st.session_state.shortlisted = []
    st.session_state.page = "Upload"

if st.session_state.page == "Upload":
    st.title("🔥 Tinkdin")
    st.markdown("Upload a Job Description and Resumes to analyze.")
    
    jd_text = st.text_area("Paste Job Description here:", height=200)
    uploaded_files = st.file_uploader("Upload Candidate Resumes (PDF, DOCX)", type=['pdf', 'docx'], accept_multiple_files=True)

    if st.button("🚀 Analyze Candidates", use_container_width=True, type="primary"):
        if not jd_text.strip():
            st.error("Please provide a Job Description.")
        elif not uploaded_files:
            st.error("Please upload at least one resume.")
        else:
            with st.spinner("Analyzing Job Description..."):
                try:
                    jd_analysis = analyze_jd(jd_text, api_key)
                except Exception as e:
                    st.error(f"Error analyzing JD: {e}")
                    st.stop()
                    
            results = []
            progress_bar = st.progress(0)
            
            for idx, file in enumerate(uploaded_files):
                with st.spinner(f"Processing {file.name}..."):
                    file.seek(0)
                    file_bytes = file.read()
                    
                    # Need to pass file again for extraction (file is a file-like object)
                    file.seek(0)
                    text, links = extract_content(file, file.name)
                    github_stats, other_links = validate_links(links)
                    
                    try:
                        scorecard = score_candidate(text, jd_analysis, github_stats, api_key)
                        results.append({
                            "candidate": file.name,
                            "file_bytes": file_bytes,
                            "scorecard": scorecard,
                            "github_stats": github_stats,
                            "all_links": links
                        })
                    except Exception as e:
                        st.error(f"Error scoring {file.name}: {e}")
                
                progress_bar.progress((idx + 1) / len(uploaded_files))
                
            # Sort results by match_score descending
            results.sort(key=lambda x: x['scorecard'].get('match_score', 0), reverse=True)
            
            st.session_state.results = results
            st.session_state.current_idx = 0
            st.session_state.shortlisted = []
            go_to_swipe()
            st.rerun()

elif st.session_state.page == "Swipe":
    if st.session_state.current_idx >= len(st.session_state.results):
        go_to_shortlist()
        st.rerun()
        
    res = st.session_state.results[st.session_state.current_idx]
    name = res['candidate']
    score = res['scorecard'].get('match_score', 0)
    
    if score >= 80:
        score_color = "#4CAF50" # Green
    elif score >= 60:
        score_color = "#FF9800" # Orange
    else:
        score_color = "#F44336" # Red
        
    st.markdown(f"### 🔍 Candidate {st.session_state.current_idx + 1} of {len(st.session_state.results)}")
    
    # Action buttons at the TOP for no-scrolling access
    col_pass, col_short = st.columns(2)
    with col_pass:
        if st.button("❌ Pass (Left Swipe)", use_container_width=True):
            st.session_state.current_idx += 1
            st.rerun()
    with col_short:
        if st.button("💚 Shortlist (Right Swipe)", use_container_width=True, type="primary"):
            st.session_state.shortlisted.append(res)
            st.session_state.current_idx += 1
            st.rerun()
            
    with st.container(border=True):
        st.markdown(f"""
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">
            <h2 style="margin: 0; color: #64B5F6;">{name}</h2>
            <h1 style="margin: 0; color: {score_color};">{score}<span style="font-size: 0.5em; color: #888;">/100</span></h1>
        </div>
        """, unsafe_allow_html=True)
        
        # 3 Column Layout for Compact View
        col1, col2, col3 = st.columns([1.2, 1, 1])
        
        with col1:
            st.markdown("##### 🧠 AI Score & Reasoning")
            st.write(res['scorecard'].get('reasoning'))
            s_str = ", ".join(res['scorecard'].get('strengths', []))
            w_str = ", ".join(res['scorecard'].get('weaknesses', []))
            if s_str: st.markdown(f"**✅ Strengths:** {s_str}")
            if w_str: st.markdown(f"**❌ Weaknesses:** {w_str}")
            
        with col2:
            st.markdown("##### 💼 Skills & Experience")
            skills = res['scorecard'].get('extracted_skills', [])
            if skills:
                st.markdown(f"**🛠️ Skills:** {', '.join(skills)}")
            st.markdown(f"**Timeline:** {res['scorecard'].get('extracted_experience', 'N/A')}")
            
        with col3:
            st.markdown("##### 📂 Projects & Contact")
            email = res['scorecard'].get('contact_email')
            phone = res['scorecard'].get('contact_phone')
            if email or phone:
                st.markdown(f"**📧 Email:** {email or 'N/A'}")
                st.markdown(f"**📱 Phone:** {phone or 'N/A'}")
            else:
                st.markdown("_No contact info extracted._")
                
            projects = res['scorecard'].get('extracted_projects', [])
            if projects:
                for p in projects[:3]: # limit to 3 to save space
                    st.markdown(f"- {p}")
            
            if res['github_stats']:
                st.markdown("**🔗 Verified GitHub:**")
                for url, count in res['github_stats'].items():
                    st.markdown(f"📦 [{count} Repos]({url})")

elif st.session_state.page == "Shortlist":
    st.title("💚 Final Shortlist")
    
    col1, col2 = st.columns([4, 1])
    with col1:
        st.markdown("Here are the candidates you shortlisted. Review their info and download their original resumes.")
    with col2:
        if st.button("Start Over", use_container_width=True):
            go_to_upload()
            st.rerun()
            
    if not st.session_state.shortlisted:
        st.info("You didn't shortlist anyone.")
    else:
        for res in st.session_state.shortlisted:
            name = res['candidate']
            score = res['scorecard'].get('match_score', 0)
            
            with st.container(border=True):
                c1, c2, c3 = st.columns([2, 2, 1])
                with c1:
                    st.markdown(f"### {name}")
                    st.markdown(f"**Score:** {score}/100")
                    email = res['scorecard'].get('contact_email')
                    phone = res['scorecard'].get('contact_phone')
                    st.markdown(f"**Email:** {email or 'N/A'}\n\n**Phone:** {phone or 'N/A'}")
                
                with c2:
                    skills_str = ', '.join(res['scorecard'].get('extracted_skills', []))
                    if len(skills_str) > 100: skills_str = skills_str[:100] + "..."
                    st.markdown(f"**Skills:** {skills_str}")
                    
                    if res['github_stats']:
                        st.markdown("**GitHub:** " + ", ".join([f"[{count} repos]({url})" for url, count in res['github_stats'].items()]))
                
                with c3:
                    file_ext = name.split(".")[-1].lower()
                    mime_type = "application/pdf" if file_ext == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    st.download_button(
                        label="📥 Download Resume",
                        data=res['file_bytes'],
                        file_name=name,
                        mime=mime_type,
                        use_container_width=True,
                        key=f"dl_{name}"
                    )
