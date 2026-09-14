from ast import Dict
from operator import methodcaller
from urllib import response
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request, render_template, url_for, make_response
import base64
from supabase import create_client
import json

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SECRET_KEY"))
TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 8
from datetime import datetime, timezone


def get_progress(token):
    """
    Fetches the current progress JSON for a given token.
    Returns the progress dict, or None if the token doesn't exist.
    """
    result = supabase.table('player_tokens').select('progress').eq('token', token).execute()

    if not result.data:
        return None

    return result.data[0]['progress']


def update_progress(token, updates: dict):
    """
    Merges `updates` into the player's existing progress and saves it.
    e.g. update_progress(token, {"found_clue_2": True})

    Returns the new merged progress dict, or None if the token doesn't exist.
    """
    current = get_progress(token)
    if current is None:
        return None

    merged = {**current, **updates}  # shallow merge — new keys overwrite old ones

    supabase.table('player_tokens') \
        .update({
            'progress': merged,
            'last_used_at': datetime.now(timezone.utc).isoformat()
        }) \
        .eq('token', token) \
        .execute()

    return merged

def encode_text(text: str) -> str:
    """Converts a standard text string into a Base64 string."""
    # Convert string to bytes, encode to base64, then decode back to a clean string
    text_bytes = text.encode("utf-8")
    base64_bytes = base64.b64encode(text_bytes)
    return base64_bytes.decode("utf-8")

# Create a new token when a player starts
def new_token():
    result = supabase.table('player_tokens').insert({}).execute()
    token = result.data[0]['token']
    return token

# Touch the token + check progress on each request
def get_progress(token):
    supabase.table('player_tokens').update({'last_used_at': 'now()'}).eq('token', token).execute()
    result = supabase.table('player_tokens').select('progress').eq('token', token).single().execute()
    return result.data['progress']

def get_or_create_token():
    """
    Checks the player's cookie for a token. If missing, invalid, or expired
    (stale in the DB), creates a new one. Otherwise returns the existing token
    and refreshes its last_used_at.

    Returns: (token: str, is_new: bool)
    """
    token = request.cookies.get('player_token')
    if token:
        # Check if this token still exists and hasn't gone stale
        result = supabase.table('player_tokens').select('*').eq('token', token).execute()
        if result.data:
            supabase.table('player_tokens').update({'last_used_at': 'now()'}).eq('token', token).execute()
            return token, False
    # No token, not found in DB — create a new one
    new_ = new_token()
    return new_, True

def check_token():
    token = request.headers.get('Token')
    if not token:
        return jsonify({
            "error": "Missing token",
            "usage": "Include your token in the 'Token' header, e.g. curl -H 'Token: <your-token>' <url>"
        }), False
    progress = get_progress(token)
    if progress is None:
        return jsonify({
            "error": "Invalid token",
            "usage": "Your token was not recognized. Go back to website to get a new token"
        }), False
    
    return {}, True

MAZE = [
    "###########",
    "#S..#.....#",
    "#.#.#.###.#",
    "#.#...#...#",
    "#.#####.#.#",
    "#.......#.#",
    "#######.#.#",
    "#.......#.#",
    "#.#####.#.#",
    "#.....#..G#",
    "###########",
]

START_POS = (1, 1)  # (row, col)

DIRECTIONS = {
    "up":    (-1, 0),
    "down":  (1, 0),
    "left":  (0, -1),
    "right": (0, 1),
}


def is_open(row, col):
    if row < 0 or row >= len(MAZE) or col < 0 or col >= len(MAZE[0]):
        return False
    return MAZE[row][col] != '#'


def is_goal(row, col):
    return MAZE[row][col] == 'G'


def available_moves(row, col):
    moves = []
    for direction, (dr, dc) in DIRECTIONS.items():
        if is_open(row + dr, col + dc):
            moves.append(direction)
    return moves


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
    return render_template('test3.html')

@app.route("/Final")
def random():
    return render_template("this.html")

@app.route("/test/<int:number>")
def test(number):
    return render_template(f"test{number}.html")

@app.route("/favicon.ico")
def favicon():
    token , is_new = get_or_create_token()
    response = make_response(
        encode_text(
            f"""
acquire myHope
use your mark {token}
speak my language
"""
        )
    )
    if(is_new):
        response.set_cookie(
        'player_token',
        token,
        max_age=TOKEN_MAX_AGE_SECONDS,
        httponly=True,
        secure=True,
        samesite='Lax'
    )
    response.headers["Content-Type"] = 'text/plain'
    response.headers["prefix"] = '/api/'
    return response

