from neo4j import GraphDatabase

# Local Neo4j connection credentials
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password123"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def save_claim_to_graph(claim_text: str, verdict: str, entities: list):
    """Creates nodes for the claim and its associated entities in Neo4j."""
    with driver.session() as session:
        session.execute_write(_create_claim_nodes_tx, claim_text, verdict, entities)

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