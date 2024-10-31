from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders


SMTP_HOST = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = "paul@email.com"
SENDER_PASSWORD = ""
    

def send_message(to, subject, html_body):
    msg = MIMEMultipart()
    msg["To"] = to
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg.attach(MIMEText(html_body, 'html'))
    client = SMTP(host=SMTP_HOST, port=SMTP_PORT)
    client.send_message(msg=msg)
    client.quit()

def send_admin_report(to, subject, html_body, attachments=[]):
    msg = MIMEMultipart()
    msg["To"] = to
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg.attach(MIMEText(html_body, 'html'))  

    for attachment in attachments:
        filename, mimetype = attachment
        if mimetype == 'csv':
            with open(filename, 'rb') as f:
                part = MIMEBase('admin_monthly_report', mimetype)
                part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename="{filename}"')
            msg.attach(part)
    
    client = SMTP(host=SMTP_HOST, port=SMTP_PORT)
    client.send_message(msg=msg)
    client.quit()