@app.route("/api/Cm15SG9wZQ==", methods=["GET", "POST"])
def myHope_get():
    msg , is_good = check_token()
    if(not is_good): return msg, 401
    if(request.method == "GET"):
        response = make_response(
            """jr wr wkh frqihvvlrqdo
whoo klp ri pb qdph
vshdn pb odqjxdjh
"""
        )
        response.headers["Content-Type"] = 'text/plain'
        response.headers["prefix"] = '/api/'
        return response
    else:
        progress = get_progress(request.headers.get('Token'))
        if progress.get('visited_grave') != True:
            res = make_response(
                """
brx nqrz wrr olwwoh brx fdq'w eh klp"""
            )
            res.headers["Content-Type"] = 'text/plain'
            return res
        if progress.get('mazeCompleted') != True:
            res = make_response("""
Brx frph wr ph zlwk wkh vphoo ri judyh. 
Prqvwhuv olnh brx ehorqj lq wkh Odebulqwk. 
Jr wkhuh dqg brx pdb ilqg irujlyhqhvv
"""
            )
            res.headers["Content-Type"] = 'text/plain'
            return res
        else:
            res = make_response("/PbIlqdoOhjdfb")
            res.headers["Content-Type"] = 'text/plain'
            return res

@app.route("/api/frqihvvlrqdo", methods=["POST"])
def confessional():
    msg , is_good = check_token()
    if(not is_good): return msg, 401
    data = request.get_data(as_text=True)
    if data == 'pbKrsh':
        response = make_response(
            """
Brx kdyh frpplwwhg qr vlq. Judqw Kh wkh uhdvrq surshu, dqg Kh vkdoo judqw brx hqwub.
vshdn pb odqjxdjh
"""
        )
        response.headers["Content-Type"] = 'text/plain'
        response.headers["obxplk"] = 'cfka jb xq qeb doxsb \n vshdn pb odqjxdjh'
    else:
        response = make_response(
            """
brx kdyh orvw brxu zdb fklog, ihdu qrw iru brx pdb vwloo uhfryhu
"""
        )
        response.headers["Content-Type"] = 'text/plain'
    return response

@app.route("/api/doxsb", methods=['GET'])
def the_grave():
    msg , is_good = check_token()
    if(not is_good): return msg, 401
    update_progress(request.headers.get('Token'), {"visited_grave": True})
    query = request.args.get('q')
    if not query:
        return jsonify({"error": "Missing required parameter: q"}), 400
    data = {
        "TheReasonForGrave" : "Here Lies Hope, along with the reasons he buried",
        "TheReasonForDeath" : "The search, for him",
        "Him" : "The liberator",
        "TheSearchOfLiberator" : "To find the worthy, worthy of what I made",
        "legacy" : "myHope program, it should hold everything I made securely. Until He arrives",
        "I" : "Hope",
    }
    res = {}
    for key in data:
        if query.lower() in key.lower():
            res[key] = data[key]
    res[""] = "The smell of the grave clings to you. you have sinned"
    return jsonify(res), 200

@app.route('/api/maze', methods=['GET', 'POST'])
def maze():
    msg , is_good = check_token()
    if(not is_good): return msg, 401
    token = request.headers.get('Token')
    progress = get_progress(token)
    pos = progress.get('maze_position')
    if pos is None:
        row, col = START_POS
        progress = update_progress(token, {"maze_position": [row, col]})
    else:
        row, col = pos

    if request.method == 'GET':
        # Just show current status without moving
        return jsonify({
            "position": [row, col],
            "available_moves": available_moves(row, col),
        }), 200

    # POST — attempt to move
    data = request.get_json(silent=True) or {}
    direction = data.get('direction', '').strip().lower()

    if direction not in DIRECTIONS:
        return jsonify({
            "error": "Invalid direction",
            "valid_directions": list(DIRECTIONS.keys()),
            "position": [row, col],
        }), 400

    dr, dc = DIRECTIONS[direction]
    new_row, new_col = row + dr, col + dc

    if not is_open(new_row, new_col):
        return jsonify({
            "moved": False,
            "message": "There's a wall that way.",
            "position": [row, col],
            "available_moves": available_moves(row, col)
        }), 200

    # Valid move — update position
    updates = {"maze_position": [new_row, new_col]}

    if is_goal(new_row, new_col):
        updates["mazeCompleted"] = True
        update_progress(token, updates)
        return jsonify({
            "moved": True,
            "message": "You have reach the stream of forgiveness. Although you still bear your sins, you no longer smell of the grave",
            "position": [new_row, new_col],
        }), 200

    update_progress(token, updates)
    return jsonify({
        "moved": True,
        "position": [new_row, new_col],
        "available_moves": available_moves(new_row, new_col),
    }), 200

@app.route('/PbIlqdoOhjdfb')
def message_board():
    return render_template('test6.html')
    

if __name__ == "__main__":
    app.run(debug=True)