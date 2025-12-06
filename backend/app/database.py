"""Database models and setup"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, Boolean, DateTime, Text, Integer
from datetime import datetime
from typing import Optional
from app.config import settings


# Database engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


class Ticket(Base):
    """Ticket model for database"""
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    # Content
    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[str] = mapped_column(Text)

    # Classification
    status: Mapped[str] = mapped_column(String(50), default="new")
    priority: Mapped[str] = mapped_column(String(50), default="medium")
    category: Mapped[str] = mapped_column(String(50), default="general")
    channel: Mapped[str] = mapped_column(String(50))

    # Assignment
    assigned_department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    assigned_to: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Customer info
    customer_name: Mapped[str] = mapped_column(String(200))
    customer_email: Mapped[str] = mapped_column(String(200))
    customer_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # AI metadata
    ai_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    auto_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="ru")

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # External references
    external_id: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)  # Email message ID, Telegram message ID


class KnowledgeBaseEntry(Base):
    """Knowledge base for FAQ"""
    __tablename__ = "knowledge_base"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Content
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50))

    # Metadata
    language: Mapped[str] = mapped_column(String(10), default="ru")
    priority: Mapped[int] = mapped_column(Integer, default=1)  # Higher = more important
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class User(Base):
    """User model for authentication"""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Auth
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(200))

    # Profile
    full_name: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(50), default="user")  # user, operator, admin
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Telegram integration (optional)
    telegram_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, unique=True)
    telegram_username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    """Get database session"""
    async with async_session_maker() as session:
        yield session
