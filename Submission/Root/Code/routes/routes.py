from flask import Blueprint, g, request, jsonify, render_template, send_file
from flask_security.utils import verify_password
import io
from functools import wraps
import re, pytz
from app import app
from celery.result import AsyncResult
from datetime import datetime, timedelta
import jwt
from flask_security import logout_user, hash_password
from models.models import db, User, Book, Role, Feedback, Section, Request, user_datastore
from redis_cache import cache


api = Blueprint('api', __name__)
ist = pytz.timezone('Asia/Kolkata')
now = datetime.now(ist)


## TOKEN BASED AUTHENTICATION
def generate_token(user):
    payload = {
        'user_id': user.user_id,
        'roles': [role.name for role in user.roles],
        'exp': now + timedelta(hours=6),
        'iat': now
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        elif 'token' in request.args:
            token = request.args.get('token')
        
        if not token:
            return jsonify({"message": "Token is missing!"}), 403

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            user = User.query.get(data['user_id'])
            if not user:
                raise Exception("User not found")
            g.user = user
        except Exception as e:
            return jsonify({"message": str(e)}), 403
        return f(*args, **kwargs)
    return decorated_function

def role_required(role_name):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = g.get('user')
            if not user or role_name not in [role.name for role in user.roles]:
                return jsonify({"message": "Access denied"}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/decode_token', methods=['POST'])
@token_required
def decode_token():
    token = request.json.get('token')
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return jsonify(data), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401



## ADMIN - ADD USER
@app.route('/admin/add_user', methods=['POST'])
@token_required
@role_required('admin')
def add_user():
    data = request.json
    username = data.get('username')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    active = data.get('activeStatus')

    if not username or not email or not password:
        return jsonify({"message": "All fields are required"}), 400
    if len(username) > 100:
        return jsonify({"message": "Username exceeds maximum length of 100 characters"}), 400
    if len(name) > 100:
        return jsonify({"message": "Name exceeds maximum length of 100 characters"}), 400
    if len(email) > 255:
        return jsonify({"message": "Email exceeds maximum length of 255 characters"}), 400
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return jsonify({"message": "Invalid email format"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'User already exists'}), 400

    new_user = User(
        username=username,
        name=name,
        email=email,
        password=hash_password(password),
        active=active,  
        roles=[Role.query.filter_by(name=role).first()]
    )

    db.session.add(new_user)
    db.session.commit()
    cache.clear()

    return jsonify({'message': 'User added successfully'}), 201



## ADMIN - EDIT USER
@app.route('/admin/edit_user/<int:user_id>', methods=['PUT'])
@token_required
@role_required('admin')
def edit_user(user_id):
    data = request.json
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.name = data.get('name', user.name)
    user.roles = [Role.query.filter_by(name=data.get('role')).first()]
    user.active = data.get('active', user.active)

    if 'password' in data and data['password']:
        user.password = hash_password(data['password'])  

    db.session.commit()
    cache.clear()

    return jsonify({"message": "User updated successfully"}), 200


## USER - EDIT PROFILE
@app.route('/user/profile/<int:user_id>', methods=['GET'])
@token_required
@role_required('user')
def get_profile_details(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict()), 200

@app.route('/user/edit_user/<int:user_id>', methods=['PUT'])
@token_required
@role_required('user')
def edit_user_profile(user_id):
    data = request.json
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    old_password = data.get('old_password')
    if not verify_password(old_password, user.password):
        return jsonify({"message": "Wrong password"}), 401

    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.name = data.get('name', user.name)
    
    new_password = data.get('password')
    if new_password:
        user.password = hash_password(new_password)  

    try:
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    cache.clear()

    return jsonify({"message": "User updated successfully"}), 200


## ADMIN - EDIT PROFILE
@app.route('/admin/profile/<int:user_id>', methods=['GET'])
@token_required
@role_required('admin')
def get_admin_profile_details(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict()), 200

@app.route('/admin/edit_admin/<int:user_id>', methods=['PUT'])
@token_required
@role_required('admin')
def edit_admin_profile(user_id):
    data = request.json
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    old_password = data.get('old_password')
    if not verify_password(old_password, user.password):
        return jsonify({"message": "Wrong password"}), 401

    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.name = data.get('name', user.name)
    
    new_password = data.get('password')
    if new_password:
        user.password = hash_password(new_password)  

    try:
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    cache.clear()

    return jsonify({"message": "User updated successfully"}), 200



## ADMIN - DELETE SECTION
@app.route('/admin/delete_section/<int:section_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_section(section_id):
    section = Section.query.filter_by(section_id=section_id).first()
    if not section:
        return jsonify({"message": "Section not found"}), 404
    
    requests = Request.query.filter_by(section_id=section_id).all()
    for req in requests:
        db.session.delete(req)

    books = Book.query.filter_by(section_id=section_id).all()
    for book in books:
        feedbacks = Feedback.query.filter_by(book_id=book.book_id).all()
        if feedbacks:
            for feedback in feedbacks:
                db.session.delete(feedback)
        db.session.delete(book)
    

    db.session.delete(section)
    db.session.commit()
    return jsonify({"message": "Section and related records deleted successfully"}), 200

## ADMIN - DELETE BOOK
@app.route('/admin/delete_book/<int:book_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404
    requests = Request.query.filter_by(book_id=book_id).all()
    for req in requests:
        db.session.delete(req)
    feedbacks = Feedback.query.filter_by(book_id=book_id).all()
    for fb in feedbacks:
        db.session.delete(fb)
    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book and related requests deleted successfully"}), 200


## ADMIN - DELETE USER
@app.route('/admin/delete_user/<int:user_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    requests = Request.query.filter_by(user_id=user_id).all()
    for req in requests:
        db.session.delete(req)
    feedbacks = Feedback.query.filter_by(user_id=user_id).all()
    for fb in feedbacks:
        db.session.delete(fb)
    db.session.delete(user)
    db.session.commit()
    cache.clear()

    return jsonify({"message": "User deleted successfully"}), 200


## INDEX PAGE 
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


## ADMIN - ADD SECTION
@app.route('/admin/add_section', methods=['POST'])
@token_required
@role_required('admin')
def add_section():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    date_created = data.get('date_created')
    print(date_created)
    formatted_date = datetime.strptime(date_created, '%Y-%m-%d')
    
    if not name:
        return jsonify({"message": "Name is required"}), 400
    
    existing_section = Section.query.filter_by(name=name).first()
    if existing_section:
        return jsonify({"message": "Section already exists"}), 400
    
    new_section = Section(name=name, description=description, date_created=formatted_date)
    db.session.add(new_section)
    db.session.commit()
    
    return jsonify(new_section.to_dict()), 201


## ADMIN - ALL USERS 
@app.route('/admin/all_users', methods=['GET'])
@token_required
@role_required('admin')
@cache.cached(timeout=100)
def all_users():
    users = User.query.all()
    if len(users) == 0:
        return jsonify({"message": "No users found"}), 404
    return jsonify({"users": [user.to_dict() for user in users]}), 200


## ADMIN - ALL REQUESTS
@app.route('/admin/all_requests', methods=['GET'])
@token_required
@role_required('admin')
def get_all_requests():
    requests = Request.query.all()
    requests_data = [request.to_dict() for request in requests]
    return jsonify({'requests': requests_data}), 200


## ADMIN - ADD REQUEST
@app.route('/requests/add', methods=['POST'])
@token_required
@role_required('admin')
def add_request():
    data = request.get_json()
    
    user_id = data.get('user_id')
    book_id = data.get('book_id')  
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'message': 'Book not found'}), 404
    existing_request = Request.query.filter_by(user_id=user_id, book_id=book_id, return_date=None, is_revoked=False).first()
    if existing_request:
        return jsonify({'message': 'Request currently exists for the user'}), 400
    section_id = book.section_id
    request_date = datetime.fromisoformat(data.get('request_date'))
    due_date = datetime.fromisoformat(data.get('due_date'))
    if request_date > due_date:
        return jsonify({'message': 'Request date cannot be greater than due date'}), 400
    
    new_request = Request(
        user_id=user_id,
        book_id=book_id,
        section_id=section_id,
        issue_date=request_date,
        due_date=due_date
    )
    
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({'message': 'Request added successfully'}), 201

## ADMIN - EDIT REQUEST
@app.route('/admin/request/<int:request_id>', methods=['GET'])
@token_required
@role_required('admin')
def get_request(request_id):
    request = Request.query.get(request_id)
    if not request:
        return jsonify({'message': 'Request not found'}), 404
    return jsonify(request.to_dict()), 200

@app.route('/admin/edit_request/<int:request_id>', methods=['PUT'])
@token_required
@role_required('admin')
def edit_request(request_id):
    data = request.get_json()
    existing_request = Request.query.get(request_id)
    if not existing_request:
        return jsonify({'message': 'Request not found'}), 404
    existing_request.due_date = datetime.strptime(data['due_date'], '%Y-%m-%dT%H:%M')
    existing_request.is_revoked = data['is_revoked']
    db.session.commit()
    return jsonify({'message': 'Request updated successfully'}), 200


## ADMIN - DELETE REQUEST
@app.route('/admin/delete_request/<int:request_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_request(request_id):
    request = Request.query.get(request_id)
    if not request:
        return jsonify({'message': 'Request not found'}), 404

    db.session.delete(request)
    db.session.commit()

    return jsonify({'message': 'Request deleted successfully'}), 200


## ADMIN - ALL SECTIONS
@app.route('/admin/all_sections', methods=['GET'])
@token_required
@role_required('admin')
def all_sections():
    sections = Section.query.all()
    if len(sections) == 0:
        return jsonify({"message": "No sections found"}), 404
    return jsonify({"sections": [section.to_dict() for section in sections]}), 200

## ADMIN - ALL BOOKS
@app.route('/admin/<int:section_id>/all_books', methods=['GET'])
@token_required
@role_required('admin')
def all_books(section_id):
    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404
    books = Book.query.filter_by(section_id=section_id).all()
    if len(books) == 0:
        return jsonify({"message": "No books found"}), 200
    return jsonify({"books": [book.to_dict() for book in books]}), 200


## ADMIN - GET SECTION DETAILS
@app.route('/admin/<int:section_id>/get_section', methods=['GET'])
@token_required
@role_required('admin')
def get_section(section_id):
    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404
    return jsonify(section.to_dict())


## USER - GET SECTION DETAILS
@app.route('/user/<int:section_id>/get_section', methods=['GET'])
@token_required
@role_required('user')
def user_get_section(section_id):
    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404
    return jsonify(section.to_dict())


## ADMIN - EDIT SECTION
@app.route('/admin/edit_section/<int:section_id>', methods=['PUT'])
@token_required
@role_required('admin')
def edit_section(section_id):
    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404

    data = request.get_json()
    section.name = data.get('name', section.name)
    section.description = data.get('description', section.description)

    db.session.commit()
    return jsonify({"message": "Section updated successfully"}), 200


## ADMIN - VIEW BOOK
@app.route('/admin/books/<int:book_id>/content', methods=['GET'])
@token_required
@role_required('admin') 
def get_book_content(book_id):
    book = Book.query.get(book_id)
    title = book.title
    if not book:
        return jsonify({"message": "Book not found"}), 404
    if book.content:
        return send_file(
            io.BytesIO(book.content),
            mimetype='application/pdf',
            as_attachment=False,
            download_name=f'book_{title}.pdf'
        )
    else:
        return jsonify({"message": "No content available"}), 404
    

## USER - VIEW BOOK

@app.route('/user/my_library/<int:book_id>/content', methods=['GET'])
@token_required
@role_required('user')  
def user_get_book_content(book_id):
    book = Book.query.get(book_id)
    title = book.title
    if not book:
        return jsonify({"message": "Book not found"}), 404
    if book.content:
        return send_file(
            io.BytesIO(book.content),
            mimetype='application/pdf',
            as_attachment=False,
            download_name=f'book_{title}.pdf'
        )
    else:
        return jsonify({"message": "No content available"}), 404


## ADMIN - EDIT BOOK
@app.route('/admin/<int:section_id>/edit_book/<int:book_id>', methods=['PUT'])
@token_required
@role_required('admin')
def edit_book(section_id, book_id):
    book = Book.query.filter_by(book_id=book_id).first()
    if not book:
        return jsonify({"message": "Book not found"}), 404
    book.title = request.form.get('title')
    book.author = request.form.get('author')
    book.publisher = request.form.get('publisher')
    published_date = request.form.get('published_date')
    formatted_date = datetime.strptime(published_date, '%Y-%m-%d')
    book.published_date = formatted_date
    content = request.files.get('content')

    if content:
        book.content = None
        db.session.flush() 

        pdf_content = content.read()
        book.content = pdf_content

    db.session.commit()
    return jsonify({"message": "Book updated successfully"})


## ADMIN - ADD BOOK
@app.route('/admin/<int:section_id>/add_book', methods=['POST'])
@token_required
@role_required('admin')
def add_book(section_id):
    title = request.form.get('title')
    author = request.form.get('author')
    publisher = request.form.get('publisher')
    published_date = request.form.get('published_date')
    content = request.files.get('content')  

    if not title:
        return jsonify({"message": "Title is required"}), 400   
    if not author:
        return jsonify({"message": "Author is required"}), 400
    if not publisher:
        return jsonify({"message": "Publisher is required"}), 400
    if not published_date:
        return jsonify({"message": "Published date is required"}), 400
    if not content:
        return jsonify({"message": "PDF content is required"}), 400

    formatted_date = datetime.strptime(published_date, '%Y-%m-%d')

    pdf_content = content.read()

    new_book = Book(
        title=title, 
        author=author, 
        publisher=publisher, 
        published_date=formatted_date, 
        section_id=section_id,
        content=pdf_content  
    )

    db.session.add(new_book)
    db.session.commit()

    return jsonify(new_book.to_dict()), 201



## USER - GET USER INFO
@app.route('/user/info', methods=['GET'])
@token_required
@role_required('user')
def get_user_info():
    user = g.get('user')
    user_dict = user.to_dict()
    return jsonify(user_dict), 200



## ADMIN - GET ADMIN INFO
@app.route('/admin/info', methods=['GET'])
@token_required
@role_required('admin')
def get_admin_info():
    user = g.get('user')
    user_dict = user.to_dict()
    return jsonify(user_dict), 200



## ADMIN - VIEW SECTION
@app.route('/admin/<int:section_id>/view_section', methods=['GET'])
@token_required
@role_required('admin')
def view_section(section_id):
    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404
    books = Book.query.filter_by(section_id=section_id).all()
    if len(books) == 0:
        return jsonify({"message": "No books found"}), 404
    return jsonify({"books": [book.to_dict() for book in books]}), 200

## USER - VIEW SECTION
@app.route('/user/<int:section_id>/view_section', methods=['GET'])
@token_required
@role_required('user')
def user_view_section(section_id):
    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404
    books = Book.query.filter_by(section_id=section_id).all()
    if len(books) == 0:
        return jsonify({"message": "No books found"}), 404
    return jsonify({"books": [book.to_dict() for book in books]}), 200

## USER - ALL SECTIONS
@app.route('/user/all_sections', methods=['GET'])
@token_required
@role_required('user')
def user_all_sections():
    sections = Section.query.all()
    if len(sections) == 0:
        return jsonify({"message": "No sections found"}), 404
    return jsonify({"sections": [section.to_dict() for section in sections]}), 200

@app.route('/user/my_library/<string:type>', methods=['GET'])
@token_required
def get_user_library(type):
    user_id = g.get('user').user_id

    if type == 'current_books':
        requests = Request.query.filter_by(user_id=user_id, return_date=None, is_revoked=False).all()
    elif type == 'completed_books':
        requests = Request.query.filter(Request.user_id == user_id, Request.return_date != None, Request.is_revoked == False).all()
    elif type == 'overdue_books':
        requests = Request.query.filter_by(user_id=user_id, is_revoked=False).all()
    else:
        return jsonify({"error": "Invalid type"}), 400

    requests_data = [request.to_dict() for request in requests]

    return jsonify({"requests": requests_data}), 200



## USER - ALL BOOKS
@app.route('/user/<int:section_id>/all_books', methods=['GET'])
@token_required
@role_required('user')
def user_all_books(section_id):
    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404
    books = Book.query.filter_by(section_id=section_id).all()
    if len(books) == 0:
        return jsonify({"message": "No books found"}), 200
    return jsonify({"books": [book.to_dict() for book in books]}), 200

from flask import request, jsonify


## USER - REQUEST CONFIRMATION
@app.route('/user/<int:section_id>/<int:book_id>/request_confirmation', methods=['POST'])
@token_required
@role_required('user')
def request_confirmation_post(section_id, book_id):
    section = Section.query.get(section_id)
    book = Book.query.get(book_id)
    user = g.get('user')
    requests = Request.query.filter_by(user_id=user.user_id).all()
    not_returned = 0
    for request in requests:
        if request.return_date is None:
            not_returned += 1
    if not_returned >= 5:
        return jsonify({"error": "You can only request up to 5 books at a time"}), 400
    total_requests = Request.query.filter_by(user_id=user.user_id, book_id=book.book_id).all()
    for request in total_requests:
        if request.return_date is None and request.is_revoked is False:
            return jsonify({"error": "You have already requested this book"}), 400
    request = Request(
        user_id=user.user_id,
        book_id=book.book_id,
        section_id=section.section_id,
        issue_date=datetime.now(),
        due_date=datetime.now() + timedelta(days=7),
        return_date=None
    )
    db.session.add(request)
    db.session.commit()
    return jsonify({"message": "Request successfully added to your library!"}), 200


## USER - RETURN CONFIRMATION
@app.route('/user/my_library/return/<int:request_id>', methods=['PUT'])
@token_required
@role_required('user')
def return_book(request_id):
    book_request = Request.query.get(request_id)
    if not book_request:
        return jsonify({'message': 'Request not found.'}), 404
    book_request.return_date = datetime.now()
    db.session.commit()
    return jsonify({'message': 'Book returned successfully.'}), 200


## USER - CURRENT BOOKS
@app.route('/user/my_library/current_books', methods=['GET'])
@token_required
@role_required('user')
def get_current_books():
    user = g.get('user')
    now = datetime.now()
    requests = Request.query.filter(
        Request.user_id == user.user_id,
        Request.return_date == None,
        Request.is_revoked == False,
        Request.due_date >= now
    ).all()
    return jsonify({"requests": [request.to_dict() for request in requests]}), 200


## USER - COMPLETED BOOKS
@app.route('/user/my_library/completed_books', methods=['GET'])
@token_required
@role_required('user')
def get_completed_books():
    user = g.get('user')
    now = datetime.now()
    requests = Request.query.filter(
        Request.user_id == user.user_id,
        Request.return_date != None,
        Request.is_revoked == False,
        Request.due_date >= Request.return_date
    ).all()
    return jsonify({"requests": [request.to_dict() for request in requests]}), 200

## USER - OVERDUE BOOKS
@app.route('/user/my_library/overdue_books', methods=['GET'])
@token_required
@role_required('user')
def get_overdue_books():
    user = g.get('user')
    requests = Request.query.filter(
        Request.user_id == user.user_id,
        Request.is_revoked == True,
    ).all()
    return jsonify({"requests": [request.to_dict() for request in requests]}), 200



## USER - WRITE FEEDBACK
@app.route('/user/my_library/<int:book_id>/write_feedback', methods=['POST'])
@token_required
@role_required('user')
def write_feedback(book_id):
    data = request.get_json()
    feedback = data.get('feedback')
    if not feedback:
        return jsonify({'message': 'Feedback is required'}), 400
    if len(feedback) > 1000:
        return jsonify({'message': 'Feedback exceeds maximum length of 1000 characters'}), 400
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'message': 'Book not found'}), 404
    user = g.get('user')
    user_id = user.user_id

    new_feedback = Feedback(
        book_id=book_id,
        feedback=feedback,
        user_id=user_id
    )
    db.session.add(new_feedback)
    db.session.commit()

    return jsonify({'message': 'Feedback submitted successfully'}), 201



## USER - GET BOOK DETAILS
@app.route('/user/my_library/book/<int:book_id>', methods=['GET'])
@token_required
@role_required('user')
def get_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'message': 'Book not found'}), 404
    return jsonify(book.to_dict()), 200



