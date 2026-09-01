from qdrant_client import QdrantClient

def reset_qdrant_cache():
    try:
        client = QdrantClient(host="localhost", port=6333)
        collections = client.get_collections().collections
        collection_names = [c.name for c in collections]

        if "verified_claims" in collection_names:
            client.delete_collection("verified_claims")
            print("Successfully deleted 'verified_claims' collection from Qdrant.")
        else:
            print("'verified_claims' collection does not exist or is already clear.")
    except Exception as e:
        print(f"Error resetting Qdrant cache: {e}")

if __name__ == "__main__":
    reset_qdrant_cache()