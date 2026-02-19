from flask import Flask, render_template, request, jsonify, send_file
import os
from utils.predictor import SkinCancerPredictor
from utils.report_generator import generate_report
from utils.chatbot import get_chatbot_reply

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model", "skin_model_final.keras")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "static", "outputs")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

predictor = SkinCancerPredictor(MODEL_PATH)

@app.route("/")
def home():
    return render_template("index.html")

# ===========================
# Prediction
# ===========================
@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "Invalid filename"}), 400

    image_path = os.path.join(UPLOAD_FOLDER, "uploaded.jpg")
    file.save(image_path)

    result = predictor.predict(image_path)

    return jsonify(result)

# ===========================
# PDF
# ===========================
@app.route("/generate_report", methods=["POST"])
def generate_pdf():

    data = request.json

    image_path = os.path.join(UPLOAD_FOLDER, "uploaded.jpg")
    heatmap_path = os.path.join(OUTPUT_FOLDER, "heatmap.jpg")

    pdf_path = generate_report(data, image_path, heatmap_path)

    return send_file(pdf_path, as_attachment=True)

# ===========================
# Chatbot
# ===========================
@app.route("/chat", methods=["POST"])
def chat():

    message = request.json.get("message")
    reply = get_chatbot_reply(message)

    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(debug=True)
