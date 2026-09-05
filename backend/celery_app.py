import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Initialize Celery with Redis as broker and backend
celery_app = Celery(
    "truth_intelligence_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['backend.tasks']
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
)

def is_celery_available() -> bool:
    """Checks whether the Celery/Redis broker is reachable without throwing errors."""
    if not os.getenv("REDIS_URL") and os.getenv("RENDER"):
        # On Render without REDIS_URL, Celery is not available
        return False
    try:
        with celery_app.connection_for_read() as conn:
            conn.ensure_connection(max_retries=1, timeout=2.0)
            return True
    except Exception:
        return False