"""Gemini AI Service for NLP processing"""
import google.generativeai as genai
from typing import Dict, Optional, List
import json
from app.config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    """Service for interacting with Gemini AI"""

    def __init__(self):
        # Use Gemini 1.5 Flash for fast responses
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.embedding_model = 'models/text-embedding-004'

    async def classify_ticket(self, title: str, description: str, language: str = "ru") -> Dict:
        """
        Classify ticket into category, priority, and department

        Returns:
            {
                "category": "technical|billing|access|general|complaint|feature_request",
                "priority": "low|medium|high|urgent",
                "department": "IT Support|Billing|Customer Success|Tech Team",
                "confidence": 0.0-1.0
            }
        """
        prompt = f"""
Ты - система классификации заявок техподдержки.

ЗАЯВКА:
Тема: {title}
Описание: {description}

ЗАДАЧА: Классифицируй заявку по следующим параметрам:

1. КАТЕГОРИЯ (выбери ОДНУ):
   - technical: технические проблемы, ошибки, баги, сайт не работает
   - billing: вопросы по оплате, тарифам, счетам, деньгам
   - access: проблемы с доступом, паролем, авторизацией, входом
   - general: общие вопросы, информация
   - complaint: жалобы, недовольство
   - feature_request: запрос новой функции

2. ПРИОРИТЕТ (ВНИМАТЕЛЬНО выбери по критериям):
   - urgent: КРИТИЧНО! Работа полностью остановлена, потеря данных, серьезные ошибки, безопасность под угрозой
   - high: ВАЖНО! Мешает работе, требует срочного решения, влияет на бизнес
   - medium: Стандартный вопрос, не срочно, но требует ответа
   - low: Некритично, информационный вопрос, можно подождать

ПРИМЕРЫ ПРИОРИТЕТОВ:
   - "Сайт не работает, выдает ошибку 500" → urgent
   - "Не могу войти в систему, забыл пароль" → high
   - "Хочу узнать про тарифы" → low
   - "Как добавить пользователя?" → medium
   - "Потерял все данные" → urgent
   - "Медленно грузится страница" → medium

3. ОТДЕЛ:
   - IT Support: проблемы с доступом, паролями
   - Tech Team: технические ошибки, баги
   - Billing: вопросы по оплате
   - Customer Success: общие вопросы, жалобы

4. УВЕРЕННОСТЬ: от 0.0 до 1.0

ВАЖНО: Верни ТОЛЬКО валидный JSON без каких-либо дополнительных текстов!

{{
    "category": "...",
    "priority": "...",
    "department": "...",
    "confidence": 0.X
}}
"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()

            # Extract JSON from response
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            result = json.loads(text)

            # Validate priority
            valid_priorities = ["low", "medium", "high", "urgent"]
            if result.get("priority") not in valid_priorities:
                print(f"Invalid priority: {result.get('priority')}, using medium")
                result["priority"] = "medium"

            print(f"✅ Classified ticket: {result}")
            return result
        except Exception as e:
            print(f"Error in classify_ticket: {e}")
            print(f"Response text: {text if 'text' in locals() else 'N/A'}")
            # Fallback classification
            return {
                "category": "general",
                "priority": "medium",
                "department": "Customer Success",
                "confidence": 0.5
            }

    async def generate_response(
        self,
        ticket_description: str,
        similar_faqs: List[Dict],
        category: str,
        language: str = "ru"
    ) -> Dict:
        """
        Generate response to ticket based on knowledge base

        Args:
            ticket_description: Customer's question/issue
            similar_faqs: List of similar questions from knowledge base
            category: Ticket category
            language: Response language (ru/kk)

        Returns:
            {
                "response": "Generated answer",
                "can_auto_resolve": True/False,
                "confidence": 0.0-1.0
            }
        """

        # Format similar FAQs
        kb_context = "\n".join([
            f"Вопрос: {faq['question']}\nОтвет: {faq['answer']}"
            for faq in similar_faqs[:3]
        ]) if similar_faqs else "База знаний пуста"

        lang_instruction = "на русском языке" if language == "ru" else "на казахском языке"

        prompt = f"""
Ты - дружелюбный помощник техподдержки.

ВОПРОС КЛИЕНТА:
{ticket_description}

ПОХОЖИЕ ВОПРОСЫ ИЗ БАЗЫ ЗНАНИЙ:
{kb_context}

КАТЕГОРИЯ: {category}

ЗАДАЧА:
1. Если вопрос есть в базе знаний - дай точный ответ на основе базы
2. Если вопроса нет в базе - предложи общее решение или скажи что вопрос передан специалисту
3. Будь вежливым и помогающим
4. Отвечай {lang_instruction}

ОЦЕНИ:
- can_auto_resolve: true (если ответ из базы знаний и решает проблему) или false (нужен специалист)
- confidence: от 0.0 до 1.0 (насколько уверен в ответе)

ВЕРНИ JSON:
{{
    "response": "твой ответ клиенту",
    "can_auto_resolve": true/false,
    "confidence": 0.X
}}
"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()

            # Extract JSON
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            result = json.loads(text)
            return result
        except Exception as e:
            print(f"Error in generate_response: {e}")
            return {
                "response": "Спасибо за ваше обращение! Ваша заявка принята и передана специалисту. Мы свяжемся с вами в ближайшее время.",
                "can_auto_resolve": False,
                "confidence": 0.3
            }

    async def create_embedding(self, text: str) -> List[float]:
        """Create embedding vector for text"""
        try:
            result = genai.embed_content(
                model=self.embedding_model,
                content=text,
                task_type="retrieval_query"
            )
            return result['embedding']
        except Exception as e:
            print(f"Error creating embedding: {e}")
            return [0.0] * 768  # Return zero vector on error

    async def summarize_conversation(self, messages: List[str]) -> str:
        """Summarize a conversation for operators"""
        conversation = "\n".join([f"- {msg}" for msg in messages])

        prompt = f"""
Резюмируй эту переписку с клиентом в 2-3 предложения:

{conversation}

Выдели:
1. Суть проблемы
2. Что уже сделано
3. Что нужно сделать
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error in summarize: {e}")
            return "Не удалось создать резюме"

    async def translate_text(self, text: str, target_lang: str) -> str:
        """Translate text to target language (ru/kk)"""
        lang_name = "казахский" if target_lang == "kk" else "русский"

        prompt = f"Переведи следующий текст на {lang_name} язык:\n\n{text}"

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error in translate: {e}")
            return text


# Singleton instance
gemini_service = GeminiService()
