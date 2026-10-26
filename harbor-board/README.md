# Harbor Board

Static front-end (HTML, CSS, JavaScript) + Python (Flask) back-end.

## Run
    pip install -r requirements.txt
    python app.py
Open http://127.0.0.1:5000

## Structure
    app.py            Flask server + JSON API (GET/POST/DELETE /api/messages)
    static/index.html Page structure
    static/style.css  Styling
    static/script.js  Calls the API with fetch()
    messages.json     Created automatically to store notes
