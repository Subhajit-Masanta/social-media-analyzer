# Assessment Write-Up

Draftline solves a practical problem: turning long-form collateral, like PDFs and images, into optimized social media posts without manually retyping everything.

The project uses a clean, separated architecture. To ensure privacy, the frontend handles all file processing entirely client-side. Native PDF parsing uses `pdfjs-dist`, while WebAssembly-powered `tesseract.js` handles local image OCR.

A major challenge was handling mixed-content PDFs. To solve this, an auto-OCR fallback was implemented: if a PDF page is just a scanned image without a text layer, the app renders it to a hidden canvas and runs it through Tesseract. This logic is wrapped in a per-page try/catch block so a single bad scan doesn't break document extraction.

On the backend, a lightweight FastAPI service securely connects to Gemini Flash. Using the Google GenAI SDK alongside strict Pydantic models guarantees the LLM always returns predictable JSON for the UI.

Significant effort went into resilient guardrails. Between a 15-page limit to prevent browser hanging, a 10MB file cap, low-confidence OCR warnings, and dynamic client-side AI model routing, the modern application empowers the user and never silently fails. If a model hits a 503 high-demand limit, the frontend automatically cascades through a fallback array, guaranteeing a highly seamless user experience.
