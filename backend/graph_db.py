import os
from neo4j import GraphDatabase

_driver = None

def get_driver():
    global _driver
    if _driver is None:
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", os.getenv("NEO4J_USERNAME", "neo4j"))
        password = os.getenv("NEO4J_PASSWORD", "password123")
        try:
            _driver = GraphDatabase.driver(uri, auth=(user, password), connection_timeout=3.0)
        except Exception as e:
            print(f"Neo4j driver initialization notice: {e}")
            _driver = False
    return _driver if _driver is not False else None

def save_claim_to_graph(claim_text: str, verdict: str, entities: list):
    """Creates nodes for the claim and its associated entities in Neo4j."""
    driver = get_driver()
    if not driver:
        return

    try:
        with driver.session() as session:
            session.execute_write(_create_claim_nodes_tx, claim_text, verdict, entities)
    except Exception as e:
        print(f"Graph DB save notice: {e}")

def _create_claim_nodes_tx(tx, claim_text, verdict, entities):
    # Create the Claim node
    query_claim = (
        "MERGE (c:Claim {text: $claim_text}) "
        "SET c.verdict = $verdict "
        "RETURN c"
    )
    tx.run(query_claim, claim_text=claim_text, verdict=verdict)
    
    # Create Entity nodes and relate them to the claim
    for entity in entities:
        query_entity = (
            "MATCH (c:Claim {text: $claim_text}) "
            "MERGE (e:Entity {name: $entity_name}) "
            "MERGE (c)-[:MENTIONS]->(e)"
        )
        tx.run(query_entity, claim_text=claim_text, entity_name=entity)