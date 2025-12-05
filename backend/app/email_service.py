"""Email Service for IMAP/SMTP integration"""
import asyncio
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from aioimaplib import aioimaplib
import aiosmtplib
from app.config import settings
from app.ticket_service import ticket_service
from typing import Optional
import re


class EmailService:
    """Email service for receiving and sending emails"""

    def __init__(self):
        self.email_address = settings.EMAIL_ADDRESS
        self.email_password = settings.EMAIL_PASSWORD
        self.imap_server = settings.EMAIL_IMAP_SERVER
        self.smtp_server = settings.EMAIL_SMTP_SERVER
        self.imap_port = settings.EMAIL_IMAP_PORT
        self.smtp_port = settings.EMAIL_SMTP_PORT
        self.check_interval = settings.EMAIL_CHECK_INTERVAL

        self.imap_client: Optional[aioimaplib.IMAP4_SSL] = None
        self.is_running = False
        self.task: Optional[asyncio.Task] = None

    async def connect_imap(self) -> bool:
        """Connect to IMAP server"""
        try:
            self.imap_client = aioimaplib.IMAP4_SSL(host=self.imap_server, port=self.imap_port)
            await self.imap_client.wait_hello_from_server()
            await self.imap_client.login(self.email_address, self.email_password)
            await self.imap_client.select('INBOX')
            print(f"✅ Connected to IMAP: {self.email_address}")
            return True
        except Exception as e:
            print(f"❌ IMAP connection error: {e}")
            return False

    async def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Send email via SMTP"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = self.email_address
            message["To"] = to_email
            message["Subject"] = subject

            # Add body
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2563eb;">DataPhase AI Support</h2>
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                            {body.replace(chr(10), '<br>')}
                        </div>
                        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                            Это автоматическое сообщение от системы поддержки DataPhase AI.
                        </p>
                    </div>
                </body>
            </html>
            """

            part1 = MIMEText(body, "plain")
            part2 = MIMEText(html_body, "html")
            message.attach(part1)
            message.attach(part2)

            # Send
            await aiosmtplib.send(
                message,
                hostname=self.smtp_server,
                port=self.smtp_port,
                username=self.email_address,
                password=self.email_password,
                use_tls=True
            )

            print(f"📧 Email sent to {to_email}")
            return True

        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return False

    def extract_email_info(self, raw_email: bytes) -> dict:
        """Extract information from raw email"""
        try:
            msg = email.message_from_bytes(raw_email)

            # Get sender
            from_header = msg.get("From", "")
            email_match = re.search(r'<(.+?)>', from_header)
            sender_email = email_match.group(1) if email_match else from_header

            # Get name
            sender_name = from_header.split('<')[0].strip().strip('"') if '<' in from_header else sender_email

            # Get subject
            subject = msg.get("Subject", "Без темы")

            # Get message ID
            message_id = msg.get("Message-ID", "")

            # Get body
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        break
            else:
                body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')

            return {
                "from_email": sender_email,
                "from_name": sender_name,
                "subject": subject,
                "body": body.strip(),
                "message_id": message_id
            }

        except Exception as e:
            print(f"Error parsing email: {e}")
            return None

    async def check_new_emails(self):
        """Check for new unread emails"""
        try:
            # Search for unread emails
            status, messages = await self.imap_client.search('UNSEEN')

            if status != 'OK' or not messages or messages == [b'']:
                return

            # Get message IDs
            message_ids = messages[0].split()

            for msg_id in message_ids:
                try:
                    # Fetch email
                    status, msg_data = await self.imap_client.fetch(msg_id, '(RFC822)')

                    if status != 'OK':
                        continue

                    # Parse email
                    raw_email = msg_data[1]
                    email_info = self.extract_email_info(raw_email)

                    if not email_info:
                        continue

                    print(f"📨 New email from {email_info['from_email']}: {email_info['subject']}")

                    # Process ticket
                    result = await ticket_service.process_message(
                        title=email_info['subject'],
                        description=email_info['body'],
                        channel="email",
                        customer_name=email_info['from_name'],
                        customer_email=email_info['from_email'],
                        external_id=email_info['message_id'],
                        language="ru"
                    )

                    # Send auto-response
                    response_subject = f"Re: {email_info['subject']}"
                    response_body = f"{result['ai_response']}\n\n"
                    response_body += f"ID заявки: {result['ticket_id']}\n\n"

                    if result['auto_resolved']:
                        response_body += "Ваша заявка решена автоматически."
                    else:
                        response_body += "Ваша заявка передана специалисту. Мы свяжемся с вами в ближайшее время."

                    await self.send_email(
                        to_email=email_info['from_email'],
                        subject=response_subject,
                        body=response_body
                    )

                    # Mark as read
                    await self.imap_client.store(msg_id, '+FLAGS', '\\Seen')

                except Exception as e:
                    print(f"Error processing email {msg_id}: {e}")
                    continue

        except Exception as e:
            print(f"Error checking emails: {e}")

    async def email_listener_loop(self):
        """Main loop for checking emails"""
        print(f"📧 Email listener started. Checking every {self.check_interval}s")

        while self.is_running:
            try:
                await self.check_new_emails()
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                print(f"Error in email loop: {e}")
                # Try to reconnect
                await asyncio.sleep(5)
                await self.connect_imap()

    async def start(self):
        """Start email listener"""
        if not self.email_address or not self.email_password:
            print("⚠️  Email credentials not configured. Skipping email integration.")
            return

        print("🚀 Starting email service...")

        # Connect to IMAP
        connected = await self.connect_imap()
        if not connected:
            print("❌ Failed to start email service")
            return

        # Start listener loop
        self.is_running = True
        self.task = asyncio.create_task(self.email_listener_loop())

        print("✅ Email service started successfully!")

    async def stop(self):
        """Stop email listener"""
        if self.is_running:
            print("Stopping email service...")
            self.is_running = False

            if self.task:
                self.task.cancel()
                try:
                    await self.task
                except asyncio.CancelledError:
                    pass

            if self.imap_client:
                try:
                    await self.imap_client.logout()
                except:
                    pass

            print("✅ Email service stopped")


# Singleton instance
email_service = EmailService()
