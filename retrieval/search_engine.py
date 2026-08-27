from ddgs import DDGS

def search_claim(claim: str, max_results: int = 5) -> list:
    """Fetches real search snippets categorized by domain source."""
    results = []
    try:
        with DDGS() as ddgs:
            raw_results = list(ddgs.text(claim, max_results=max_results))
            for r in raw_results:
                url = r.get("href", "")
                
                source_type = "UNKNOWN"
                if any(ext in url for ext in [".gov", ".nic.in", ".org"]):
                    source_type = "OFFICIAL"
                elif any(chk in url for chk in ["boomlive.in", "altnews.in", "snopes.com", "pib.gov"]):
                    source_type = "FACT_CHECK"
                elif any(media in url for media in ["ndtv.com", "thehindu.com", "bbc.com", "reuters.com"]):
                    source_type = "NEWS"

                results.append({
                    "title": r.get("title", ""),
                    "url": url,
                    "snippet": r.get("body", ""),
                    "source": source_type
                })
    except Exception as e:
        print(f"Search error: {e}")
        
    return results