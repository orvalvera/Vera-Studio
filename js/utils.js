const LOCAL_API_URL = "http://localhost:5001/api";
const RENDER_API_URL = "https://vera-studio-backend.onrender.com/api";
const isLocalPage = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_URL = isLocalPage ? LOCAL_API_URL : RENDER_API_URL;

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, type) {
  if (typeof Toastify !== "function") return;

  Toastify({
    text: message,
    duration: 3200,
    gravity: "top",
    position: "right",
    close: true,
    style: {
      background: type === "error" ? "#b42318" : "#111111",
      borderRadius: "8px",
    },
  }).showToast();
}

function setMessage(element, message, type) {
  element.textContent = message;
  element.className =
    type === "error"
      ? "form-message form-message--error"
      : "form-message form-message--success";
}

function clearMessage(element, className) {
  element.textContent = "";
  element.className = className || "form-message";
}

async function apiRequest(endpoint, options) {
  const config = options || {};

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...(config.headers || {}),
      },
    });
  } catch (error) {
    throw new Error("No se pudo conectar con el backend.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "No se pudo completar la solicitud.");
  }

  return data;
}
