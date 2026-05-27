import requests
from bs4 import BeautifulSoup
import re

def is_github_profile(url):
    """Checks if a URL is a valid GitHub profile URL."""
    # Matches github.com/username, avoiding /username/repo or blob
    pattern = r'^https?://(www\.)?github\.com/[a-zA-Z0-9-]+/?$'
    return bool(re.match(pattern, url))

def fetch_github_repo_count(url):
    """Fetches the number of public repositories from a GitHub profile."""
    if not is_github_profile(url):
        return None
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # The repository count is typically in a span inside a link with data-tab-item="repositories"
            repo_tab = soup.find('a', {'data-tab-item': 'repositories'})
            if repo_tab:
                count_span = repo_tab.find('span', class_='Counter')
                if count_span:
                    count_text = count_span.text.strip()
                    # Convert to int, handling 'k' or commas if necessary
                    count_text = count_text.replace(',', '')
                    if 'k' in count_text.lower():
                        return int(float(count_text.lower().replace('k', '')) * 1000)
                    return int(count_text)
        return None
    except Exception as e:
        print(f"Error fetching GitHub profile {url}: {e}")
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
