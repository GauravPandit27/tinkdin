import requests
from bs4 import BeautifulSoup
import re

def is_github_profile(url):
    """Checks if a URL is a valid GitHub profile URL."""
    # Matches github.com/username, avoiding /username/repo or blob
    pattern = r'^https?://(www\.)?github\.com/[a-zA-Z0-9-]+/?$'
    return bool(re.match(pattern, url))

def fetch_github_repo_count(url):
    """Fetches the number of public repositories from a GitHub profile using the GitHub API."""
    if not is_github_profile(url):
        return None
    
    try:
        # Extract username from url (e.g., https://github.com/username/)
        username = url.rstrip('/').split('/')[-1]
        
        api_url = f"https://api.github.com/users/{username}"
        headers = {
            'User-Agent': 'Tinkdin-Hackathon-App',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        response = requests.get(api_url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get('public_repos', 0)
        else:
            print(f"GitHub API returned {response.status_code} for {username}")
            return None
    except Exception as e:
        print(f"Error fetching GitHub profile {url} via API: {e}")
        return None

def validate_links(links):
    """Takes a list of links, validates GitHub profiles, and returns stats."""
    github_stats = {}
    other_links = []
    
    for link in links:
        if is_github_profile(link):
            count = fetch_github_repo_count(link)
            if count is not None:
                github_stats[link] = count
        else:
            other_links.append(link)
            
    return github_stats, other_links
