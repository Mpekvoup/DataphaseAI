# DataPhase AI Help Desk - Backend

AI-powered help desk system with Gemini integration, multi-channel support (Email, Telegram, Web Portal).

## 🚀 Быстрый запуск для хакатона

### 1. Установка зависимостей

```bash
cd backend
pip install -r requirements.txt
```

### 2. Настройка Telegram Bot (опционально, 2 минуты)

1. Откройте Telegram, найдите **@BotFather**
2. Отправьте команду `/newbot`
3. Введите имя бота: `DataPhase Support Bot`
4. Введите username: `dataphase_support_bot` (или любой доступный)
5. **Скопируйте токен** (выглядит как `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
6. Вставьте токен в файл `.env`:
   ```
   TELEGRAM_BOT_TOKEN=ваш_токен_здесь
   ```

### 3. Настройка Email (опционально)

Если хотите демонстрировать Email канал:

1. Создайте новый Gmail или используйте существующий
2. Включите 2FA (двухфакторную аутентификацию)
3. Создайте App Password:
   - Google Account → Security → 2-Step Verification → App passwords
4. Скопируйте пароль приложения в `.env`:
   ```
   EMAIL_ADDRESS=your-email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

### 4. Запуск сервера

```bash
python -m app.main
```

Или используйте uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📊 API Endpoints

### Tickets
- `POST /api/tickets` - создать заявку
- `GET /api/tickets` - получить список заявок
- `GET /api/tickets/{id}` - получить заявку по ID
- `GET /api/stats` - статистика дашборда

### Knowledge Base
- `POST /api/knowledge-base` - добавить FAQ
- `GET /api/knowledge-base/search` - поиск по базе знаний
- `GET /api/knowledge-base/stats` - статистика БЗ

### AI
- `POST /api/ai/classify` - классификация текста
- `POST /api/ai/generate-response` - генерация ответа

### System
- `GET /health` - статус системы
- `GET /` - информация об API

## 🎯 Демонстрация на хакатоне

### Сценарий 1: Telegram Bot

1. Запустите сервер
2. Найдите бота в Telegram
3. Отправьте: "Не могу войти в систему"
4. Покажите жюри:
   - Мгновенный ответ от ИИ
   - Заявка появилась в веб-интерфейсе
   - Автоматическая классификация

### Сценарий 2: Web Portal

1. Откройте фронтенд
2. Создайте заявку через веб-форму
3. Покажите обработку в реальном времени

### Сценарий 3: Email (если настроено)

1. Отправьте email на support адрес
2. Через 30 сек заявка появится в системе
3. Автоответ придет на email

## 🔧 Технологии

- **FastAPI** - веб-фреймворк
- **Google Gemini 1.5 Flash** - NLP и генерация ответов
- **ChromaDB** - векторная база знаний
- **SQLAlchemy** - ORM для SQLite
- **python-telegram-bot** - Telegram интеграция
- **aiosmtplib / aioimaplib** - Email интеграция

## 📝 База знаний

По умолчанию загружается 11 FAQ по категориям:
- **Доступ**: проблемы со входом, паролем
- **Технические**: ошибки, производительность
- **Финансы**: тарифы, оплата, счета
- **Общие**: пользователи, настройки

Можно добавлять свои через API или напрямую в `app/knowledge_base.py`.

## 🐛 Troubleshooting

### Ошибка: "Gemini API error"
- Проверьте API ключ в `.env`
- Убедитесь что есть интернет

### Telegram бот не отвечает
- Проверьте токен в `.env`
- Убедитесь что сервер запущен
- Проверьте логи в консоли

### Email не работает
- Проверьте App Password (не обычный пароль!)
- Включите IMAP в настройках Gmail
- Проверьте логи

## 📧 Контакты

Для вопросов: support@dataphase.ai
