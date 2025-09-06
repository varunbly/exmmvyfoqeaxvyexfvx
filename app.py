from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/")
def home():
    return "Varun is great"

@app.route("/greet", methods=["POST"])
def greet():
    data = request.json
    name = data.get("name", "Guest")
    return jsonify({"message": f"Hello, {name}!"})

if __name__ == "__main__":
    app.run(debug=True)