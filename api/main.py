from flask import Flask, request, jsonify
import json

app = Flask(__name__)
KEY = '123456'

@app.route('/write', methods=['POST'])
def write_file():
    data = request.get_json()
    if 'key' in data and data['key'] == KEY:
        with open('data.json', 'w') as f:
            json.dump(data['json'], f)
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'failed', 'message': 'Invalid key'})

@app.route('/read', methods=['POST'])
def read_file():
    key = request.get_json()['key']
    if key == KEY:
        with open('data.json', 'r') as f:
            data = json.load(f)
        return jsonify(data)
    else:
        return jsonify({'status': 'failed', 'message': 'Invalid key'})

if __name__ == '__main__':
    app.run(debug=True)