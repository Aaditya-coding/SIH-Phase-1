from celery import Celery

# Initialize Celery with Redis as broker and backend
celery_app = Celery(
    "truth_intelligence_worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=['backend.tasks']
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)