"""Back-end: serves the static site and a small JSON API (Flask)."""
import json
import threading
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request

app = Flask(__name__, static_folder="static", static_url_path="")
DATA_FILE = Path(__file__).with_name("messages.json")
lock = threading.Lock()


def load():
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    return []


def save(items):
    DATA_FILE.write_text(json.dumps(items, indent=2), encoding="utf-8")


@app.get("/")
def index():
    return app.send_static_file("index.html")


@app.get("/api/messages")
def list_messages():
    return jsonify(load())


@app.post("/api/messages")
def add_message():
    body = request.get_json(silent=True) or {}
    name = str(body.get("name", "")).strip()[:40]
    text = str(body.get("text", "")).strip()[:280]
    if not name or not text:
        return jsonify(error="Enter your name and a message."), 400
    entry = {
        "id": int(datetime.now().timestamp() * 1000),
        "name": name,
        "text": text,
        "at": datetime.now(timezone.utc).isoformat(),
    }
    with lock:
        items = load()
        items.insert(0, entry)
        save(items[:100])
    return jsonify(entry), 201


@app.delete("/api/messages/<int:msg_id>")
def delete_message(msg_id):
    with lock:
        items = [m for m in load() if m["id"] != msg_id]
        save(items)
    return "", 204


if __name__ == "__main__":
    app.run(debug=True, port=5000)
