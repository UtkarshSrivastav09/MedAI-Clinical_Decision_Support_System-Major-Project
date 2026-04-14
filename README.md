# AI Pathology Lab

A full-stack web application that acts as an AI Laboratory. It allows a pathologist to upload chest X-rays, detects multiple diseases using AI, and generates a structured medical report including key findings, remediation, further required tests, and doctor referrals.

## Project Structure

*   **`frontend/`**: A Vite + React frontend styled with modern vanilla CSS featuring a premium dark theme.
*   **`backend/`**: A Fast API Python backend using an SQLite database and the Google Gemini API to analyze the images with low token usage.

## Setup Instructions

This project is built to be extremely lightweight and very easy to run locally on any machine without complex environments like CUDA.

### 1. Prerequisites
*   [Node.js](https://nodejs.org/en/) (for frontend)
*   [Python 3.8+](https://www.python.org/downloads/) (for backend)

### 2. Backend Setup
The backend uses Python and Fast API. It connects to the free Google Gemini Pro vision model.

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Activate it:
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   ```
3. Install the minimal requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the Environment Variable:
   Create a `.env` file in the `backend` folder and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_api_key_here
   ```
   *(You can get a free key from Google AI Studio: https://aistudio.google.com/app/apikey)*

5. Run the Server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will now be running on `http://127.0.0.1:8000`.

### 3. Frontend Setup
The frontend is a Vite React app that includes a Dashboard and a Scanner UI.

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL (usually `http://localhost:5173`) in your browser to view the app!

## How It Works

1.  **Dashboard**: Tracks the number of scans performed in the session using a local fast SQLite database.
2.  **Upload & Optimize**: The frontend X-ray upload is sent to the FastAPI backend. To ensure low token usage, the backend compresses and resizes the image before passing it to the AI.
3.  **Vision LLM**: A strict system prompt forces the Gemini model to output a specific JSON structure containing diseases, findings, remediation, etc.
4.  **Premium UI**: The results are then dynamically presented in a beautiful, premium dark-theme interface replicating high-end laboratory software.
