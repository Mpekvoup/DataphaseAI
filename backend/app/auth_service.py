"""Authentication Service for JWT and password handling"""
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import User, async_session_maker
from app.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


class AuthService:
    """Service for user authentication and JWT management"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt (max 72 bytes)"""
        # Bcrypt has a 72 byte limit, truncate if necessary
        password_bytes = password.encode('utf-8')[:72]
        return pwd_context.hash(password_bytes.decode('utf-8', errors='ignore'))

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        # Bcrypt has a 72 byte limit, truncate if necessary
        password_bytes = plain_password.encode('utf-8')[:72]
        return pwd_context.verify(password_bytes.decode('utf-8', errors='ignore'), hashed_password)

    @staticmethod
    def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create JWT access token

        Args:
            data: Data to encode in token (typically {"sub": user_email})
            expires_delta: Token expiration time

        Returns:
            Encoded JWT token string
        """
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    async def verify_token(token: str) -> Optional[str]:
        """
        Verify JWT token and extract user email

        Args:
            token: JWT token string

        Returns:
            User email if valid, None if invalid
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                return None
            return email
        except JWTError:
            return None

    async def register_user(
        self,
        email: str,
        password: str,
        full_name: str,
        role: str = "user"
    ) -> Optional[Dict]:
        """
        Register a new user

        Args:
            email: User email
            password: Plain text password
            full_name: User's full name
            role: User role (user, operator, admin)

        Returns:
            User data dict if successful, None if email already exists
        """
        async with async_session_maker() as session:
            # Check if user already exists
            result = await session.execute(
                select(User).where(User.email == email)
            )
            existing_user = result.scalar_one_or_none()

            if existing_user:
                return None

            # Create new user
            hashed_password = self.hash_password(password)
            new_user = User(
                email=email,
                hashed_password=hashed_password,
                full_name=full_name,
                role=role,
                is_active=True
            )

            session.add(new_user)
            await session.commit()
            await session.refresh(new_user)

            return self._user_to_dict(new_user)

    async def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """
        Authenticate user with email and password

        Args:
            email: User email
            password: Plain text password

        Returns:
            User data dict if authentication successful, None otherwise
        """
        async with async_session_maker() as session:
            result = await session.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()

            if not user:
                return None

            if not user.is_active:
                return None

            if not self.verify_password(password, user.hashed_password):
                return None

            # Update last login
            user.last_login = datetime.utcnow()
            await session.commit()

            return self._user_to_dict(user)

    async def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        async with async_session_maker() as session:
            result = await session.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()

            if not user:
                return None

            return self._user_to_dict(user)

    async def get_user_by_telegram_id(self, telegram_id: str) -> Optional[Dict]:
        """Get user by Telegram ID"""
        async with async_session_maker() as session:
            result = await session.execute(
                select(User).where(User.telegram_id == telegram_id)
            )
            user = result.scalar_one_or_none()

            if not user:
                return None

            return self._user_to_dict(user)

    @staticmethod
    def _user_to_dict(user: User) -> Dict:
        """Convert user model to dictionary (without password)"""
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "telegram_id": user.telegram_id,
            "telegram_username": user.telegram_username,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None
        }


# Singleton instance
auth_service = AuthService()
