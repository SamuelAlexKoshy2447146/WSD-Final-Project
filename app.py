from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory,
    render_template,
    redirect,
    url_for,
)
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
import subprocess
import sys
import os

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Setup MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["pycoder"]
collection = db["user_data"]


@app.route("/")
def start_up():
    return render_template("main.html")  # login page name


@app.route("/home")
def home():
    return render_template("home.html")  # initial page name


# Route for handling form submission
@app.route("/submit", methods=["POST"])
def submit():
    # Collect data from the form
    # name = request.form['name']
    # email = request.form['email']
    # password = request.form['password']
    # role = request.form['role']
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    email = data.get("email")
    name = data.get("name")
    password = data.get("password")
    role = data.get("role")

    # Insert data into MongoDB
    data = {
        "name": name,
        "email": email,
        "password": password,
        "role": role,
    }
    if collection.find_one({"email": email}):
        print(data)
        return jsonify({"message": "Email already exists"}), 400
    collection.insert_one(data)

    return jsonify({"status": "success", "message": "Registration successful"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400
    
    
    return jsonify({"status": "success"})


@app.route("/editor")
def editor():
    return send_from_directory("", "Compiler.html")


@app.route("/about")
def about():
    return send_from_directory("", "about.html")


@app.route("/run", methods=["POST"])
def run_code():
    data = request.json
    if data is not None:
        code = data.get("code", "")
        inputs = data.get("inputs", [])

    if not code:
        return jsonify({"output": "No code provided"}), 400

    filename = "temp_code.py"
    with open(filename, "w") as file:
        file.write(code)

    try:
        process = subprocess.Popen(
            [sys.executable, filename],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        stdout, stderr = process.communicate(input="\n".join(inputs), timeout=10)
        output = stdout + stderr
    except subprocess.TimeoutExpired:
        process.kill()
        output = "Error: Code execution timeout"
    finally:
        os.remove(filename)

    return jsonify({"output": output})


@socketio.on("code_change")
def handle_code_change(data):
    print("Code change received:", data)
    emit("code_update", data, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True)
