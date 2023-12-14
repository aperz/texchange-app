from flask import Flask, render_template, request, jsonify
import random
import logging
from logging.handlers import RotatingFileHandler
import os

# Logging setup
if not os.path.exists('logs'):
    os.mkdir('logs')

logging.basicConfig(level=logging.DEBUG)
file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.DEBUG)

app = Flask(__name__)
app.logger.addHandler(file_handler)

# In-memory storage for demonstration
users = []
groups = {"test_group": ["user1", "user2", "user3"]}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['POST'])
def register_user():
    username = request.form['username']
    users.append(username)
    app.logger.info(f'User registered: {username}')
    return jsonify({'status': 'success', 'username': username})


@app.route('/logout_user', methods=['POST'])
def logout_user():
    data = request.json
    username = data.get('username')
    if username in users:
        users.remove(username)
    app.logger.debug(f'Logged out user: {username}')
    app.logger.debug(f'Users: {users}')
    app.logger.debug(f'Groups: {groups}')
    return jsonify({'status': 'success', 'message': 'Logged out successfully'})


@app.route('/create_group', methods=['POST'])
def create_group():
    new_group_id = request.form['new_group_id']
    # group_id = random.randint(1000, 9999)
    groups[new_group_id] = []
    app.logger.info(f'Group created: {new_group_id}')
    return jsonify({'status': 'success', 'group_id': new_group_id})


@app.route('/join_group', methods=['POST'])
def join_group():
    username = request.form['username']
    group_id = request.form['group_id']
    if group_id in groups:
        groups[group_id].append(username)
        app.logger.info(f'User {username} joined group {group_id}')
        return jsonify({'status': 'success', 'group_id': group_id, 'users': groups[group_id]})
    else:
        app.logger.warning(f'Attempt to join non-existent group: {group_id}')
        return jsonify({'status': 'error', 'message': 'Group not found'})


@app.route('/random_match', methods=['POST'])
def random_match():
    # data = request.json
    # group_id = data.get('group_id')
    #app.logger.debug(request)
    group_id = request.form['group_id']
    if group_id in groups:
        matched_users = random.sample(groups[group_id], 2) if len(groups[group_id]) >= 2 else []
        return jsonify({'status': 'success', 'matched_users': matched_users})
    else:
        return jsonify({'status': 'error', 'message': 'Group not found'})


@app.route('/list_users', methods=['GET'])
def list_users():
    return jsonify({'status': 'success', 'users': users})


if __name__ == '__main__':
    app.run(debug=True)
