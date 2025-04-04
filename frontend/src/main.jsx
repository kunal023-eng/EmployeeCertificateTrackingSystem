import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/Auth";
import ThemeProviderComponent from "./context/ThemeProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProviderComponent>
          <App />
        </ThemeProviderComponent>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
