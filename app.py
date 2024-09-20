from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import subprocess
import sys
import os

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def home():
    return render_template("home.html")  # initial page name


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
