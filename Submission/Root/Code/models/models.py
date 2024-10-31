from flask_sqlalchemy import SQLAlchemy
import pytz
from flask_security import UserMixin, RoleMixin, hash_password
from app import app
import uuid
from flask_migrate import Migrate
from datetime import datetime
from flask_security import Security, SQLAlchemyUserDatastore

db = SQLAlchemy(app)
migrate = Migrate(app, db)

ist = pytz.timezone('Asia/Kolkata')
def get_ist_date():
    return datetime.now(ist).date()

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    role_user_id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.user_id'))
    role_id = db.Column(db.Integer(), db.ForeignKey('role.role_id'))

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    date_created = db.Column(db.Date, nullable=True, default=get_ist_date)
    name = db.Column(db.String(100), nullable=True)
    active = db.Column(db.Boolean(), default=True)
    password = db.Column(db.String(512), nullable=False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref('users', lazy='dynamic'))

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "name": self.name,
            "active": self.active,
            "date_created": self.date_created,
            "password": self.password,
            "email": self.email,
            "role": self.roles[0].name,
        }


class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    role_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Book(db.Model):
    __tablename__ = 'book'
    book_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    content = db.Column(db.LargeBinary, nullable=True)
    publisher = db.Column(db.String(50), nullable=False)
    published_date = db.Column(db.Date, nullable=False, default=get_ist_date)
    section_id = db.Column(db.Integer(), db.ForeignKey('section.section_id'), nullable=False)

    def to_dict(self):
        return {
            "book_id": self.book_id,
            "title": self.title,
            "author": self.author,
            "publisher": self.publisher,
            "published_date": self.published_date,
            "section_id": self.section_id
        }

class Section(db.Model):
    __tablename__ = 'section'
    section_id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    date_created = db.Column(db.Date, nullable=False, default=get_ist_date)
    description = db.Column(db.String(1000))
    books = db.relationship('Book', backref='section', lazy=True)

    def to_dict(self):
        return {
            "section_id": self.section_id,
            "name": self.name,
            "date_created": self.date_created,
            "description": self.description,
            "books": [book.to_dict() for book in self.books]
        }

class Request(db.Model):
    __tablename__ = 'request'
    request_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.user_id'), nullable=False)
    book_id = db.Column(db.Integer(), db.ForeignKey('book.book_id'), nullable=False)
    section_id = db.Column(db.Integer(), db.ForeignKey('section.section_id'), nullable=False)
    issue_date = db.Column(db.DateTime, nullable=False, default=get_ist_date)
    due_date = db.Column(db.DateTime, nullable=False)
    return_date = db.Column(db.DateTime)
    is_revoked = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "request_id": self.request_id,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "section_id": self.section_id,
            "issue_date": self.issue_date,
            "due_date": self.due_date,
            "return_date": self.return_date,
            "is_revoked": self.is_revoked,
            "user": self.user.to_dict(),
            "book": self.book.to_dict(),
            "section": self.section.to_dict()
        }

    user = db.relationship('User', backref='requests', lazy=True)
    book = db.relationship('Book', backref='requests', lazy=True)
    section = db.relationship('Section', backref='requests', lazy=True)

class Feedback(db.Model):
    __tablename__ = 'feedback'
    feedback_id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(db.Date, nullable=False, default=get_ist_date)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'), nullable=False)
    feedback = db.Column(db.String(1000), nullable=False)

    def to_dict(self):
        return {
            "feedback_id": self.feedback_id,
            "date_created": self.date_created,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "feedback": self.feedback,
            "user": self.user.to_dict(),
        }

    user = db.relationship('User', backref='feedbacks', lazy=True)
    book = db.relationship('Book', backref='feedbacks', lazy=True)

user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)

def init_db():
    db.create_all()

    if not Role.query.filter_by(name='admin').first():
        admin_role = Role(name='admin', description='Administrator role')
        db.session.add(admin_role)
        db.session.commit()
    
    if not Role.query.filter_by(name='user').first():
        user_role = Role(name='user', description='User role')
        db.session.add(user_role)
        db.session.commit()
    
    if not User.query.first():
        admin_user = user_datastore.create_user(username='admin', name='admin', email='admin@example.com', password=hash_password('admin'), active=True)
        db.session.commit()
        user_datastore.add_role_to_user(admin_user, 'admin')
        db.session.commit()

    if User.query.count() == 1:  # Only the admin user exists
        default_user = user_datastore.create_user(username='user', name='user', email='user@example.com', password=hash_password('user'), active=True)
        db.session.commit()
        user_datastore.add_role_to_user(default_user, 'user')
        db.session.commit()
        deactivated_user = user_datastore.create_user(username='deactivated', name='deactivated', email='deactivated@example.com', password=hash_password('deactivated'), active=False)
        db.session.commit()
        user_datastore.add_role_to_user(deactivated_user, 'user')
        db.session.commit()

        if not Section.query.first():
            initial_sections = [
                Section(name='Science Fiction', date_created=datetime(2023, 1, 1).date(), description='Explore imaginative and futuristic concepts in science fiction.'),
                Section(name='Biography', date_created=datetime(2023, 4, 1).date(), description='Detailed accounts of individuals’ lives and achievements.'),
                Section(name='Fantasy', date_created=datetime(2023, 5, 1).date(), description='Immerse yourself in magical worlds and fantastical adventures.')
            ]
            db.session.bulk_save_objects(initial_sections)
            db.session.commit()

        if not Book.query.first():
            initial_books = [
                Book(title='Dune', author='Frank Herbert', content=None, publisher='Chilton Books', published_date=datetime(1965, 8, 1).date(), section_id=1),
                Book(title='Neuromancer', author='William Gibson', content=None, publisher='Ace Books', published_date=datetime(1984, 7, 1).date(), section_id=1),
                Book(title='The Diary of a Young Girl', author='Anne Frank', content=None, publisher='Contact Publishing', published_date=datetime(1947, 6, 25).date(), section_id=2),
                Book(title='Long Walk to Freedom', author='Nelson Mandela', content=None, publisher='Little, Brown and Company', published_date=datetime(1994, 11, 2).date(), section_id=2),
                Book(title='The Hobbit', author='J.R.R. Tolkien', content=None, publisher='George Allen & Unwin', published_date=datetime(1937, 9, 21).date(), section_id=3),
                Book(title='Harry Potter and the Sorcerer\'s Stone', author='J.K. Rowling', content=None, publisher='Bloomsbury', published_date=datetime(1997, 6, 26).date(), section_id=3)
            ]
            db.session.bulk_save_objects(initial_books)
            db.session.commit()

with app.app_context():
    init_db()