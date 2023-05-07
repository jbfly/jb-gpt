from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os
from OpenSSL import SSL

app = Flask(__name__, static_url_path="", static_folder="/srv/http/jb-gpt")
qqq
CORS(app, origins=["https://bonewitz.net"])
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get("messages")
    model = data.get("model", "gpt-3.5-turbo")  # Get the model from the request, default to "gpt-3.5-turbo"
    print("Selected model:", model)  # debug


    print(request.json)

    if not messages:
        return jsonify({"error": "Missing messages parameter"}), 400
    
    response = openai.ChatCompletion.create(
        model=model,#Use the selected model
        messages=messages,
        temperature=0.7
    )

    print(response)
    return jsonify({"message": response.choices[0].message.content if hasattr(response.choices[0].message, 'content') else "Error: Text not found in response"})




@app.route('/')
def index():
    return send_from_directory("/srv/http/jb-gpt", "index.html")

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=2087)
