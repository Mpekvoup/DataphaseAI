"""Ticket Service for processing and managing tickets"""
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import Ticket, async_session_maker
from app.gemini_service import gemini_service
from app.knowledge_base import knowledge_base
from app.config import settings
import uuid


class TicketService:
    """Service for processing tickets with AI"""

    @staticmethod
    def generate_ticket_id() -> str:
        """Generate unique ticket ID"""
        timestamp = datetime.now().strftime("%Y%m%d")
        random_part = str(uuid.uuid4())[:8].upper()
        return f"T-{timestamp}-{random_part}"

    async def process_message(
        self,
        title: str,
        description: str,
        channel: str,
        customer_name: str,
        customer_email: str,
        external_id: str = None,
        language: str = "ru"
    ) -> Dict:
        """
        Process incoming message and create ticket

        Returns:
            {
                "ticket_id": "T-...",
                "status": "new|auto_resolved",
                "ai_response": "...",
                "auto_resolved": bool,
                "confidence": float
            }
        """

        # Step 1: Classify ticket using Gemini
        classification = await gemini_service.classify_ticket(title, description, language)

        # Step 2: Search knowledge base for similar questions
        similar_faqs = await knowledge_base.search_similar(
            query=description,
            category=classification.get("category"),
            language=language,
            top_k=settings.MAX_KNOWLEDGE_BASE_RESULTS
        )

        # Step 3: Generate AI response
        ai_result = await gemini_service.generate_response(
            ticket_description=description,
            similar_faqs=similar_faqs,
            category=classification.get("category"),
            language=language
        )

        # Step 4: Determine if can auto-resolve
        can_auto_resolve = (
            ai_result.get("can_auto_resolve", False) and
            ai_result.get("confidence", 0) >= settings.AUTO_RESOLVE_THRESHOLD
        )

        # Step 5: Create ticket in database
        ticket_id = self.generate_ticket_id()
        status = "auto_resolved" if can_auto_resolve else "new"

        async with async_session_maker() as session:
            ticket = Ticket(
                ticket_id=ticket_id,
                title=title,
                description=description,
                status=status,
                priority=classification.get("priority", "medium"),
                category=classification.get("category", "general"),
                channel=channel,
                assigned_department=classification.get("department"),
                customer_name=customer_name,
                customer_email=customer_email,
                ai_confidence=ai_result.get("confidence", 0),
                auto_resolved=can_auto_resolve,
                ai_response=ai_result.get("response", ""),
                language=language,
                external_id=external_id,
                resolved_at=datetime.utcnow() if can_auto_resolve else None
            )

            session.add(ticket)
            await session.commit()

        print(f"✅ Ticket created: {ticket_id} | Status: {status} | Confidence: {ai_result.get('confidence', 0):.2f}")

        return {
            "ticket_id": ticket_id,
            "status": status,
            "ai_response": ai_result.get("response", ""),
            "auto_resolved": can_auto_resolve,
            "confidence": ai_result.get("confidence", 0),
            "category": classification.get("category"),
            "priority": classification.get("priority"),
            "department": classification.get("department")
        }

    async def get_ticket(self, ticket_id: str) -> Optional[Dict]:
        """Get ticket by ID"""
        async with async_session_maker() as session:
            result = await session.execute(
                select(Ticket).where(Ticket.ticket_id == ticket_id)
            )
            ticket = result.scalar_one_or_none()

            if not ticket:
                return None

            return self._ticket_to_dict(ticket)

    async def get_all_tickets(
        self,
        status: str = None,
        category: str = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict]:
        """Get all tickets with filters"""
        async with async_session_maker() as session:
            query = select(Ticket)

            if status:
                query = query.where(Ticket.status == status)
            if category:
                query = query.where(Ticket.category == category)

            query = query.order_by(Ticket.created_at.desc()).limit(limit).offset(offset)

            result = await session.execute(query)
            tickets = result.scalars().all()

            return [self._ticket_to_dict(t) for t in tickets]

    async def get_user_tickets(self, external_id: str = None, customer_email: str = None) -> List[Dict]:
        """Get tickets for specific user"""
        async with async_session_maker() as session:
            query = select(Ticket)

            if external_id:
                query = query.where(Ticket.external_id.like(f"%{external_id}%"))
            elif customer_email:
                query = query.where(Ticket.customer_email == customer_email)
            else:
                return []

            query = query.order_by(Ticket.created_at.desc()).limit(10)

            result = await session.execute(query)
            tickets = result.scalars().all()

            return [self._ticket_to_dict(t) for t in tickets]

    async def get_stats(self) -> Dict:
        """Get dashboard statistics"""
        async with async_session_maker() as session:
            # Total tickets
            total_result = await session.execute(select(func.count(Ticket.id)))
            total = total_result.scalar()

            # Auto-resolved
            auto_result = await session.execute(
                select(func.count(Ticket.id)).where(Ticket.auto_resolved == True)
            )
            auto_resolved = auto_result.scalar()

            # By status
            status_result = await session.execute(
                select(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status)
            )
            by_status = {row[0]: row[1] for row in status_result}

            # By category
            category_result = await session.execute(
                select(Ticket.category, func.count(Ticket.id)).group_by(Ticket.category)
            )
            by_category = {row[0]: row[1] for row in category_result}

            # By priority
            priority_result = await session.execute(
                select(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority)
            )
            by_priority = {row[0]: row[1] for row in priority_result}

            return {
                "total_tickets": total or 0,
                "auto_resolved": auto_resolved or 0,
                "auto_resolved_percentage": (auto_resolved / total * 100) if total > 0 else 0,
                "by_status": by_status,
                "by_category": by_category,
                "by_priority": by_priority,
                "active_tickets": by_status.get("new", 0) + by_status.get("in_progress", 0)
            }

    @staticmethod
    def _ticket_to_dict(ticket: Ticket) -> Dict:
        """Convert ticket model to dictionary"""
        return {
            "id": ticket.id,
            "ticket_id": ticket.ticket_id,
            "title": ticket.title,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "category": ticket.category,
            "channel": ticket.channel,
            "assigned_department": ticket.assigned_department,
            "assigned_to": ticket.assigned_to,
            "customer_name": ticket.customer_name,
            "customer_email": ticket.customer_email,
            "ai_confidence": ticket.ai_confidence,
            "auto_resolved": ticket.auto_resolved,
            "ai_response": ticket.ai_response,
            "language": ticket.language,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
            "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
        }


# Singleton instance
ticket_service = TicketService()