## USER - SEARCH
@app.route('/user/search/<string:query>/<string:filter>', methods=['GET'])
@token_required
@role_required('user')
def search(query, filter):
    if not query:
        return jsonify({"message": "Query is required"}), 400
    results = []
    if filter == 'books':
        books = Book.query.filter(Book.title.ilike(f'%{query}%')).all()
        results = [book.to_dict() for book in books]
    elif filter == 'authors':
        authors = Book.query.filter(Book.author.ilike(f'%{query}%')).all()
        results = [author.to_dict() for author in authors]
    elif filter == 'sections':
        sections = Section.query.filter(Section.name.ilike(f'%{query}%')).all()
        results = [section.to_dict() for section in sections]
    else:
        return jsonify({"message": "Invalid filter"}), 400
    return jsonify({"results": results}), 200



## USER - SEE BOOK INFO
@app.route('/user/<int:book_id>/see_info', methods=['GET'])
@token_required
@role_required('user')
def see_info(book_id):
    user = g.get('user')
    user_role = user.roles[0].name
    feedbacks = Feedback.query.filter_by(book_id=book_id).all()
    if not feedbacks:
        return jsonify({'message': 'No feedbacks found'}), 404
    feedback_list = [feedback.to_dict() for feedback in feedbacks]
    return jsonify({'feedback' : feedback_list, 'user_role' : user_role } ), 200



