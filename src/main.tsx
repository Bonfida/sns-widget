import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.tsx";
import PreviewBg from "./assets/preview-bg.png";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div
      style={{
        backgroundImage: `url(${PreviewBg})`,
        backgroundSize: "cover",
        height: "100vh",
        width: "100vw",
      }}
    >
      <App />
    </div>
  </React.StrictMode>,
);
