from flask import Flask, jsonify, request, render_template, url_for

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('index.html')

@app.route('/<int:number>')
def level_1(number):
    target = 69
    if(number < target):
        return render_template("level_1_l.html", number = number)
    elif(number > target):
        return render_template("level_1_h.html", number = number)
    else:
        return render_template("level_1_t.html", number = number)


@app.route("/greet", methods=["POST"])
def greet():
    data = request.json
    name = data.get("name", "Guest")
    return jsonify({"message": f"Hello, {name}!"})

if __name__ == "__main__":
    app.run(debug=True)