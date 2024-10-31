from flask import Flask, jsonify
from config import Config
from flask_cors import CORS, cross_origin
from worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab

app = Flask(__name__)
CORS(app, support_credentials=True)
app.config.from_object(Config)
from routes.routes import api
app.register_blueprint(api)

from routes.tasks import daily_reminder
from routes.tasks import admin_monthly_report
celery_app = celery_init_app(app)

excel.init_excel(app)

from redis_cache import cache
cache.init_app(app)

@celery_app.on_after_configure.connect
def send_mail(sender, **kwargs):
    sender.add_periodic_task(crontab( hour=19, minute=00 ), daily_reminder.s())

@celery_app.on_after_configure.connect
def send_admin_mail(sender, **kwargs):
    sender.add_periodic_task(crontab( hour=00, minute=00, day_of_month=30), admin_monthly_report.s())

if __name__ == '__main__':
    app.run()
