import re
from urllib.parse import urlparse

# Define automated whitelist and blacklist patterns
TIER_1_PATTERNS = [
    r"\.gov(\.[a-z]{2})?$", r"\.edu(\.[a-z]{2})?$", r"\.mil$",
    r"who\.int", r"nih\.gov", r"cdc\.gov", r"rbi\.org\.in",
    r"pib\.gov\.in", r"wikipedia\.org", r"nature\.com", r"thelancet\.com"
]

TIER_2_DOMAINS = {
    "reuters.com", "apnews.com", "bbc.com", "thehindu.com",
    "indianexpress.com", "timesofindia.indiatimes.com", "ndtv.com",
    "bloomberg.com", "aljazeera.com", "factcheck.org", "snopes.com", "altnews.in"
}

TIER_3_DOMAINS = {
    "reddit.com", "medium.com", "quora.com", "x.com", "twitter.com",
    "facebook.com", "instagram.com", "substack.com", "blogspot.com", "wordpress.com"
}

TIER_4_BLACKLIST = {
    "theonion.com", "babylonbee.com", "infowars.com", "naturalnews.com",
    "fakingnews.com", "worldnewsdailyreport.com", "beforeitsnews.com"
}


def extract_domain(url: str) -> str:
    """Extracts a clean, normalized domain name from any URL or source string."""
    if not url or url.startswith("#"):
        return "osint-feed"
    try:
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain if domain else "unknown-domain"
    except Exception:
        return "unknown-domain"


def classify_source_tier(url_or_domain: str) -> dict:
    """
    Evaluates a URL/domain and returns its Credibility Tier, Trust Score, and Trust Label.
    """
    domain = extract_domain(url_or_domain)

    # 1. Check Tier 1 (Authoritative / Institutional)
    for pattern in TIER_1_PATTERNS:
        if re.search(pattern, domain, re.IGNORECASE) or any(t in url_or_domain.lower() for t in ["wikipedia", "who.int", "gov.in"]):
            return {
                "domain": domain,
                "tier": "Tier 1",
                "tier_name": "Authoritative & Academic",
                "trust_score": 0.98,
                "badge_color": "green",
                "is_flagged": False
            }

    # 2. Check Tier 4 (Known Blacklisted / Satire / Fake News)
    if any(black in domain for black in TIER_4_BLACKLIST):
        return {
            "domain": domain,
            "tier": "Tier 4",
            "tier_name": "Flagged / Blacklisted Domain",
            "trust_score": 0.10,
            "badge_color": "red",
            "is_flagged": True
        }

    # 3. Check Tier 2 (Established Mainstream Press & Fact-Checkers)
    if any(t2 in domain for t2 in TIER_2_DOMAINS):
        return {
            "domain": domain,
            "tier": "Tier 2",
            "tier_name": "Mainstream Fact-Checking / News",
            "trust_score": 0.88,
            "badge_color": "blue",
            "is_flagged": False
        }

    # 4. Check Tier 3 (Unverified / Social / User-Generated)
    if any(t3 in domain for t3 in TIER_3_DOMAINS):
        return {
            "domain": domain,
            "tier": "Tier 3",
            "tier_name": "User Generated / Unverified Web",
            "trust_score": 0.50,
            "badge_color": "orange",
            "is_flagged": False
        }

    # Default Tier for regular indexed web results
    return {
        "domain": domain,
        "tier": "Tier 2B",
        "tier_name": "Indexed Web Evidence",
        "trust_score": 0.72,
        "badge_color": "blue",
        "is_flagged": False
    }