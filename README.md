# Vera Studio

## Tecnologías utilizadas

- **HTML5** — estructura semántica
- **CSS3** — estilos personalizados con variables CSS
- **Bootstrap 5.3.3** — navbar responsive, grid de servicios, carousel de proyectos
- **Toastify** — mensajes visuales para formularios y autenticación
- **Google Fonts** — Inter (texto) + Ballet (acento tipográfico en el hero)
- **JavaScript vanilla** — consumo del backend, cierre del menú móvil, validación de formularios, login, registro y consulta de proyectos

## Integración con backend

El frontend consume el backend local en:

```txt
http://localhost:5001/api
```

Cuando el sitio se abre desde GitHub Pages, `utils.js` cambia automáticamente al backend desplegado en Render:

```txt
https://vera-studio-backend.onrender.com/api
```

Si Render genera otra URL para el servicio, se debe actualizar la constante `RENDER_API_URL` en `js/utils.js`.

Funcionalidades conectadas:

- Carga de servicios desde `GET /api/servicios`
- Carga de proyectos públicos desde `GET /api/proyectos/publicos`
- Envío de solicitudes con `POST /api/solicitudes`
- Página `cuenta.html` con registro desde `POST /api/users/register`
- Login de cliente desde `POST /api/users/login`
- Consulta privada de proyectos desde `GET /api/proyectos/mis-proyectos`

Si el backend no está encendido, la landing conserva el contenido estático para poder revisarse visualmente.

## Deployment

- Frontend: GitHub Pages desde el repositorio público `Vera-Studio`.
- Backend: Render desde el repositorio público `Vera-Studio-Backend`.
- URL esperada del frontend: `https://orvalvera.github.io/Vera-Studio/`
- URL del backend: `https://vera-studio-backend.onrender.com`
- Base de datos: MongoDB Atlas, base `verastudio`.
- En Render se configuran las variables `MONGO_URI`, `JWT_SECRET` y `FRONTEND_URL`.

## Estructura del frontend

- `index.html` — landing principal
- `cuenta.html` — login, registro y consulta de proyectos
- `styles.css` — estilos generales y responsive
- `js/utils.js` — funciones compartidas para API, mensajes y seguridad al imprimir texto
- `js/main.js` — lógica de la landing
- `js/cuenta.js` — lógica de autenticación y proyectos del cliente

## Flujo del sitio

- `index.html` funciona como landing comercial de Vera Studio.
- `servicios` se muestran desde MongoDB si el backend está encendido.
- `proyectos` muestra solamente proyectos con `publico: true`.
- `solicitudes` guarda leads desde el formulario principal.
- `cuenta.html` permite que un cliente inicie sesión y vea proyectos ligados a su email.
