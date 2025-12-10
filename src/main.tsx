import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry, reportWebVitalsToSentry } from "./lib/sentry";

// Initialize Sentry before rendering
initSentry();

// Report Web Vitals to Sentry for performance monitoring
reportWebVitalsToSentry();

createRoot(document.getElementById("root")!).render(<App />);
