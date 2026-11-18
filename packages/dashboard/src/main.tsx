import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { TokenRequired } from "./components/TokenRequired.js";
import { getToken } from "./api.js";
import "./index.css";

// Read the token once before rendering. Without one every API call would
// fail with 401, so show a plain explanation instead of a broken dashboard.
const hasToken = getToken() !== null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {hasToken ? <App /> : <TokenRequired />}
  </StrictMode>,
);
