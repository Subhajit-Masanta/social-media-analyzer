# Draftline - Social Media Content Analyzer

🚀 **Live Demo:** [https://social-media-analyzer-subhajit.vercel.app/](https://social-media-analyzer-subhajit.vercel.app/)

Draftline is an intelligent, full-stack web application that allows users to upload marketing copy (via PDF or Image) and instantly receive a platform-specific engagement analysis and an AI-rewritten post optimized for X, LinkedIn, or Instagram.

## 🚀 Features

- **Local Document Parsing:** Extracts text from PDFs locally using `pdfjs-dist`, maintaining paragraph structure.
- **Client-Side OCR:** Extracts text from images (PNG, JPG, WEBP) securely in the browser using WebAssembly-powered `tesseract.js`.
- **AI Analysis Pipeline:** Powered by Gemini 3.7 Flash, returning strict, Pydantic-validated JSON containing an engagement score, tone analysis, strengths, improvements, and a completely rewritten post.
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

Draftline implements comprehensive error handling across the entire stack:
- **Scanned PDF Fallback:** Automatically detects image-only PDFs and routes them through a per-page OCR fallback pipeline, skipping unreadable pages instead of aborting.
- **Unsupported Files:** Immediately rejected at the Dropzone level.
- **Massive Files:** Hard limit of 10MB enforced before processing.
- **No Readable Text:** PDF parser and OCR abort gracefully if less than 5 characters are found.
- **Document Too Large:** Caps extracted text at ~25,000 characters to prevent crashing the LLM context window.
- **API Rate Limits / 503:** The frontend implements an automatic dynamic model fallback routing system. If a high-demand limit is reached, it seamlessly cascades to fallback AI models and clearly communicates the status to the user.
- **LLM Hallucinations/Truncation:** Google GenAI Structured Outputs and Pydantic validators intercept broken JSON or missing keys from the LLM and return a graceful 422 error to the user rather than crashing the application.
- **Low OCR Confidence:** Automatically detects blurry images and warns the user to manually review the extracted text before analyzing.

## 📝 Assessment Write-Up

Draftline solves a practical problem: turning long-form collateral, like PDFs and images, into optimized social media posts without manually retyping everything.

The project uses a clean, separated architecture. To ensure privacy, the frontend handles all file processing entirely client-side. Native PDF parsing uses `pdfjs-dist`, while WebAssembly-powered `tesseract.js` handles local image OCR.

A major challenge was handling mixed-content PDFs. To solve this, an auto-OCR fallback was implemented: if a PDF page is just a scanned image without a text layer, the app renders it to a hidden canvas and runs it through Tesseract. This logic is wrapped in a per-page try/catch block so a single bad scan doesn't break document extraction.

On the backend, a lightweight FastAPI service securely connects to Gemini Flash. Using the Google GenAI SDK alongside strict Pydantic models guarantees the LLM always returns predictable JSON for the UI.

Significant effort went into resilient guardrails. Between a 15-page limit to prevent browser hanging, a 10MB file cap, low-confidence OCR warnings, and dynamic client-side AI model routing, the modern application empowers the user and never silently fails. If a model hits a 503 high-demand limit, the frontend automatically cascades through a fallback array, guaranteeing a highly seamless user experience.

## 🚀 Future Improvements
- **Multimodal OCR:** The current implementation uses classical OCR (`tesseract.js`) securely in the client to respect the assignment brief. However, to significantly boost accuracy on complex layouts, angled photos, or handwriting, the architecture could be upgraded to skip client-side OCR entirely and pass the raw image to Gemini 3.7 Flash's multimodal vision capabilities directly. This would trade a secondary network round-trip and API quota for state-of-the-art text extraction.
