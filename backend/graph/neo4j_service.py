import os
import logging
from typing import List, Dict, Any, Optional
from neo4j import GraphDatabase, Driver
from .schema import CONSTRAINTS, INDEXES

logger = logging.getLogger("neo4j_service")

class Neo4jGraphService:
    def __init__(
        self,
        uri: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None
    ):
        self.uri = uri or os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = user or os.getenv("NEO4J_USER", "neo4j")
        self.password = password or os.getenv("NEO4J_PASSWORD", "misinfo_secure_pass_123")
        self._driver: Optional[Driver] = None

    def connect(self):
        """Initialize the connection pool and set up constraints."""
        try:
            self._driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            self._driver.verify_connectivity()
            logger.info("Successfully connected to Neo4j.")
            self.init_schema()
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            raise e

    def close(self):
        """Close connection driver."""
        if self._driver:
            self._driver.close()

    def init_schema(self):
        """Apply unique constraints and indexes."""
        with self._driver.session() as session:
            for constraint in CONSTRAINTS:
                session.run(constraint)
            for index in INDEXES:
                session.run(index)
        logger.info("Neo4j schema constraints and indexes verified.")

    def record_claim_propagation(
        self,
        claim_id: str,
        claim_text: str,
        verdict: str,
        risk_score: float,
        timestamp: str,
        keywords: List[str],
        sources: List[Dict[str, Any]]
    ):
        """
        Ingests a verified claim, links it to keywords, and maps its source domains.
        
        sources format:
        [
            {"domain": "twitter.com", "url": "...", "stance": "spreading", "trust_score": 0.4},
            {"domain": "reuters.com", "url": "...", "stance": "debunking", "trust_score": 0.95}
        ]
        """
        query = """
        // 1. Merge Claim Node
        MERGE (c:Claim {id: $claim_id})
        SET c.text = $claim_text,
            c.verdict = $verdict,
            c.risk_score = $risk_score,
            c.timestamp = $timestamp

        // 2. Attach Keywords
        WITH c
        UNWIND $keywords AS kw_name
        MERGE (k:Keyword {name: toLower(kw_name)})
        MERGE (c)-[:TAGGED_WITH]->(k)

        // 3. Attach Source Domains & Narrative Spread
        WITH c
        UNWIND $sources AS src
        MERGE (d:Domain {name: toLower(src.domain)})
        ON CREATE SET d.trust_score = src.trust_score
        MERGE (c)-[r:REPORTED_BY]->(d)
        SET r.url = src.url,
            r.stance = src.stance
        """
        with self._driver.session() as session:
            session.run(
                query,
                claim_id=claim_id,
                claim_text=claim_text,
                verdict=verdict,
                risk_score=risk_score,
                timestamp=timestamp,
                keywords=keywords,
                sources=sources
            )

    def get_narrative_spread(self, claim_id: str) -> Dict[str, Any]:
        """
        Fetches the complete graph network for a specific claim to render in Streamlit.
        """
        query = """
        MATCH (c:Claim {id: $claim_id})
        OPTIONAL MATCH (c)-[r1:TAGGED_WITH]->(k:Keyword)
        OPTIONAL MATCH (c)-[r2:REPORTED_BY]->(d:Domain)
        RETURN c, collect(DISTINCT k) AS keywords, collect(DISTINCT {domain: d, rel: r2}) AS sources
        """
        with self._driver.session() as session:
            result = session.run(query, claim_id=claim_id)
            record = result.single()
            if not record:
                return {}
            return {
                "claim": dict(record["c"]),
                "keywords": [dict(k) for k in record["keywords"]],
                "sources": [
                    {"domain": dict(s["domain"]), "details": dict(s["rel"])}
                    for s in record["sources"] if s["domain"] is not None
                ]
            }

    def get_cross_domain_propagation(self) -> List[Dict[str, Any]]:
        """
        Finds domain co-occurrences where claims consistently spread across platforms.
        """
        query = """
        MATCH (d1:Domain)<-[:REPORTED_BY]-(c:Claim)-[:REPORTED_BY]->(d2:Domain)
        WHERE id(d1) < id(d2)
        RETURN d1.name AS source_a, d2.name AS source_b, count(c) AS shared_claims
        ORDER BY shared_claims DESC
        LIMIT 20
        """
        with self._driver.session() as session:
            result = session.run(query)
            return [record.data() for record in result]