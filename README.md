# 🎯 Valorant API Explorer

Aplicación móvil desarrollada con **Ionic Framework (v9)**, **Angular Standalone (v22)** y **Capacitor (v8)** para explorar el catálogo oficial de agentes, mapas y skins del videojuego Valorant.

Proyecto desarrollado para el taller práctico de integración de APIs públicas — **Desarrollo de Aplicaciones Móviles (ESFOT)**.

---

## 📌 Requisitos Implementados

| Requisito | Funcionalidad | Descripción |
| :--- | :--- | :--- |
| **R1** | **Listado remoto** | Tarjetas (`<ion-card>`) con imágenes reales y múltiples atributos por entidad (rol, descripción, habilidades, coordenadas, variantes). |
| **R2** | **Infinite scrolling** | Carga incremental mediante `<ion-infinite-scroll>` en lotes de 6 elementos sin duplicados, con control de estados (`loading`, `hasMore`) y detención al agotarse la lista. |
| **R3** | **Búsqueda y filtros** | `<ion-searchbar>` con `debounce` para búsqueda por texto y chips interactivos (`<ion-chip>`) para filtrar fácilmente por roles y armas. Reinicio de paginación automático. |
| **R4** | **Detalle y rutas** | Vista detallada por parámetro de ruta (`/detail/:category/:id`) con información ampliada (habilidades desglosadas, minimapa táctico, variantes de skins) y botón de retroceso funcional (`<ion-back-button>`). |
| **R5** | **Estados y errores** | Pantallas de carga con `<ion-spinner>`, diferenciación entre lista vacía y error de red, botón de reintento no bloqueante, Pull-to-refresh (`<ion-refresher>`) y llamadas protegidas con `complete()` en el Infinite Scroll. |
| **R6** | **Favoritos persistentes** | Marcado de favoritos mediante estrella (★/☆) tanto en catálogo como en detalle, guardados de forma persistente en el dispositivo con **Capacitor Preferences** (`@capacitor/preferences`) y pestaña dedicada para consultarlos. |
| **R7** | **Estructura de código** | Separación modular desacoplada: Servicios (`ValorantService`, `FavoritesService`), Interfaces TypeScript (`valorant.models.ts`) y componentes Standalone. |
| **Extensión** | **Pull-to-refresh** | Gesto de arrastrar hacia abajo con `<ion-refresher>` para recargar el catálogo en tiempo real. |

---

## 🌐 Endpoints de la API Utilizados

API Base: `https://valorant-api.com/v1`

* **Agentes (Listado):** `GET /agents?isPlayableCharacter=true`
* **Agente por ID (Detalle):** `GET /agents/{uuid}`
* **Mapas (Listado):** `GET /maps`
* **Mapa por ID (Detalle):** `GET /maps/{uuid}`
* **Skins de Armas (Listado y Detalle):** `GET /weapons/skins`

---

## 📸 Capturas de Pantalla

| Listado de Agentes (R1 & R2) | Búsqueda y Filtros por Rol (R3) |
| :---: | :---: |
| ![Agentes](screenshots/agentes.png) | ![Filtros](screenshots/filtros.png) |

| Catálogo de Mapas | Catálogo de Skins |
| :---: | :---: |
| ![Mapas](screenshots/mapas.png) | ![Skins](screenshots/skins.png) |

---

## ⚙️ Decisiones Técnicas y Preguntas de Autoevaluación

* **¿Por qué conviene consumir la API desde un servicio en vez de directamente desde cada página?**  
  Centralizar las peticiones HTTP en `ValorantService` promueve el desacoplamiento y la reutilización de código (principio DRY). Si la URL base o los parámetros de la API cambian, solo se modifica el servicio sin alterar los componentes. Además, permite transformar o limpiar los datos antes de entregarlos al componente (por ejemplo, descartando skins sin imagen).

