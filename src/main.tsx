// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { GlobalStyles, StyledEngineProvider } from "@mui/material";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <StyledEngineProvider enableCssLayer>
    <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
    <App />
    {/* </StrictMode> */}
  </StyledEngineProvider>
);
