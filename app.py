from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory,
    render_template,
    redirect,
    url_for,
    session,
)
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
import subprocess
import sys
import os

# Setup Flask connection
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Setup MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["pycoder"]
collection = db["user_data"]

# Setup secret key for session
app.secret_key = "hello"


@app.route("/")
def start_up():
    return render_template("main.html")  # login page name


@app.route("/home")
def home():
    if "user" in session:
        return render_template("home.html")  # initial page name
    else:
        return redirect(url_for("start_up"))


# Route for handling form submission
@app.route("/submit", methods=["POST"])
def submit():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    email = data.get("email")
    name = data.get("name")
    password = data.get("password")
    role = data.get("role")

    # Insert data into MongoDB
    user_data = {
        "name": name,
        "email": email,
        "password": password,
        "role": role,
    }
    if collection.find_one({"email": email}):
        return jsonify({"message": "Email already exists"}), 400
    collection.insert_one(user_data)

    user_data.pop("_id")
    session["user"] = user_data
    return jsonify({"status": "success", "message": "Registration successful"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    user_data = collection.find_one({"email": data.get("email")})
    if not user_data:
        return jsonify({"status": "error", "message": "No email was found"}), 400

    if user_data.get("password") != data.get("password"):
        return jsonify({"status": "error", "message": "Incorrect password"}), 400

    user_data.pop("_id")
    session["user"] = user_data
    print("user:", user_data)
    return jsonify({"status": "success"})


@app.route("/editor")
def editor():
    return send_from_directory("", "Compiler.html")


@app.route("/about")
def about():
    if "user" in session:
        return send_from_directory("", "about.html")
    else:
        return redirect(url_for("start_up"))


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
