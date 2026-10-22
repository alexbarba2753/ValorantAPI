# 🎯 Valorant API Explorer

Aplicación móvil desarrollada con **Ionic Framework**, **Angular Standalone** y **Capacitor** para explorar el catálogo oficial de agentes, mapas y skins del videojuego Valorant.

Proyecto realizado para el taller práctico de integración de APIs públicas.

---

## 📌 Requisitos Implementados

| Requisito | Funcionalidad | Descripción |
| :--- | :--- | :--- |
| **R1** | **Listado remoto** | Tarjetas (`<ion-card>`) con imágenes reales y múltiples atributos por entidad (rol, descripción, habilidades, coordenadas, variantes). |
| **R2** | **Infinite scrolling** | Carga incremental mediante `<ion-infinite-scroll>` en lotes de 6 elementos sin duplicados, con control de estados (`loading`, `hasMore`) y detención al agotarse la lista. |
| **R3** | **Búsqueda y filtros** | `<ion-searchbar>` con `debounce` para búsqueda por texto y chips interactivos (`<ion-chip>`) para filtrar fácilmente por roles y armas. |
| **R7** | **Estructura de código** | Separación modular en Servicio HTTP (`ValorantService`), Interfaces TypeScript (`valorant.models.ts`) y componentes Standalone. |

---

## 🌐 Endpoints de la API Utilizados

API Base: `https://valorant-api.com/v1`

* **Agentes:** `GET /agents?isPlayableCharacter=true`
* **Mapas:** `GET /maps`
* **Skins de Armas:** `GET /weapons/skins`

---

## 📸 Capturas de Pantalla

| Listado de Agentes (R1 & R2) | Búsqueda y Filtros por Rol (R3) |
| :---: | :---: |
| ![Agentes](screenshots/agentes.png) | ![Filtros](screenshots/filtros.png) |

| Catálogo de Mapas | Catálogo de Skins |
| :---: | :---: |
| ![Mapas](screenshots/mapas.png) | ![Skins](screenshots/skins.png) |

---

## ⚙️ Decisiones Técnicas y Paginación (Explicación Sencilla)

* **¿Cómo hicimos el Infinite Scroll si la API no tiene páginas?**  
  La API de Valorant entrega todos los datos juntos en una sola consulta. Para que el Infinite Scroll funcione como pide la actividad y la app no se vuelva lenta, guardamos los datos en memoria y los vamos mostrando poco a poco (de **6 en 6**). Cada vez que el usuario baja hasta el final de la pantalla, la app agrega 6 elementos más de forma fluida y sin repetir ninguno.

* **¿Por qué la app no se traba con tantas skins (+1.400)?**  
  Tener texto en memoria casi no gasta recursos. Lo que pondría lento un teléfono sería dibujar 1.400 tarjetas y cargar 1.400 fotos al mismo tiempo. Al ir mostrándolas en grupitos pequeños gracias al Infinite Scroll, la aplicación siempre se mantiene rápida y fluida.

* **Filtro de imágenes limpias:**  
  En la API algunas skins de prueba vienen sin foto (`displayIcon: null`). Filtramos esas skins para que en la pantalla solo aparezcan tarjetas completas y con su diseño oficial visible.

* **Actualización inmediata de la interfaz:**  
  Usamos `ChangeDetectorRef` para avisarle a Angular que repinte la pantalla en el momento exacto en que la API termina de responder, evitando que se quede congelada en el mensaje de carga.

---

## 📁 Estructura del Proyecto

```text
src/
├── app/
│   ├── models/
│   │   └── valorant.models.ts       # Interfaces TypeScript (R7)
│   ├── services/
│   │   └── valorant.ts              # Servicio HTTP HttpClient (R7)
│   ├── pages/
│   │   └── valorant-list/           # Componente principal (R1, R2, R3)
│   │       ├── valorant-list.page.html
│   │       ├── valorant-list.page.scss
│   │       └── valorant-list.page.ts
│   └── app.routes.ts                # Enrutador principal
├── theme/
│   └── variables.scss               # Colores temáticos de Valorant (#ff4655, #0f1923)
└── main.ts                          # Configuración de Providers Standalone
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
