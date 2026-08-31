import hashlib
import json
import logging
from datetime import datetime
from typing import Dict, Any, Tuple

logger = logging.getLogger("audit_logger")

class CryptographicAuditLogger:
    """
    Generates SHA-256 cryptographic signatures for verification reports
    to ensure data integrity and prevent tampering.
    """

    @staticmethod
    def generate_json_signature(report_data: Dict[str, Any]) -> Tuple[Dict[str, Any], str]:
        """
        Takes a JSON report dictionary, generates a SHA-256 hash, and returns
        the signed payload along with the hash.
        """
        try:
            # Add an exact timestamp for the audit trail
            audit_timestamp = datetime.utcnow().isoformat()
            report_data["audit_timestamp"] = audit_timestamp
            
            # Convert dictionary to a strictly formatted JSON string to ensure consistent hashing
            serialized_data = json.dumps(report_data, sort_keys=True, separators=(',', ':'))
            
            # Generate SHA-256 Hash
            signature = hashlib.sha256(serialized_data.encode('utf-8')).hexdigest()
            
            # Attach signature to the final payload
            signed_payload = {
                "report": report_data,
                "cryptographic_signature": signature,
                "hashing_algorithm": "SHA-256"
            }
            
            logger.info(f"Generated JSON audit signature: {signature[:12]}...")
            return signed_payload, signature

        except Exception as e:
            logger.error(f"Failed to generate JSON signature: {e}")
            raise e

    @staticmethod
    def generate_markdown_signature(markdown_content: str, claim_id: str) -> Tuple[str, str]:
        """
        Takes a Markdown report string, generates a SHA-256 hash, and appends
        a verification block to the bottom of the Markdown document.
        """
        try:
            # Strip trailing whitespaces to ensure consistent hashing
            clean_markdown = markdown_content.strip()
            
            # Generate SHA-256 Hash
            signature = hashlib.sha256(clean_markdown.encode('utf-8')).hexdigest()
            
            audit_timestamp = datetime.utcnow().isoformat()
            
            # Create the verification footer
            verification_footer = (
                f"\n\n---\n"
                f"### 🔐 Cryptographic Verification Block\n"
                f"- **Claim ID:** `{claim_id}`\n"
                f"- **Audit Timestamp (UTC):** `{audit_timestamp}`\n"
                f"- **Algorithm:** `SHA-256`\n"
                f"- **Integrity Hash:** `{signature}`\n"
                f"---\n"
                f"*This report is cryptographically signed. Any modification to the text above this block will invalidate the hash.*"
            )
            
            signed_markdown = clean_markdown + verification_footer
            
            logger.info(f"Generated Markdown audit signature for claim {claim_id}: {signature[:12]}...")
            return signed_markdown, signature

        except Exception as e:
            logger.error(f"Failed to generate Markdown signature: {e}")
            raise e