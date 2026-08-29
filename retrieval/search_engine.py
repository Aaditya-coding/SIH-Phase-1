from functools import lru_cache
from ddgs import DDGS  # duckduckgo_search exports DDGS

@lru_cache(maxsize=100)
def search_claim(claim: str, max_results: int = 5) -> tuple:
    """Fetches real search snippets categorized by domain source with LRU caching."""
    results = []
    try:
        with DDGS() as ddgs:
            raw_results = list(ddgs.text(claim, max_results=max_results, backend="auto"))
            for r in raw_results:
                url = r.get("href", "")
                
                # Logic order fix: FACT_CHECK should be evaluated first, as some 
                # fact-checkers like pib.gov contain '.gov' (which would otherwise match OFFICIAL first)
                if any(chk in url for chk in ["boomlive.in", "altnews.in", "snopes.com", "pib.gov"]):
                    source_type = "FACT_CHECK"
                elif any(ext in url for ext in [".gov", ".nic.in", ".org"]):
                    source_type = "OFFICIAL"
                elif any(media in url for media in ["ndtv.com", "thehindu.com", "bbc.com", "reuters.com"]):
                    source_type = "NEWS"
                else:
                    source_type = "UNKNOWN"

                results.append({
                    "title": r.get("title", ""),
                    "url": url,
                    "snippet": r.get("body", ""),
                    "source": source_type
                })
    except Exception as e:
        print(f"Search error: {e}")
        
    # Convert list to tuple to ensure the return type is immutable
    return tuple(results)

def clear_search_cache():
    """Utility function to clear the search cache manually."""
    search_claim.cache_clear()