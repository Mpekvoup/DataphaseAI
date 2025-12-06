"""Initialize default admin user"""
from app.auth_service import auth_service
from app.database import async_session_maker
from sqlalchemy import select
from app.database import User


# Default admin credentials
DEFAULT_ADMIN_EMAIL = "admin@dataphase.ai"
DEFAULT_ADMIN_PASSWORD = "admin123456"
DEFAULT_ADMIN_NAME = "System Administrator"


async def create_default_admin():
    """Create default admin user if it doesn't exist"""
    try:
        async with async_session_maker() as session:
            # Check if admin exists
            result = await session.execute(
                select(User).where(User.email == DEFAULT_ADMIN_EMAIL)
            )
            existing_admin = result.scalar_one_or_none()

            if existing_admin:
                print(f"✅ Admin user already exists: {DEFAULT_ADMIN_EMAIL}")
                return

            # Create admin user
            admin_user = await auth_service.register_user(
                email=DEFAULT_ADMIN_EMAIL,
                password=DEFAULT_ADMIN_PASSWORD,
                full_name=DEFAULT_ADMIN_NAME,
                role="admin"
            )

            if admin_user:
                print("=" * 60)
                print("🎉 DEFAULT ADMIN USER CREATED!")
                print("=" * 60)
                print(f"📧 Email:    {DEFAULT_ADMIN_EMAIL}")
                print(f"🔑 Password: {DEFAULT_ADMIN_PASSWORD}")
                print("=" * 60)
                print("⚠️  ВАЖНО: Смените пароль после первого входа!")
                print("=" * 60)
            else:
                print("❌ Failed to create admin user")

    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
