# Assessment Write-Up

Draftline was built to solve a practical problem: turning long-form collateral, like PDFs and images, into optimized social media posts without manually retyping everything.

The project uses a clean, separated architecture. To ensure privacy, the frontend handles all file processing entirely client-side. Native PDF parsing is done via `pdfjs-dist`, while WebAssembly-powered `tesseract.js` handles local image OCR. 

One of the biggest technical challenges was handling mixed-content PDFs. To solve this, an auto-OCR fallback was implemented: if a PDF page is just a scanned image without a text layer, the app renders it to a hidden canvas and runs it through Tesseract automatically. This logic is wrapped in a per-page try/catch block so that a single bad scan doesn't break the entire document extraction.

On the backend, a lightweight FastAPI service securely connects to Gemini Flash. Using the new Google GenAI SDK alongside strict Pydantic models guarantees the LLM always returns predictable JSON for the UI.

Significant effort went into building resilient guardrails. Between a hard 15-page limit to prevent browser hanging, a 10MB file cap, and low-confidence OCR warnings, the application is designed to empower the user and never silently fail.
