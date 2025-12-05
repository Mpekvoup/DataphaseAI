"""Telegram Bot Integration"""
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from app.config import settings
from app.ticket_service import ticket_service
from typing import Optional
import asyncio


class TelegramBot:
    """Telegram bot for receiving support requests"""

    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.application: Optional[Application] = None
        self.is_running = False

    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        welcome_message = """
🤖 Привет! Я бот техподдержки DataPhase AI.

Отправьте мне ваш вопрос или проблему, и я постараюсь помочь!

Примеры:
• Не могу войти в систему
• Как изменить тариф?
• Ошибка при загрузке файла

Команды:
/start - начать диалог
/help - помощь
/status - статус заявки
        """
        await update.message.reply_text(welcome_message)

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        help_text = """
📋 Как я могу помочь:

1️⃣ Задайте вопрос
   Просто напишите свою проблему обычным сообщением

2️⃣ Получите ответ
   Я проанализирую вопрос и дам ответ из базы знаний

3️⃣ Создание заявки
   Если не смогу помочь сразу - создам заявку для специалиста

Команды:
/start - начать диалог
/help - эта справка
/status - проверить статус заявки
        """
        await update.message.reply_text(help_text)

    async def status_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /status command"""
        user_id = update.effective_user.id
        tickets = await ticket_service.get_user_tickets(external_id=f"telegram_{user_id}")

        if not tickets:
            await update.message.reply_text("У вас нет активных заявок.")
            return

        response = "📊 Ваши заявки:\n\n"
        for ticket in tickets[:5]:  # Show last 5
            status_emoji = {
                "new": "🆕",
                "in_progress": "⏳",
                "resolved": "✅",
                "auto_resolved": "🤖✅"
            }.get(ticket["status"], "📝")

            response += f"{status_emoji} {ticket['ticket_id']}\n"
            response += f"   {ticket['title']}\n"
            response += f"   Статус: {ticket['status']}\n\n"

        await update.message.reply_text(response)

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle incoming messages"""
        user = update.effective_user
        message_text = update.message.text

        # Show typing indicator
        await update.message.chat.send_action("typing")

        try:
            # Create ticket from message
            result = await ticket_service.process_message(
                title=message_text[:100],  # First 100 chars as title
                description=message_text,
                channel="chat",
                customer_name=f"{user.first_name} {user.last_name or ''}".strip() or user.username,
                customer_email=f"telegram_{user.id}@telegram.user",
                external_id=f"telegram_{user.id}",
                language="ru"
            )

            # Send response
            response_text = f"🤖 {result['ai_response']}\n\n"

            if result['auto_resolved']:
                response_text += "✅ Заявка решена автоматически.\n"
                response_text += f"📋 ID заявки: {result['ticket_id']}"
            else:
                response_text += f"📋 Заявка создана: {result['ticket_id']}\n"
                response_text += "👨‍💼 Специалист свяжется с вами в ближайшее время."

            await update.message.reply_text(response_text)

        except Exception as e:
            error_msg = "Извините, произошла ошибка. Попробуйте позже или напишите на support@dataphase.ai"
            await update.message.reply_text(error_msg)
            print(f"Error handling message: {e}")

    async def start(self):
        """Start the bot"""
        if not self.token:
            print("⚠️  Telegram bot token not configured. Skipping Telegram integration.")
            return

        print("🚀 Starting Telegram bot...")

        # Create application
        self.application = Application.builder().token(self.token).build()

        # Add handlers
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("status", self.status_command))
        self.application.add_handler(MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            self.handle_message
        ))

        # Start polling
        await self.application.initialize()
        await self.application.start()
        await self.application.updater.start_polling(drop_pending_updates=True)

        self.is_running = True
        print("✅ Telegram bot started successfully!")

    async def stop(self):
        """Stop the bot"""
        if self.application and self.is_running:
            print("Stopping Telegram bot...")
            await self.application.updater.stop()
            await self.application.stop()
            await self.application.shutdown()
            self.is_running = False
            print("✅ Telegram bot stopped")


# Singleton instance
telegram_bot = TelegramBot()
