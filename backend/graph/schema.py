"""
Neo4j Graph Schema & Constraints setup.
"""

CONSTRAINTS = [
    # Ensure unique claim identifiers
    "CREATE CONSTRAINT claim_id_unique IF NOT EXISTS FOR (c:Claim) REQUIRE c.id IS UNIQUE;",
    
    # Ensure unique domain names
    "CREATE CONSTRAINT domain_name_unique IF NOT EXISTS FOR (d:Domain) REQUIRE d.name IS UNIQUE;",
    
    # Ensure unique keywords
    "CREATE CONSTRAINT keyword_name_unique IF NOT EXISTS FOR (k:Keyword) REQUIRE k.name IS UNIQUE;"
]

INDEXES = [
    "CREATE INDEX claim_timestamp_idx IF NOT EXISTS FOR (c:Claim) ON (c.timestamp);",
    "CREATE INDEX domain_trust_idx IF NOT EXISTS FOR (d:Domain) ON (d.trust_score);"
]