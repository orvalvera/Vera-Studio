const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const newsletterForm = document.getElementById("newsletterForm");
const newsletterSuccess = document.getElementById("newsletterSuccess");
const servicesGrid = document.getElementById("servicesGrid");
const projectsList = document.getElementById("projectsList");
const projectsCarousel = document.getElementById("projectsCarousel");
const serviceSelect = document.getElementById("servicioInteres");

function getProjectImage(proyecto, index) {
  const fallbackImages = [
    "./assets/carousel1.png",
    "./assets/carousel2.webp",
    "./assets/carousel3.jpg",
  ];

  return proyecto.imagenUrl || fallbackImages[index % fallbackImages.length];
}

function renderServices(servicios) {
  const activeServices = servicios.filter(function (servicio) {
    return servicio.activo !== false;
  });

  if (!activeServices.length) {
    servicesGrid.innerHTML = `
      <div class="col-12">
        <p class="empty-state">
          Todavía no hay servicios cargados en la base de datos.
        </p>
      </div>
    `;
    return;
  }

  servicesGrid.innerHTML = activeServices
    .map(function (servicio, index) {
      const number = String(index + 1).padStart(2, "0");
      const isDark = index % 2 === 1;
      const image = servicio.imagenUrl || "./assets/4.png";

      return `
        <div class="col-12 col-md-6 col-xl-4">
          <article class="services-article ${isDark ? "service-card--dark" : "service-card--light"}">
            <div class="service-card-top">
              <span class="service-number">${number}</span>
              <h3 class="service-title">${escapeHTML(servicio.nombre)}</h3>
              <p class="service-description">${escapeHTML(servicio.descripcion)}</p>
            </div>
            <div class="service-content">
              <img src="${escapeHTML(image)}" class="service-img" alt="Ilustración de ${escapeHTML(servicio.nombre)}" />
              <a href="#contact" class="service-link" aria-label="Solicitar ${escapeHTML(servicio.nombre)}">
                <img src="./assets/arrow.svg" class="service-arrow ${isDark ? "service-arrow--invert" : ""}" alt="" />
              </a>
            </div>
          </article>
        </div>
      `;
    })
    .join("");

  serviceSelect.innerHTML = '<option value="">Selecciona una opción</option>';
  activeServices.forEach(function (servicio) {
    const option = document.createElement("option");
    option.value = servicio.nombre;
    option.textContent = servicio.nombre;
    serviceSelect.appendChild(option);
  });
}

function renderProjects(proyectos) {
  if (!proyectos.length) {
    projectsList.innerHTML = `
      <div class="carousel-item active">
        <article class="project-card project-card--empty">
          <div class="project-info">
            <span class="project-tag">Portafolio</span>
            <h3 class="project-title">Todavía no hay proyectos públicos.</h3>
            <p class="project-desc">
              Cuando exista un proyecto con publico: true en MongoDB, aparecerá en esta sección.
            </p>
          </div>
        </article>
      </div>
    `;
    return;
  }

  const visibleProjects = proyectos.slice(0, 6);

  projectsList.innerHTML = visibleProjects
    .map(function (proyecto, index) {
      const image = getProjectImage(proyecto, index);

      return `
        <div class="carousel-item ${index === 0 ? "active" : ""}">
          <article class="project-card">
            <div class="project-img-wrap">
              <img src="${escapeHTML(image)}" class="project-img" alt="${escapeHTML(proyecto.titulo)}" />
            </div>
            <div class="project-info">
              <span class="project-tag">${escapeHTML(proyecto.tipo)}</span>
              <h3 class="project-title">${escapeHTML(proyecto.titulo)}</h3>
              <p class="project-desc">${escapeHTML(proyecto.descripcion)}</p>
            </div>
          </article>
        </div>
      `;
    })
    .join("");

  const carousel = bootstrap.Carousel.getOrCreateInstance(projectsCarousel);
  carousel.to(0);
  carousel.cycle();
}

async function loadPublicData() {
  try {
    const servicios = await apiRequest("/servicios");
    renderServices(servicios);
  } catch (error) {
    console.log("Servicios estáticos cargados:", error.message);
  }

  try {
    const proyectos = await apiRequest("/proyectos/publicos");
    renderProjects(proyectos);
  } catch (error) {
    console.log("Proyectos estáticos cargados:", error.message);
  }
}

contactForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    clearMessage(formMessage);
    showToast("Revisa los campos obligatorios antes de enviar.", "error");
    contactForm.reportValidity();
    return;
  }

  const formData = new FormData(contactForm);
  const solicitud = {
    nombre: formData.get("nombre").trim(),
    email: formData.get("email").trim(),
    empresa: formData.get("empresa").trim() || "No especificada",
    servicioInteres: formData.get("servicioInteres"),
    presupuesto: Number(formData.get("presupuesto")) || 0,
    mensaje: formData.get("mensaje").trim(),
  };

  const submitButton = contactForm.querySelector(".contact-submit");
  submitButton.disabled = true;
  formMessage.textContent = "Enviando solicitud...";
  formMessage.className = "form-message";

  try {
    await apiRequest("/solicitudes", {
      method: "POST",
      body: JSON.stringify(solicitud),
    });

    clearMessage(formMessage);
    showToast(
      "Solicitud enviada correctamente. Te contactaremos pronto.",
      "success",
    );
    contactForm.reset();
  } catch (error) {
    clearMessage(formMessage);
    showToast(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});

newsletterForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!newsletterForm.checkValidity()) {
    clearMessage(newsletterSuccess, "footer-newsletter-success");
    showToast("Ingresa un correo válido.", "error");
    newsletterForm.reportValidity();
    return;
  }

  newsletterForm.reset();
  clearMessage(newsletterSuccess, "footer-newsletter-success");
  showToast("Te agregamos a la lista de Vera Studio.", "success");
});

function scrollToSection(targetId) {
  const target = document.querySelector(targetId);
  if (!target) return;

  const visibleStart =
    target.querySelector(".section-heading") ||
    target.querySelector(".about-content") ||
    target;

  const breathingRoom = window.innerWidth < 768 ? 8 : 12;
  const top =
    visibleStart.getBoundingClientRect().top + window.scrollY - breathingRoom;

  window.scrollTo({
    top: Math.max(0, Math.round(top)),
    behavior: "smooth",
  });
}

document.addEventListener("click", function (event) {
  const link = event.target.closest('a[href^="#"]');

  if (!link) return;

  const targetId = link.getAttribute("href");

  if (!targetId || targetId === "#") return;

  event.preventDefault();

  const menu = document.getElementById("navbarMenu");
  const isMobileMenuOpen = menu.classList.contains("show");

  if (isMobileMenuOpen) {
    menu.addEventListener(
      "hidden.bs.collapse",
      function () {
        scrollToSection(targetId);
      },
      { once: true },
    );
    bootstrap.Collapse.getOrCreateInstance(menu).hide();
    return;
  }

  scrollToSection(targetId);
});

loadPublicData();
