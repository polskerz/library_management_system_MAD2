from celery import shared_task
from models.models import db, User, Book, Role, Feedback, Section, Request, user_datastore
import flask_excel as excel
from datetime import datetime, timedelta
from flask import render_template
import csv
from io import StringIO
from emails import send_message, send_admin_report
from jinja2 import Template



@shared_task(ignore_result=False)
def create_monthly_report(user_id):
    thirty_days_ago = datetime.now() - timedelta(days=30)
    user = User.query.get(user_id)
    username = user.username

    requests = Request.query.filter(
        Request.issue_date >= thirty_days_ago,
        Request.user_id == user_id
    ).all()

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(['Request ID', 'Book Title', 'Book Author', 'Issued Date', 'Due Date', 'Return Date', 'Status'])

    def format_date(date):
        return date.strftime('%a, %d %b, %Y, %I:%M:%S %p') if date else 'N/A'

    for req in requests:
        writer.writerow([
            req.request_id,
            req.book.title if req.book else 'N/A',
            req.book.author if req.book else 'N/A',
            format_date(req.issue_date),
            format_date(req.due_date),
            format_date(req.return_date),
            'Revoked' if req.is_revoked else 'Active'
        ])

    filename = f"monthly_report_{username}.csv"

    with open(filename, 'wb') as f:
        f.write(output.getvalue().encode('utf-8'))

    return filename


@shared_task(ignore_result=True)
def daily_reminder():
    users = User.query.filter(User.roles.any(Role.name == 'user')).all()
    subject = "Codexify : Daily Reminder"
    for user in users:
        body = render_template('daily_reminder.html', username=user.username)
        send_message(user.email, subject, body)
    return "OK"


@shared_task(ignore_result=True)
def admin_monthly_report():
    thirty_days_ago = datetime.now() - timedelta(days=30)
    admins = User.query.filter(User.roles.any(Role.name == 'admin')).all()
    requests = Request.query.filter(Request.issue_date >= thirty_days_ago).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Request ID', 'Book Title', 'Book Author', 'Issued Date', 'Due Date', 'Return Date', 'Status'])

    def format_date(date):
        return date.strftime('%a, %d %b, %Y, %I:%M:%S %p') if date else 'N/A'

    for req in requests:
        writer.writerow([
            req.request_id,
            req.book.title if req.book else 'N/A',
            req.book.author if req.book else 'N/A',
            format_date(req.issue_date),
            format_date(req.due_date),
            format_date(req.return_date),
            'Revoked' if req.is_revoked else 'Active'
        ])

    user_count = User.query.filter(User.roles.any(Role.name == 'user')).count()
    admin_count = User.query.filter(User.roles.any(Role.name == 'admin')).count()
    issued_count = Request.query.filter(
        Request.return_date == None,
        Request.is_revoked == False,
        Request.issue_date >= thirty_days_ago
    ).count()
    returned_count = Request.query.filter(
        Request.return_date.isnot(None),
        Request.is_revoked == False,
        Request.return_date >= thirty_days_ago
    ).count()
    revoked_count = Request.query.filter(
        Request.is_revoked == True,
        Request.issue_date >= thirty_days_ago
    ).count()
    sections = Section.query.all()
    section_names = [section.name for section in sections]
    books_count = [Book.query.filter_by(section_id=section.section_id).count() for section in sections]

    for admin in admins:
        filename = f"monthly_report_{admin.username}.csv"
        with open(filename, 'wb') as f:
            f.write(output.getvalue().encode('utf-8'))
        
        subject = "Codexify: Admin Monthly Report"
        body = render_template('admin_report.html', 
                               username=admin.username, 
                               requests=requests, 
                               user_count=user_count, 
                               admin_count=admin_count, 
                               issued_count=issued_count, 
                               returned_count=returned_count, 
                               revoked_count=revoked_count, 
                               section_names=section_names, 
                               books_count=books_count)
        
        send_admin_report(admin.email, subject, body, attachments=[(filename, 'csv')])
