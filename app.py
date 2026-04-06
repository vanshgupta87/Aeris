import os
import re
import json
import uuid
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from werkzeug.utils import secure_filename


app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}


API_KEY = os.environ.get("GOOGLE_API_KEY")
# if not API_KEY:
#     raise ValueError(
#         "\n\nGOOGLE_API_KEY is not set!\n"
#         "In PowerShell, run:\n"
#         '  $env:GOOGLE_API_KEY = "your_api_key_here"\n'
#         "Then run: python app.py\n"
#         "(Both commands must be in the same PowerShell window)\n"
#     )

genai.configure(api_key=API_KEY)


if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return render_template('landingpage.html')


@app.route('/scanner')
def scanner_page():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Please upload a PNG, JPG, JPEG, or WEBP image."}), 400

    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        sample_file = genai.upload_file(path=filepath)

        prompt = """
        Analyze this product for sustainability. Return ONLY a JSON object with no extra text, no markdown, no code fences:
        {
            "product_name": "string",
            "category": "string",
            "sustainability_score": 0-100,
            "impact_metrics": {
                "carbon_saved": "e.g. 2.5kg CO2",
                "water_saved": "e.g. 12L",
                "air_impact": "Positive/Neutral/Negative"
            },
            "environmental_impact": "string",
            "materials_likely_used": ["mat1", "mat2"],
            "carbon_footprint_estimate": "string",
            "sustainable_alternatives": ["alt1", "alt2", "alt3"],
            "sustainability_tips": ["tip1", "tip2", "tip3"]
        }
        """

        response = model.generate_content([sample_file, prompt])

        raw = response.text.strip()
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not match:
            return jsonify({"error": "AI returned an unexpected response. Please try again."}), 500

        parsed = json.loads(match.group())
        return jsonify(parsed)

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response as JSON. Please try again."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


if __name__ == '__main__':
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode)
