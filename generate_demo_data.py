import pymupdf as fitz
import os

jd = """Job Title: Junior AI/Python Developer
We are looking for a passionate fresher or junior developer to join our team. 
Required Skills: Python, Machine Learning, NLP, Streamlit, Prompt Engineering.
Experience: 0-2 years.
The ideal candidate should be highly engaged in the developer community and have a strong portfolio of side projects."""

with open("demo_jd.txt", "w", encoding="utf-8") as f:
    f.write(jd)

# Resume 1: Excellent Fit with lots of repos
doc1 = fitz.open()
page1 = doc1.new_page()
text1 = "Alice Smith\n\nJunior AI Developer\nSkills: Python, NLP, Streamlit, Machine Learning, TensorFlow.\nExperience: Built several AI projects including a resume ranker and a chatbot.\nHighly passionate about open source."
page1.insert_text((50, 50), text1, fontsize=12)

# Add clickable link for GitHub
rect1 = fitz.Rect(50, 200, 250, 215)
page1.insert_text(rect1.tl, "GitHub Profile: github.com/pallets", color=(0,0,1), fontsize=12)
page1.insert_link({"kind": fitz.LINK_URI, "from": rect1, "uri": "https://github.com/pallets"})
doc1.save("resume_1_alice_perfect_fit.pdf")

# Resume 2: Good skills but no github
doc2 = fitz.open()
page2 = doc2.new_page()
text2 = "Bob Jones\n\nSoftware Engineer\nSkills: Python, Streamlit, Java, SQL.\nExperience: 1 year working as a backend engineer. Built REST APIs. Used prompt engineering recently."
page2.insert_text((50, 50), text2, fontsize=12)
doc2.save("resume_2_bob_no_github.pdf")

# Resume 3: Bad fit, but has github
doc3 = fitz.open()
page3 = doc3.new_page()
text3 = "Charlie Brown\n\nFrontend Developer\nSkills: HTML, CSS, JavaScript, React.\nExperience: 2 years building UI. Looking to shift to AI but no experience yet."
page3.insert_text((50, 50), text3, fontsize=12)

# Add clickable link for GitHub
rect3 = fitz.Rect(50, 160, 250, 175)
page3.insert_text(rect3.tl, "GitHub Profile: github.com/octocat", color=(0,0,1), fontsize=12)
page3.insert_link({"kind": fitz.LINK_URI, "from": rect3, "uri": "https://github.com/octocat"})
doc3.save("resume_3_charlie_poor_fit.pdf")

print("Demo files generated successfully!")
