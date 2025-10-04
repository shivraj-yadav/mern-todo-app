import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import FastApp from './FastApp.jsx';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <FastApp />
    </ErrorBoundary>
  </StrictMode>
);
