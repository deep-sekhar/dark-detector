from flask import Flask, request, jsonify
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from flask_cors import CORS  # Import the CORS module


# Load the model and tokenizer
model = AutoModelForSequenceClassification.from_pretrained("sekhharr/hackathon_v1")
tokenizer = AutoTokenizer.from_pretrained('sekhharr/hackathon_v1')

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

@app.route('/predict', methods=['POST'])
def predict():
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
        'text': text,
        'predicted_label': predicted_label,
        'predicted_class_index': predicted_class_index
    })

if __name__ == '__main__':
    # Run the Flask application on localhost:5000
    app.run()
