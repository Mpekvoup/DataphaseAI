"""Main FastAPI application"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import asyncio

from app.config import settings
from app.database import init_db, get_session
from app.knowledge_base import knowledge_base
from app.telegram_bot import telegram_bot
from app.email_service import email_service
from app.ticket_service import ticket_service
from app.gemini_service import gemini_service


# Pydantic models for API
class TicketCreate(BaseModel):
    title: str
    description: str
    customer_name: str
    customer_email: EmailStr
    channel: str = "portal"
    language: str = "ru"


class KnowledgeBaseEntry(BaseModel):
    question: str
    answer: str
    category: str
    language: str = "ru"


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    print("🚀 Starting DataPhase AI Help Desk Backend...")

    # Initialize database
    print("📊 Initializing database...")
    await init_db()

    # Load knowledge base
    print("📚 Loading knowledge base...")
    try:
        await knowledge_base.load_default_kb()
        kb_stats = knowledge_base.get_stats()
        print(f"✅ Knowledge base loaded: {kb_stats['total_entries']} entries")
    except Exception as e:
        print(f"⚠️  Error loading knowledge base: {e}")

    # Start Telegram bot
    try:
        await telegram_bot.start()
    except Exception as e:
        print(f"⚠️  Telegram bot error: {e}")

    # Start Email service
    try:
        await email_service.start()
    except Exception as e:
        print(f"⚠️  Email service error: {e}")

    print("✅ All services started successfully!")
    print(f"🌐 API available at http://{settings.HOST}:{settings.PORT}")

    yield

    # Shutdown
    print("\n⏳ Shutting down services...")
    await telegram_bot.stop()
    await email_service.stop()
    print("✅ Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="DataPhase AI Help Desk",
    description="AI-powered help desk system with multi-channel support",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routes

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "DataPhase AI Help Desk API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "telegram_bot": telegram_bot.is_running,
        "email_service": email_service.is_running,
        "knowledge_base": knowledge_base.get_stats()
    }


# Ticket endpoints

@app.post("/api/tickets")
async def create_ticket(ticket: TicketCreate):
    """Create a new ticket"""
    try:
        result = await ticket_service.process_message(
            title=ticket.title,
            description=ticket.description,
            channel=ticket.channel,
            customer_name=ticket.customer_name,
            customer_email=ticket.customer_email,
            language=ticket.language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tickets")
async def get_tickets(
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """Get all tickets with optional filters"""
    try:
        tickets = await ticket_service.get_all_tickets(
            status=status,
            category=category,
            limit=limit,
            offset=offset
        )
        return {"tickets": tickets, "count": len(tickets)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """Get specific ticket by ID"""
    ticket = await ticket_service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics"""
    try:
        stats = await ticket_service.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Knowledge Base endpoints

@app.post("/api/knowledge-base")
async def add_kb_entry(entry: KnowledgeBaseEntry):
    """Add entry to knowledge base"""
    try:
        doc_id = await knowledge_base.add_faq(
            question=entry.question,
            answer=entry.answer,
            category=entry.category,
            language=entry.language
        )
        return {"id": doc_id, "message": "Entry added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/knowledge-base/search")
async def search_kb(query: str, category: Optional[str] = None, language: str = "ru"):
    """Search knowledge base"""
    try:
        results = await knowledge_base.search_similar(
            query=query,
            category=category,
            language=language,
            top_k=5
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/knowledge-base/stats")
async def kb_stats():
    """Get knowledge base statistics"""
    return knowledge_base.get_stats()


# AI endpoints

@app.post("/api/ai/classify")
async def classify_text(title: str, description: str, language: str = "ru"):
    """Classify ticket text"""
    try:
        result = await gemini_service.classify_ticket(title, description, language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/generate-response")
async def generate_response(description: str, category: str, language: str = "ru"):
    """Generate AI response"""
    try:
        # Search KB
        similar_faqs = await knowledge_base.search_similar(
            query=description,
            category=category,
            language=language
        )

        # Generate response
        result = await gemini_service.generate_response(
            ticket_description=description,
            similar_faqs=similar_faqs,
            category=category,
            language=language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
