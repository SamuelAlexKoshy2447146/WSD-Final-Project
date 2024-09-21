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
from typing import Any
from bson import Binary
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
import base64
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
user_collection = db["user_data"]
review_collection = db["reviews"]

# Setup secret key for session
app.secret_key = "hello"


# @app.route("/")
# def start_up():
#     return render_template("main.html")  # login page name


@app.route("/")
def home():
    if "user" in session:
        return render_template("home.html")  # initial page name
    return render_template("main.html")  # home page with login button


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
    if user_collection.find_one({"email": email}):
        return jsonify({"message": "Email already exists"}), 400
    user_collection.insert_one(user_data)

    user_data.pop("_id")
    session["user"] = user_data
    return jsonify({"status": "success", "message": "Registration successful"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    user_data = user_collection.find_one({"email": data.get("email")})
    if not user_data:
        return jsonify({"status": "error", "message": "No email was found"}), 400

    if user_data.get("password") != data.get("password"):
        return jsonify({"status": "error", "message": "Incorrect password"}), 400

    user_data.pop("_id")
    session["user"] = user_data
    return jsonify({"status": "success"})


@app.route("/update", methods=["POST"])
def update_details():
    user_session_data = session.get("user")
    if not user_session_data:
        return jsonify({"status": "error", "message": "No user found"}), 400

    # Get data
    name = request.form.get("name")
    email = request.form.get("email")
    mobile = request.form.get("mobile")
    profile_picture = request.files.get("profile_picture")

    # Update MongoDB with the new data
    user_data: dict[Any, Any] = {
        "name": name,
        "email": email,
        "mobile": mobile,
    }

    if profile_picture:
        user_data["profile_picture"] = Binary(profile_picture.read())

    user_email = session["user"].get("email")
    data = user_collection.update_one({"email": user_email}, {"$set": user_data})
    print(data)

    # Update session
    session["user"].update(user_data)
    session["user"].pop("profile_picture")
    session.modified = True

    return jsonify(
        {
            "status": "success",
            "message": "User details updated",
            "user": session["user"],
        }
    )


@app.route("/get_user")
def fetch_data():
    user_email = session["user"].get("email")

    user = user_collection.find_one({"email": user_email})

    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    profile_picture = None
    if user.get("profile_picture"):
        profile_picture = base64.b64encode(user["profile_picture"]).decode("utf-8")

    return jsonify(
        {
            "status": "success",
            "user": {
                "name": user.get("name"),
                "email": user.get("email"),
                "mobile": user.get("mobile"),
                "profile_picture": profile_picture,
            },
        }
    )


@app.route("/editor")
def editor():
    if "user" in session:
        return render_template("compiler.html")
    return redirect(url_for("home"))


@app.route("/about")
def about():
    if "user" in session:
        return render_template("about.html")
    return redirect(url_for("home"))


@app.route("/profile")
def profile_page():
    if "user" in session:
        return render_template("profile.html")
    return redirect(url_for("home"))


@app.route("/review")
def review():
    if "user" in session:
        return render_template("review.html")
    return redirect(url_for("home"))


@app.route("/logout")
def logout():
    if "user" in session:
        session.pop("user", None)
    return redirect((url_for("home")))


@app.route("/review/post", methods=["POST"])
def post_review():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400
    email = session["user"].get("email")

    review_data = {
        "title": data.get("title"),
        "content": data.get("content"),
        "name": session["user"].get("name"),
        "email": session["user"].get("email"),
    }
    if review_collection.find_one({"email": email}):
        review_collection.update_one({"email": email}, {"$set": data})
    else:
        review_collection.insert_one(review_data)
    print(review_data)

    return jsonify({"status": "success", "message": "Review posted"})


@app.route("/review/get")
def get_review():
    random_reviews = review_collection.aggregate([{"$sample": {"size": 6}}])
    reviews_list = list(random_reviews)

    for review in reviews_list:
        review["_id"] = str(review["_id"])

    return jsonify({"status": "success", "reviews": reviews_list})


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


@app.route("/todo")
def todo():
    if "user" in session:
        return render_template("todo.html")
    return redirect(url_for("home"))


@socketio.on("code_change")
def handle_code_change(data):
    print("Code change received:", data)
    emit("code_update", data, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True)
