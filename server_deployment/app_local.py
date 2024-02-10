from flask import Flask, request, jsonify
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from flask_cors import CORS  # Import the CORS module
from PIL import Image
import pytesseract
import os 
from pymongo import MongoClient
import requests  # Import the requests module
# get the path from env variable named TESSERACT_PATH
pytesseract.pytesseract.tesseract_cmd = os.environ.get('TESSERACT_PATH')

# Load the model and tokenizer
model = AutoModelForSequenceClassification.from_pretrained("sekhharr/hackathon_v2")
tokenizer = AutoTokenizer.from_pretrained('sekhharr/hackathon_v2')

# Move the model to GPU if available
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model.to(device)

# Define id2label and label2id at the global scope
id2label = {
    0: "not_dark",
    1: "countdown",
    2: "scarcity",
    3: "mis_direction",
    4: "social-proof",
    5: "sneaking",
    6: "obstruction",
    7: "forced-continuity"
}

label2id = {label: idx for idx, label in id2label.items()}

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
# Disable the Flask access logging
app.logger.disabled = True

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        text = data['text']

        # Tokenize and move tensors to the device
        inputs = tokenizer(text, return_tensors='pt')
        inputs = {key: value.to(device) for key, value in inputs.items()}

        # Make predictions
        res = model(**inputs)

        # Further processing based on your specific use case
        predicted_class_index = torch.argmax(res.logits).item()
        predicted_label = id2label.get(predicted_class_index, f'Unknown Label ({predicted_class_index})')

        # print the predicted label
        # print(predicted_labesl)
        # Return predictions as JSON
        return jsonify({
            'predicted_label': predicted_label,
            'predicted_class_index': predicted_class_index
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint to get prediction of the image
@app.route('/predict_image', methods=['POST'])
def predict_image():
    # Get the image link from the request
    image_link = request.json.get('image_link', None)

    # Check if image link is provided
    if not image_link:
        return jsonify({'error': 'Image link is missing'}), 400

    try:
        # Open the image from the provided link
        img = Image.open(requests.get(image_link, stream=True).raw)

        # Use Tesseract OCR to extract text from the image
        extracted_text = pytesseract.image_to_string(img)
        # print(extracted_text)
        if extracted_text == "":
            return jsonify({
            'extracted_text' : "",
            'predicted_label': "--",
            'predicted_class_index': "0"
        })
        # Tokenize and move tensors to the device
        inputs = tokenizer(extracted_text, return_tensors='pt')
        inputs = {key: value.to(device) for key, value in inputs.items()}
        # Make predictions
        res = model(**inputs)
        predicted_class_index = torch.argmax(res.logits).item()
        predicted_label = id2label.get(predicted_class_index, f'Unknown Label ({predicted_class_index})')
        # Return the extracted text as response
        return jsonify({
            'extracted_text' : extracted_text,
            'predicted_label': predicted_label,
            'predicted_class_index': predicted_class_index
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint to extract text from the image
@app.route('/extract_image', methods=['POST'])
def extract_image():
    # Get the image link from the request
    image_link = request.json.get('image_link', None)

    # Check if image link is provided
    if not image_link:
        return jsonify({'error': 'Image link is missing'}), 400

    try:
        # Open the image from the provided link
        img = Image.open(requests.get(image_link, stream=True).raw)

        # Use Tesseract OCR to extract text from the image
        extracted_text = pytesseract.image_to_string(img)
        # print(extracted_text)
        # Return the extracted text as response
        return jsonify({'extracted_text': extracted_text}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/collect_user_feedback', methods=['POST'])
def collect_user_feedback():
    try:
        client = MongoClient('mongodb+srv://thatsmeayushi2002:Ayushi123@cluster0.nj1phdt.mongodb.net/')
        db = client['user_feedback']  # database name
        collection = db['Feedback']  # collection name

    except Exception as e:
        print("Failed to connect ",e)
    data = request.get_json()
    if data:
        # Insert data into MongoDB
        result = collection.insert_one(data)
        if result.inserted_id:
            return jsonify({"message": "Data inserted successfully", "id": str(result.inserted_id)}), 201
        else:
            return jsonify({"error": "Failed to insert data"}), 500
    else:
        return jsonify({"error": "No data provided"}), 400

if __name__ == '__main__':
    # Run the Flask application on localhost:5000
    app.run()
