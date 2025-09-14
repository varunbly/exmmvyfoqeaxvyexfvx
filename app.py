from flask import Flask, jsonify, request, render_template, url_for

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/Lies/<int:number>")
def level_0(number):
    return render_template(f"level_0_{number}.html")

@app.route('/<int:number>')
def level_1(number):
    target = 1509
    if (number == 1):
        return render_template('convince.html')
    elif(number < target):
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

@app.route("/discarded")
def chase1():
    return render_template(f'chase1.html')

@app.route("/getaway")
def chase2():
    return render_template(f'chase2.html')

@app.route("/stop")
def chase3():
    return render_template(f'chase3.html')

@app.route("/please")
def chase4():
    return render_template(f'chase4.html')

@app.route("/letMeGo")
def chase5():
    return render_template(f'chase5.html')

@app.route("/leaveMe")
def chase6():
    return render_template(f'chase6.html')

@app.route("/convince")
def convince():
    return render_template('convince.html')

@app.route("/lose")
def you_lost():
    return render_template('lost_screen.html')

@app.route("/report")
def report():
    return render_template('test1.html')

@app.route("/youFinallyWin")
def random():
    return render_template("you_win.html")

@app.route("/test/<int:number>")
def test(number):
    return render_template(f"test{number}.html")

if __name__ == "__main__":
    app.run(debug=True)