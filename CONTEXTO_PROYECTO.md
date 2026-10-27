# 🎮 Contexto y Arquitectura del Proyecto: Valorant API Explorer

Este documento describe en detalle el contexto, funcionamiento, arquitectura y decisiones técnicas del proyecto **Valorant API Explorer**, desarrollado como taller práctico para la materia de **Desarrollo de Aplicaciones Móviles** (ESFOT).

---

## 📌 1. Contexto y Propósito

El objetivo principal del taller es construir una aplicación móvil híbrida utilizando **Ionic 9**, **Angular Standalone (v22)** y **Capacitor 8**, consumiendo una API pública real desconocida.

Para este proyecto se eligió la API pública oficial de la comunidad de **Valorant** (`https://valorant-api.com/v1`), la cual ofrece información de agentes, mapas y skins de armas del videojuego. La aplicación está pensada desde una perspectiva universitaria: con una interfaz clara, intuitiva, limpia y sin sobrecargas estéticas, pero cumpliendo estrictamente todos los desafíos técnicos requeridos.

---

## 🚀 2. ¿Qué hace la aplicación? (Funcionalidades)

### 2.1. Exploración Multi-Categoría (R1)
La aplicación cuenta con un selector de categorías superior (`<ion-segment>`) que permite alternar entre:
1. **Agentes:** Muestra los personajes jugables, sus retratos oficiales, su rol táctico (Duelista, Iniciador, etc.), su biografía y sus habilidades principales.
2. **Mapas:** Presenta los escenarios de juego con su imagen splash, sector táctico y coordenadas geográficas clasificadas.
3. **Skins:** Exhibe aspectos cosméticos de armas con imágenes oficiales transparentes, cantidad de variantes (cromas) y niveles de animación.
4. **Favoritos:** Sección especial donde se recopilan todos los elementos que el usuario ha marcado con una estrella.

### 2.2. Carga Incremental / Infinite Scroll (R2)
Dado que la API de Valorant devuelve todos los registros en una sola consulta, renderizar más de 1.400 skins o decenas de agentes simultáneamente degradaría el rendimiento en teléfonos móviles.  
Para resolver esto, la app implementa **Infinite Scrolling local**:
* Mantiene los datos en memoria y los muestra progresivamente en **lotes de 6 elementos**.
* Al llegar al final de la pantalla, `<ion-infinite-scroll>` solicita el siguiente lote sin duplicados.
* Cuando se han mostrado todos los elementos disponibles, el Infinite Scroll se deshabilita automáticamente y muestra el aviso de fin de catálogo.

### 2.3. Búsqueda Reactiva y Filtros Rápidos (R3)
* **Buscador (`<ion-searchbar>`):** Incluye un retardo de `debounce` de 250ms para evitar ejecuciones innecesarias en cada pulsación. Permite buscar agentes por nombre o rol, mapas por nombre o sector, y skins por nombre de arma.
* **Chips de filtro rápido (`<ion-chip>`):** Generados dinámicamente según la categoría activa (por ejemplo, filtrar por roles específicos como Duelista, Centinela, Controlador o Iniciador; o por armas populares como Vandal, Phantom, Operator).
* **Reinicio de estado:** Al escribir en el buscador o cambiar de chip, la lista mostrada y la página actual se reinician a 1 inmediatamente.

### 2.4. Navegación y Pantalla de Detalle (R4)
* Al pulsar sobre cualquier tarjeta, la aplicación navega hacia la ruta dinámica:
  `/detail/:category/:id`
* En esta pantalla se recupera el identificador y se consulta el servicio para obtener la información ampliada:
  * **Agentes:** Retrato completo, nombre clave de desarrollo, descripción completa del rol y tarjetas individuales para cada una de sus 4 habilidades (icono, nombre, tecla/slot y descripción de efecto).
  * **Mapas:** Vista ampliada de la imagen de carga, descripción narrativa y el **plano táctico (minimapa)** con la distribución del terreno.
  * **Skins:** Imagen de gran resolución, desglose de variantes de color (cromas) y niveles de animación.
* La barra de navegación incluye un botón de regreso funcional (`<ion-back-button defaultHref="/valorant-list">`) que mantiene el estado previo de la lista.