* **¿Qué cambia entre reemplazar un arreglo y concatenar nuevos resultados?**  
  Reemplazar el arreglo (`displayedItems = batch`) sustituye por completo los elementos visibles, borrando lo anterior (útil al iniciar una nueva búsqueda o cambiar de categoría). Concatenar (`displayedItems = [...displayedItems, ...batch]`) conserva los elementos ya renderizados y añade los nuevos al final, permitiendo la experiencia de desplazamiento continuo (Infinite Scroll).

* **¿Cómo evitar duplicados y solicitudes simultáneas al llegar al final del listado?**  
  Se utiliza un indicador booleano `isLoadingMore` que bloquea llamadas concurrentes mientras un lote se está procesando. Para evitar duplicados, el paginador calcula índices precisos `(currentPage - 1) * pageSize` y se evalúa `displayedItems.length >= filteredItems.length` para desactivar el `ion-infinite-scroll` (`hasMore = false`).

* **¿Qué se debe reiniciar cuando cambia el texto de búsqueda?**  
  Se debe reiniciar `currentPage = 1`, vaciar la lista de visualización `displayedItems = []`, reactivar `hasMore = true` y volver a generar el primer lote con los nuevos elementos filtrados.

* **¿Qué ocurre si falla la tercera página? ¿Cómo recuperar la interfaz?**  
  La interfaz nunca se bloquea porque el evento de infinite scroll siempre llama a `event.target.complete()` dentro de su bloque `finally`. Los elementos de las páginas 1 y 2 permanecen visibles, y se notifica al usuario mediante un `<ion-toast>` no invasivo para que pueda reintentar al desplazarse nuevamente.

* **¿Cómo diferenciar "sin resultados" de "error de conexión"?**  
  "Sin resultados" ocurre cuando la petición a la API fue exitosa (`HTTP 200`), pero el filtro de texto o categoría no encontró coincidencias (`filteredItems.length === 0`). "Error de conexión" ocurre cuando la petición falla a nivel de red (`status === 0`, `!navigator.onLine` o `HTTP 5xx`), mostrando un mensaje de error con botón de reintento.

* **¿Qué información se almacena localmente y qué se obtiene de la API?**  
  Desde la API se obtienen los datos dinámicos en tiempo real (listado de agentes, descripciones, mapas, minimapas y skins). En el almacenamiento local del dispositivo (mediante `Capacitor Preferences`) se guarda únicamente la lista de identificadores y metadatos de los **Favoritos** elegidos por el usuario, permitiendo que persistan entre sesiones sin requerir base de datos remota ni login.

---

## 📁 Estructura del Proyecto

```text
src/
├── app/
│   ├── models/
│   │   └── valorant.models.ts          # Interfaces TypeScript (R7 y R6)
│   ├── services/
│   │   ├── valorant.ts                 # Servicio HTTP HttpClient (R7)
│   │   └── favorites.ts                # Servicio de Favoritos Capacitor Preferences (R6)
│   ├── pages/
│   │   ├── valorant-list/              # Catálogo principal (R1, R2, R3, R5, R6)
│   │   │   ├── valorant-list.page.html
│   │   │   ├── valorant-list.page.scss
│   │   │   └── valorant-list.page.ts
│   │   └── valorant-detail/            # Pantalla de Detalle (R4, R5, R6)
│   │       ├── valorant-detail.page.html
│   │       ├── valorant-detail.page.scss
│   │       └── valorant-detail.page.ts
│   └── app.routes.ts                   # Enrutador principal con rutas dinámicas
├── theme/
│   └── variables.scss                  # Colores temáticos de Valorant (#ff4655, #0f1923, #17222d)
└── main.ts                             # Configuración de Providers Standalone
```

---

## 🚀 Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/alexbarba2753/ValorantAPI.git
   cd ValorantAPI
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   ionic serve
   # o bien:
   npm start
   ```

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

5. **Sincronizar y ejecutar en Android (Capacitor):**
   ```bash
   npx cap sync android
   npx cap open android
   ```
