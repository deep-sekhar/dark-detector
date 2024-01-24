from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/echo', methods=['POST'])
def echo():
    data = request.get_json(force=True)
    input_text = data.get('text', '')

    response = {'message': f"Hi {input_text}! This is the Flask server echoing your input."}
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
