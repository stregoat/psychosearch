import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

console.log('🚀 main.jsx started executing');

// Проверяем что root элемент существует
const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, mounting React...');
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <BrowserRouter basename="/psychosearch">
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log('✅ React mounted successfully!');
  } catch (error) {
    console.error('❌ React mount failed:', error);
  }
}
