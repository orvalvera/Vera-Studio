const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const accountPanel = document.getElementById("accountPanel");

function statusLabel(status) {
  const labels = {
    planeacion: "Planeación",
    diseno: "Diseño",
    desarrollo: "Desarrollo",
    revision: "Revisión",
    lanzado: "Lanzado",
    pausado: "Pausado",
  };

  return labels[status] || "En proceso";
}

function saveSession(user) {
  localStorage.setItem("veraUser", JSON.stringify(user));
}

function getSession() {
  const data = localStorage.getItem("veraUser");
  return data ? JSON.parse(data) : null;
}

function clearSession() {
  localStorage.removeItem("veraUser");
}

function setAuthMode(mode) {
  const isLogin = mode === "login";

  loginTab.classList.toggle("is-active", isLogin);
  registerTab.classList.toggle("is-active", !isLogin);
  loginForm.classList.toggle("is-hidden", !isLogin);
  registerForm.classList.toggle("is-hidden", isLogin);
  authMessage.textContent = "";
}

function addLogoutEvent() {
  document.getElementById("logoutButton").addEventListener("click", logout);
}

function renderProjects(user, proyectos) {
  if (!proyectos.length) {
    accountPanel.innerHTML = `
      <div class="account-panel-top">
        <div>
          <span class="section-kicker section-kicker--light">Hola</span>
          <h2 class="account-title">${escapeHTML(user.nombre)}</h2>
        </div>
        <button type="button" class="logout-button" id="logoutButton">Salir</button>
      </div>
      <p class="account-empty">
        Todavía no hay proyectos ligados a tu correo. Cuando Vera Studio registre tu proyecto con este email, aparecerá aquí.
      </p>
    `;
    addLogoutEvent();
    return;
  }

  accountPanel.innerHTML = `
    <div class="account-panel-top">
      <div>
        <span class="section-kicker section-kicker--light">Hola</span>
        <h2 class="account-title">${escapeHTML(user.nombre)}</h2>
      </div>
      <button type="button" class="logout-button" id="logoutButton">Salir</button>
    </div>
    <div class="account-projects">
      ${proyectos
        .map(function (proyecto) {
          const avance = Math.min(100, Math.max(0, Number(proyecto.avance) || 0));

          return `
            <article class="account-project">
              <div class="account-project-top">
                <div>
                  <h3 class="account-project-title">${escapeHTML(proyecto.titulo)}</h3>
                  <p class="account-project-type">${escapeHTML(proyecto.tipo)}</p>
                  <p class="account-project-date">Entrega: ${escapeHTML(proyecto.fechaEntrega)}</p>
                </div>
                <span class="account-status">${statusLabel(proyecto.estado)}</span>
              </div>
              <div class="account-progress" aria-label="Avance del proyecto">
                <div class="account-progress-bar" style="width: ${avance}%"></div>
              </div>
              <p class="account-project-result">${escapeHTML(proyecto.resultado)}</p>
            </article>
          `;
        })
        .join("")}
    </div>
  `;

  addLogoutEvent();
}

async function loadMyProjects(user) {
  accountPanel.innerHTML = '<p class="account-empty">Cargando proyectos...</p>';

  try {
    const proyectos = await apiRequest("/proyectos/mis-proyectos", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    renderProjects(user, proyectos);
  } catch (error) {
    clearSession();
    accountPanel.innerHTML = `
      <p class="account-empty">
        No se pudo cargar tu cuenta. Vuelve a iniciar sesión.
      </p>
    `;
    showToast(error.message, "error");
  }
}

function logout() {
  clearSession();
  accountPanel.innerHTML = `
    <p class="account-empty">
      Ingresa con tu cuenta para consultar tus proyectos activos.
    </p>
  `;
  clearMessage(authMessage);
  showToast("Sesión cerrada.", "success");
}

loginTab.addEventListener("click", function () {
  setAuthMode("login");
});

registerTab.addEventListener("click", function () {
  setAuthMode("register");
});

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!loginForm.checkValidity()) {
    clearMessage(authMessage);
    showToast("Ingresa tu email y contraseña.", "error");
    loginForm.reportValidity();
    return;
  }

  const formData = new FormData(loginForm);
  const button = loginForm.querySelector(".contact-submit");
  button.disabled = true;
  authMessage.textContent = "Validando acceso...";
  authMessage.className = "form-message";

  try {
    const user = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email").trim(),
        password: formData.get("password"),
      }),
    });

    saveSession(user);
    loginForm.reset();
    clearMessage(authMessage);
    showToast(`Bienvenido, ${user.nombre}.`, "success");
    loadMyProjects(user);
  } catch (error) {
    clearMessage(authMessage);
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
  }
});

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!registerForm.checkValidity()) {
    clearMessage(authMessage);
    showToast("Completa los datos para crear tu cuenta.", "error");
    registerForm.reportValidity();
    return;
  }

  const formData = new FormData(registerForm);
  const button = registerForm.querySelector(".contact-submit");
  button.disabled = true;
  authMessage.textContent = "Creando cuenta...";
  authMessage.className = "form-message";

  try {
    const user = await apiRequest("/users/register", {
      method: "POST",
      body: JSON.stringify({
        nombre: formData.get("nombre").trim(),
        email: formData.get("email").trim(),
        password: formData.get("password"),
      }),
    });

    saveSession(user);
    registerForm.reset();
    clearMessage(authMessage);
    showToast(`Cuenta creada, ${user.nombre}.`, "success");
    loadMyProjects(user);
  } catch (error) {
    clearMessage(authMessage);
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
  }
});

const activeSession = getSession();
if (activeSession && activeSession.token) {
  loadMyProjects(activeSession);
}
