"""ChromaDB Vector Database for Knowledge Base"""
import chromadb
from chromadb.config import Settings
from typing import List, Dict
from app.gemini_service import gemini_service
import os


class KnowledgeBase:
    """Vector database for FAQ and knowledge base"""

    def __init__(self):
        # Create data directory if not exists
        os.makedirs("./data", exist_ok=True)

        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(
            path="./data/chromadb",
            settings=Settings(anonymized_telemetry=False)
        )

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="helpdesk_kb",
            metadata={"description": "Help Desk Knowledge Base"}
        )

    async def add_faq(
        self,
        question: str,
        answer: str,
        category: str,
        language: str = "ru",
        metadata: Dict = None
    ) -> str:
        """Add FAQ entry to knowledge base"""

        # Create embedding
        embedding = await gemini_service.create_embedding(question)

        # Create unique ID
        doc_id = f"{category}_{language}_{hash(question) % 100000}"

        # Prepare metadata
        meta = {
            "category": category,
            "language": language,
            "answer": answer
        }
        if metadata:
            meta.update(metadata)

        # Add to collection
        self.collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[question],
            metadatas=[meta]
        )

        return doc_id

    async def search_similar(
        self,
        query: str,
        category: str = None,
        language: str = "ru",
        top_k: int = 3
    ) -> List[Dict]:
        """
        Search for similar questions in knowledge base

        Returns:
            List of {question, answer, category, distance}
        """

        # Create query embedding
        query_embedding = await gemini_service.create_embedding(query)

        # Prepare filter
        where = {"language": language}
        if category:
            where["category"] = category

        # Search
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where if where else None
        )

        # Format results
        faqs = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                metadata = results['metadatas'][0][i]
                faqs.append({
                    "question": doc,
                    "answer": metadata.get("answer", ""),
                    "category": metadata.get("category", "general"),
                    "distance": results['distances'][0][i] if results.get('distances') else 0
                })

        return faqs

    async def load_default_kb(self):
        """Load default knowledge base entries"""
        default_faqs = [
            # Доступ
            {
                "question": "Не могу войти в личный кабинет, забыл пароль",
                "answer": "Для сброса пароля:\n1. Нажмите 'Забыли пароль?' на странице входа\n2. Введите ваш email\n3. Перейдите по ссылке из письма\n4. Установите новый пароль\n\nЕсли письмо не пришло, проверьте папку Спам.",
                "category": "access",
                "language": "ru"
            },
            {
                "question": "Пишет неверный логин или пароль при входе",
                "answer": "Проверьте:\n1. Правильно ли введен email (без пробелов)\n2. Включен ли Caps Lock\n3. Правильная ли раскладка клавиатуры\n\nЕсли проблема сохраняется, используйте функцию 'Забыли пароль?' для сброса.",
                "category": "access",
                "language": "ru"
            },
            {
                "question": "Не приходит письмо для восстановления пароля",
                "answer": "1. Проверьте папку Спам/Нежелательная почта\n2. Подождите 5-10 минут\n3. Проверьте правильность введенного email\n4. Попробуйте запросить письмо повторно\n\nЕсли не помогло, напишите нам на support@dataphase.ai",
                "category": "access",
                "language": "ru"
            },

            # Технические
            {
                "question": "Не загружается страница, выдает ошибку 500",
                "answer": "Попробуйте:\n1. Обновить страницу (F5 или Ctrl+R)\n2. Очистить кэш браузера (Ctrl+Shift+Delete)\n3. Попробовать другой браузер\n4. Проверить интернет-соединение\n\nЕсли ошибка повторяется, сообщите нам точный текст ошибки.",
                "category": "technical",
                "language": "ru"
            },
            {
                "question": "Медленно работает сайт, долго грузится",
                "answer": "Рекомендации:\n1. Проверьте скорость интернета\n2. Закройте лишние вкладки браузера\n3. Очистите кэш браузера\n4. Отключите расширения браузера\n5. Попробуйте другой браузер\n\nДля лучшей производительности используйте Chrome или Firefox последних версий.",
                "category": "technical",
                "language": "ru"
            },
            {
                "question": "Не открывается отчет, ошибка при скачивании файла",
                "answer": "1. Проверьте место на диске\n2. Попробуйте другой формат файла (PDF/Excel)\n3. Отключите блокировщик рекламы\n4. Проверьте настройки скачивания в браузере\n\nЕсли не помогло, укажите название отчета и формат файла.",
                "category": "technical",
                "language": "ru"
            },

            # Финансы
            {
                "question": "Какие тарифы у вас есть, сколько стоит",
                "answer": "Наши тарифные планы:\n\n• Базовый: 5000 ₸/мес\n  - До 100 заявок\n  - Email поддержка\n\n• Стандарт: 15000 ₸/мес\n  - До 500 заявок\n  - Email + чат\n  - Аналитика\n\n• Премиум: 35000 ₸/мес\n  - Безлимитные заявки\n  - Все каналы\n  - AI-автоответы\n\nПодробнее на странице Тарифы или свяжитесь с менеджером.",
                "category": "billing",
                "language": "ru"
            },
            {
                "question": "Как оплатить, какие способы оплаты",
                "answer": "Принимаем оплату:\n• Банковские карты (Visa, MasterCard, МИР)\n• Kaspi Gold\n• Банковский перевод для юрлиц\n• Kaspi QR\n\nОплата происходит через защищенный шлюз. Счет выставляется автоматически.",
                "category": "billing",
                "language": "ru"
            },
            {
                "question": "Как получить счет на оплату для бухгалтерии",
                "answer": "Для выставления счета:\n1. Войдите в Настройки → Биллинг\n2. Нажмите 'Запросить счет'\n3. Укажите реквизиты компании (БИН, название, адрес)\n4. Счет придет на email в течение 1 рабочего дня\n\nДля срочного выставления счета напишите на billing@dataphase.ai",
                "category": "billing",
                "language": "ru"
            },

            # Общие
            {
                "question": "Как добавить нового пользователя в систему",
                "answer": "Добавление пользователя:\n1. Перейдите в Настройки → Пользователи\n2. Нажмите 'Добавить пользователя'\n3. Введите email и роль\n4. Нажмите 'Отправить приглашение'\n\nПользователь получит письмо с инструкцией для входа.",
                "category": "general",
                "language": "ru"
            },
            {
                "question": "Как изменить настройки уведомлений",
                "answer": "Настройка уведомлений:\n1. Настройки → Уведомления\n2. Выберите типы уведомлений:\n   - Email уведомления\n   - Push уведомления\n   - Telegram уведомления\n3. Настройте частоту (мгновенно/раз в час/раз в день)\n4. Сохраните изменения",
                "category": "general",
                "language": "ru"
            }
        ]

        # Add all FAQs
        for faq in default_faqs:
            await self.add_faq(
                question=faq["question"],
                answer=faq["answer"],
                category=faq["category"],
                language=faq["language"]
            )

        print(f"✅ Loaded {len(default_faqs)} default FAQ entries")

    def get_stats(self) -> Dict:
        """Get knowledge base statistics"""
        count = self.collection.count()
        return {
            "total_entries": count,
            "collection_name": self.collection.name
        }


# Singleton instance
knowledge_base = KnowledgeBase()
