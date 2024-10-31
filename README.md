# CODEXIFY - Online Library Management System

Codexify is a system designed to facilitate the management of library resources and user accounts through a web-based platform.


## Features

- User Authentication: Secure login and registration system for users and administrators using JWT token. Token validity can be customised.
- Role Based Authentication: Secure role-based authentication to prevent unauthorized activity.
- Browse Library: Users can view available sections and books within the library.
- User Profile Management: Update user profile details and visualize account activity.
- Book Requests: Users can request books for specified durations and return them within the due date. Automatic revocation for overdue books.
- Live Timer: User Library features a live timer to see how much time is remaining until due date. Book automatically revoked once timer ends.
- Feedback System: Users can provide feedback on books they have read.
- Search Functionality: Search for books or sections using the implemented search bar for users.
- Admin Dashboard: CRUD operations for managing books, sections, requests, and users. Easy access to lists of all issued requests and registered users.
- Admin Privileges: Manually revoke or undo revocation on issued books. Issue requests for custom time periods. Manage book information and feedback. 
- Graphical Presentation: View graphs to visualize user activity and library data for admins. Progress data charts available for users as well.
- Daily Reminders: Users get a daily reminder in the evening to visit the website.
- Monthly Report: Users can request a monthly csv file of their request summary. Admins get a monthly report in their mail at the end of the month.


## Getting Started

1. **Install Python:** 
    - If Python is not already installed, download and install it from https://www.python.org/downloads/.
2. **Set Up Project:**
    - Unzip the project folder and open it in VSCode.
    - Navigate to the project directory in the VSCode CMD Terminal using the command: `cd .\Root\Code\`
3. **Install Virtual Environment:**
    - Install virtualenv using pip: `pip install virtualenv`
4. **Create Virtual Environment:**
    - Create a virtual environment named `.venv` in the project directory: `virtualenv .venv`
    - Run the following command to activate virtual environment: `.\.venv\Scripts\activate`
5. **Install Dependencies:**
    - Run the following command to install project dependencies listed in `requirements.txt`: `pip install -r requirements.txt`
6. **Run the Application:**
    - Start the Flask application by running: `flask run`
7. **Set up Redis Server:**
    - Open another Ubuntu (WSL) terminal in VSCode [ensure you have WSL installed on your system] and navigate to the Code directory.
    - Run the following command to activate the Redis server: `redis-server --port 6380` 
8. **Set Up Celery Worker:**
    - Open another Ubuntu (WSL) terminal in VSCode and navigate to the Code directory.
    - Activate virtual environment by running the following command: `source ./.venv/Scripts/activate`
    - Run the following command to start the celery worker: `celery -A app:celery_app worker --loglevel INFO`
9. **Set Up Celery Beat:**
    - Open another Ubuntu (WSL) terminal in VSCode and navigate to the Code directory.
    - Activate virtual environment by running the following command: `source ./.venv/Scripts/activate`
    - Run the following command to start the celery beat: `celery -A app:celery_app beat --loglevel INFO`
10. **Set Up MailHog:**
    - Open another Ubuntu (WSL) terminal in VSCode [ensure you have MailHog installed on your system].
    - Navigate to your home directory by running the command: `cd`
    - Start MailHog by running the following command: `~/go/bin/MailHog`
    - Open MailHog on the URL: `http://localhost:8025/`
11. **Access the Application:**
    - Open a web browser and go to: `http://localhost:5000`


## Technologies Used

- Flask: Python web framework for building the application.
- SQLAlchemy: SQL toolkit and Object-Relational Mapping (ORM) library for database interaction.
- Vue.js: Progressive JavaScript framework (Vue 2 via CDN) for building interactive user interfaces.
- Bootstrap: Frontend framework for responsive design.
- APScheduler: Library for scheduling tasks in the background.
- Celery: Asynchronous task queue for managing background jobs and scheduling periodic tasks.
- Redis: In-memory data structure store used as a message broker for Celery and caching.
- Chart.js: JavaScript library for creating interactive and responsive charts.
- MailHog: Email testing tool that captures sent emails for development and testing.