### 2.5. Gestión Robusta de Estados y Errores (R5)
* **Estado de Carga:** Indicador de spinner `<ion-spinner>` centrado mientras se obtienen los datos.
* **Estado Sin Resultados:** Distingue cuándo una búsqueda o filtro no arrojó coincidencias, ofreciendo un botón para "Restablecer filtros".
* **Detección de Error de Conexión:** Si el usuario no tiene internet o el servidor no responde (`status: 0`), se muestra un icono de desconexión y un mensaje claro, junto a un botón de "Reintentar conexión" que no congela la app.
* **Pull-to-refresh (`<ion-refresher>`):** Permite al usuario deslizar hacia abajo en cualquier momento para volver a consultar la API de forma natural.
* **Manejo Seguro en Scroll:** El evento `loadMore()` siempre invoca `event.target.complete()` en su bloque `finally`, evitando que la rueda de carga quede girando indefinidamente ante fallos.

### 2.6. Persistencia de Favoritos (R6)
* El usuario puede marcar cualquier agente, mapa o skin como favorito tocando el icono de la **estrella** (★/☆), tanto desde la tarjeta del catálogo como desde la vista de detalle.
* Al pulsar la estrella, el estado se guarda de forma persistente en el dispositivo a través de la librería oficial **`@capacitor/preferences`** (almacenamiento nativo en Android/iOS y `localStorage` seguro en Web).
* Los favoritos se mantienen guardados aunque se cierre la aplicación o se recargue el navegador.
* La pestaña **"Favoritos"** permite consultar todos los elementos guardados y filtrarlos por categoría.

---

## 🏗️ 3. Estructura del Código

El proyecto sigue una arquitectura modular y desacoplada basada en **Angular Standalone**:

```text
src/
├── app/
│   ├── models/
│   │   └── valorant.models.ts          # Interfaces TypeScript (R7 y R6)
│   ├── services/
│   │   ├── valorant.ts                 # Servicio HTTP para consumir Valorant-API (R7)
│   │   └── favorites.ts                # Servicio de persistencia con Capacitor Preferences (R6)
│   ├── pages/
│   │   ├── valorant-list/              # Pantalla principal (R1, R2, R3, R5, R6)
│   │   │   ├── valorant-list.page.html
│   │   │   ├── valorant-list.page.scss
│   │   │   └── valorant-list.page.ts
│   │   └── valorant-detail/            # Pantalla de detalle por ID (R4, R5, R6)
│   │       ├── valorant-detail.page.html
│   │       ├── valorant-detail.page.scss
│   │       └── valorant-detail.page.ts
│   ├── app.routes.ts                   # Configuración de rutas (/valorant-list, /detail/:category/:id)
│   └── app.component.ts                # Componente raíz con <ion-app> y <ion-router-outlet>
├── theme/
│   └── variables.scss                  # Paleta temática de Valorant (#ff4655, #0f1923, #17222d)
└── main.ts                             # Inicialización de la aplicación Standalone y HttpClient
```

### 3.1. Roles de los Archivos Principales

1. **`valorant.models.ts`:**
   Define la estructura de datos mediante tipos e interfaces estrictas (`Agent`, `ValorantMap`, `WeaponSkin`, `FavoriteItem`, `ApiResponse<T>`), evitando el uso de tipos ambiguos y asegurando tipado estático en toda la aplicación.

2. **`valorant.ts` (Servicio HTTP):**
   Encapsula todas las peticiones a la API externa utilizando `HttpClient` y operadores de `RxJS` (`map`, `tap`). Contiene métodos para obtener listados y elementos individuales por UUID.

3. **`favorites.ts` (Servicio de Persistencia):**
   Gestiona la lectura, escritura y eliminación de favoritos utilizando la API nativa `@capacitor/preferences`. Además, mantiene un `Set<string>` en memoria para que la interfaz pueda consultar si un elemento es favorito de forma instantánea ($O(1)$) sin demorar el renderizado.

4. **`valorant-list.page.ts`:**
   Controlador principal de la vista de catálogo. Administra el ciclo de vida de la página, la selección de categorías, el filtrado por texto/chips, el control de paginación del Infinite Scroll y el gesto de actualización Pull-to-refresh.

5. **`valorant-detail.page.ts`:**
   Controlador de la vista de detalle. Lee los parámetros de la URL mediante `ActivatedRoute`, invoca el método correspondiente del servicio según la categoría y expone la opción de alternar favoritos.

---

## ⚙️ 4. Ejecución del Proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Ejecutar en modo de desarrollo:**
   ```bash
   npm start
   # o bien:
   ionic serve
   ```
3. **Compilar para producción:**
   ```bash
   npm run build
   ```
4. **Sincronizar con Capacitor Android:**
   ```bash
   npx cap sync android
   npx cap open android
   ```