## ADMIN - GET BOOK DETAILS
@app.route('/admin/book/<int:book_id>', methods=['GET'])
@token_required
@role_required('admin')
def admin_get_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'message': 'Book not found'}), 404
    return jsonify(book.to_dict()), 200



## ADMIN - SEE BOOK INFO
@app.route('/admin/<int:book_id>/see_info', methods=['GET'])
@token_required
@role_required('admin')
def admin_see_info(book_id):
    user = g.get('user')
    user_role = user.roles[0].name
    feedbacks = Feedback.query.filter_by(book_id=book_id).all()
    if not feedbacks:
        return jsonify({'message': 'No feedbacks found'}), 404
    feedback_list = [feedback.to_dict() for feedback in feedbacks]
    return jsonify({'feedback' : feedback_list, 'user_role' : user_role } ), 200



## ADMIN - DELETE FEEDBACK
@app.route('/admin/<int:feedback_id>/delete_feedback', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_feedback(feedback_id):
    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({'message': 'Feedback not found'}), 404
    db.session.delete(feedback)
    db.session.commit()
    return jsonify({'message': 'Feedback deleted successfully'}), 200


## ADMIN STATS
@app.route('/admin/stats', methods=['GET'])
@token_required
@role_required('admin')
def admin_stats():
    user_count = User.query.filter(User.roles.any(Role.name == 'user')).count()
    admin_count = User.query.filter(User.roles.any(Role.name == 'admin')).count()
    issued_count = Request.query.filter_by(return_date=None, is_revoked=False).count()
    returned_count = Request.query.filter(Request.return_date.isnot(None), Request.is_revoked == False).count()
    revoked_count = Request.query.filter_by(is_revoked=True).count()
    sections = Section.query.all()
    section_names = [section.name for section in sections]
    books_count = [Book.query.filter_by(section_id=section.section_id).count() for section in sections]

    return jsonify({
        'bar_chart': {
            'labels': ['Users', 'Admins'],
            'data': [user_count, admin_count]
        },
        'requests_pie_chart': {
            'labels': ['Issued', 'Returned', 'Revoked'],
            'data': [issued_count, returned_count, revoked_count]
        },
        'section_books_chart': {
            'labels': section_names,
            'data': books_count
        }
    })



## USER STATS
@app.route('/user/stats', methods=['GET'])
@token_required
@role_required('user')
def user_stats():
    user_id = g.get('user').user_id
    issued_count = Request.query.filter_by(user_id=user_id, return_date = None, is_revoked=False).count()
    returned_count = Request.query.filter(Request.user_id == user_id, Request.return_date.isnot(None), Request.is_revoked == False).count()
    revoked_count = Request.query.filter_by(user_id=user_id, is_revoked=True).count()

    sections = Section.query.filter(Section.books.any()).all()
    section_names = [section.name for section in sections]
    books_count = [
        Book.query.join(Request)
            .filter_by(section_id=section.section_id)
            .filter(Request.user_id == user_id)
            .filter(Request.return_date.isnot(None))
            .filter(Request.is_revoked == False)
            .count()
        for section in sections
    ]


    return jsonify({
        'book_status_pie_chart': {
            'labels': ['Issued', 'Returned', 'Revoked'],
            'data': [issued_count, returned_count, revoked_count]
        },
        'completed_books_by_section_chart': {
            'labels': section_names,
            'data': books_count
        }
    })



## LOGIN
@app.route('/user_login', methods=['POST'])
def user_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username:
        return jsonify({"message": "Username is required"}), 400
    if not password:
        return jsonify({"message": "Password is required"}), 400
    if len(username) > 100:
        return jsonify({"message": "Username exceeds maximum length of 100 characters"}), 400

    user = user_datastore.find_user(username=username)

    if not user:
        return jsonify({"message": "User does not exist"}), 404
    if not verify_password(password, user.password):
        return jsonify({"message": "Wrong password"}), 401
    if not user.active:
        return jsonify({"message": "User is deactivated"}), 401

    token = generate_token(user)
    return jsonify({"message": "User logged in successfully", "token": token, "role": user.roles[0].name, "id": user.user_id, "name": user.name, "username": user.username, "email": user.email}), 200

@app.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({"message": "User logged out successfully"}), 200



## SIGNUP 
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not username or not email or not password or not name:
        return jsonify({"message": "All fields are required"}), 400
    if len(username) > 100:
        return jsonify({"message": "Username exceeds maximum length of 100 characters"}), 400
    if len(name) > 100:
        return jsonify({"message": "Name exceeds maximum length of 100 characters"}), 400
    if len(email) > 255:
        return jsonify({"message": "Email exceeds maximum length of 255 characters"}), 400
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return jsonify({"message": "Invalid email format"}), 400

    existing_user = user_datastore.find_user(username=username)
    if existing_user:
        return jsonify({"message": "User already exists"}), 400

    hashed_password = hash_password(password)
    new_user = user_datastore.create_user(username=username, name=name, email=email, password=hashed_password)
    db.session.commit()
    user_datastore.add_role_to_user(new_user, 'user')
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


## REVOKING OVERDUE BOOKS
from apscheduler.schedulers.background import BackgroundScheduler

@app.route('/overdue_books')
def overdue_books_check():
    requests = Request.query.all()
    for request in requests:
        if request.return_date == None and request.due_date < datetime.now() and request.is_revoked == False:
            request.return_date = datetime.now()
            request.is_revoked = True
            db.session.commit()

def scheduled_task():
    with app.app_context():
        overdue_books_check()

scheduler = BackgroundScheduler()
scheduler.add_job(func=scheduled_task, trigger="interval", seconds=10)
scheduler.start()


## USER - GENERATE MONTHLY REPORT
from .tasks import create_monthly_report
@app.route('/user/<int:user_id>/monthly_report', methods=['GET'])
def generate_monthly_report(user_id):
    task = create_monthly_report.delay(user_id)
    return jsonify({"task-id": task.id})

@app.route('/user/<int:user_id>/monthly_report/<task_id>', methods=['GET'])
def get_monthly_report(user_id, task_id):
    task = AsyncResult(task_id)
    if task.ready():
        filename = task.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404