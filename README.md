# PostIQ: Social Media Content Analyzer

🚀 **Live Demo:** [https://social-media-analyzer-pied.vercel.app/](https://social-media-analyzer-pied.vercel.app/)

PostIQ is an intelligent, full-stack web application that allows users to upload marketing copy (via PDF or Image) and instantly receive a platform-specific engagement analysis and an AI-rewritten post optimized for X, LinkedIn, or Instagram.

## 🚀 Features

- **Local Document Parsing:** Extracts text from PDFs locally using `pdfjs-dist`, maintaining paragraph structure.
- **Client-Side OCR:** Extracts text from images (PNG, JPG, WEBP) securely in the browser using WebAssembly-powered `tesseract.js`.
- **AI Analysis Pipeline:** Powered by Gemini 3.6 Flash, returning strict, Pydantic-validated JSON containing an engagement score, tone analysis, strengths, improvements, and a completely rewritten post.
- **Platform Specific Strategies:** Dynamically adjusts character limits, hashtag density, and tone depending on the selected platform.
- **Side-by-Side Review:** Compare extracted text directly against the original uploaded document with a synchronized, full-screen expandable grid layout.

## 🛠️ Architecture

The application is strictly separated into two distinct environments to ensure production readiness and security.

### Frontend (React + Vite + MUI)
- Built with React, TypeScript, and Material UI for a polished, highly responsive SaaS aesthetic.
- Implements lazy loading and dynamic imports for heavy dependencies (`tesseract.js`, `pdfjs-dist`) to ensure near-instant initial page loads.
- Client-side file processing ensures no sensitive documents are sent to the backend until the user explicitly requests an AI analysis.

### Backend (FastAPI + Python)
- Extremely lightweight FastAPI backend utilizing `pydantic` for strict request/response validation.
- Interfaces with the `google-genai` SDK using `response_schema` to guarantee structured, predictable JSON outputs from the LLM.
- Handles rate limiting, retry logic, and graceful error translation.

## 🏃‍♂️ How to Run Locally

### 1. Start the Backend
> **Note to Evaluators:** For security, the `GEMINI_API_KEY` is not included in this repository. The live demo is fully functional, but if you wish to run the backend locally, you will need to provide your own free Gemini API key.

```bash
cd backend
python -m venv .venv

# On Windows: .venv\Scripts\activate
# On Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt

# Create a .env file from the example
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY

# Start the server
uvicorn api.main:app --reload
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🛡️ Edge Cases & Error Handling Matrix

PostIQ implements comprehensive error handling across the entire stack:
- **Unsupported Files:** Immediately rejected at the Dropzone level.
- **Massive Files:** Hard limit of 10MB enforced before processing.
- **No Readable Text:** PDF parser and OCR abort gracefully if less than 5 characters are found.
- **Document Too Large:** Caps extracted text at ~25,000 characters to prevent crashing the LLM context window.
- **API Rate Limits / 503:** The backend automatically retries on temporary outages, and the frontend translates permanent 429s into a polite, user-facing wait message.
- **LLM Hallucinations/Truncation:** Pydantic validators intercept broken JSON or missing keys from the LLM and return a graceful 422 error to the user rather than crashing the application.
- **Low OCR Confidence:** Automatically detects blurry images and warns the user to manually review the extracted text before analyzing.
