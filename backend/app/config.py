"""Configuration settings for the application"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Gemini API
    GEMINI_API_KEY: str

    # Telegram
    TELEGRAM_BOT_TOKEN: Optional[str] = None

    # Email
    EMAIL_ADDRESS: Optional[str] = None
    EMAIL_PASSWORD: Optional[str] = None
    EMAIL_IMAP_SERVER: str = "imap.gmail.com"
    EMAIL_SMTP_SERVER: str = "smtp.gmail.com"
    EMAIL_IMAP_PORT: int = 993
    EMAIL_SMTP_PORT: int = 465
    EMAIL_CHECK_INTERVAL: int = 30  # seconds

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/helpdesk.db"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"

    # AI Settings
    AUTO_RESOLVE_THRESHOLD: float = 0.85  # Confidence threshold for auto-resolution
    MAX_KNOWLEDGE_BASE_RESULTS: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
