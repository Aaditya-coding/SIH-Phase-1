# API Documentation: Truth Intelligence MVP

## Overview
This document specifies the universal REST API contract for the Day-1 Misinformation Verification pipeline.

---

## Endpoints

### 1. Health Check
* **Route:** `GET /health`
* **Description:** Verifies service availability.
* **Response:**
```json
{
  "status": "ok"
}