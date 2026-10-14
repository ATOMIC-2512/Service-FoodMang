# FOODMANG 🍽️

Sistema web ilustrativo para el control y la gestión básica de un restaurante. El proyecto cuenta con una interfaz para representar las actividades principales del personal, como la gestión de pedidos y la comunicación entre las áreas de cocina y meseros.

Actualmente, el proyecto se encuentra en una etapa inicial y está desarrollado exclusivamente en el frontend, sin conexión a un servidor ni base de datos.

## 📌 Características

- **Cocina:** módulo destinado a representar la visualización y gestión de pedidos dentro de la cocina.
- **Mesero:** interfaz principal para representar las operaciones del personal de servicio.
- **Pedidos:** módulo para mostrar y gestionar pedidos de manera ilustrativa.
- **Interfaz web:** estructura desarrollada con HTML, estilos CSS y funcionalidades JavaScript.

> **Nota:** Las funcionalidades son demostrativas. No existe persistencia de información ni comunicación con un backend.

## 🗂️ Estructura del proyecto

```text
FOODMANG/
└── modules/
    ├── Cocina/
    │   ├── Cocina.css
    │   ├── Cocina.html
    │   └── Cocina.js
    │
    ├── mesero/
    │   ├── app.js
    │   ├── index.html
    │   └── styles.css
    │
    └── pedidos/
        ├── pedidos.css
        ├── pedidos.html
        └── pedidos.js
```

## 🛠️ Tecnologías utilizadas

- **HTML5:** estructura de las páginas web.
- **CSS3:** diseño visual y estilos de la interfaz.
- **JavaScript:** comportamiento e interactividad del frontend.

## 🚀 Instalación y ejecución

No se requiere instalar dependencias ni configurar un servidor backend.

1. Descarga o clona el repositorio.
2. Abre la carpeta `FOODMANG` en Visual Studio Code.
3. Accede al módulo que deseas visualizar.
4. Abre el archivo HTML correspondiente en un navegador.

Para facilitar la ejecución y evitar posibles problemas con las rutas de archivos, se recomienda utilizar la extensión **Live Server** de Visual Studio Code.

Como punto de entrada inicial, puedes abrir `modules/mesero/index.html`.

## ⚙️ Alcance actual

El proyecto se limita a la representación visual e interactiva de un sistema de control de restaurante.

- No cuenta con backend.
- No utiliza una base de datos.
- No dispone de autenticación de usuarios.
- No garantiza que los datos se conserven al recargar la página.
- No existe sincronización entre los módulos mediante un servidor.

## 🔮 Mejoras futuras

- Implementar un backend para procesar las operaciones.
- Integrar una base de datos para almacenar pedidos y productos.
- Incorporar autenticación y roles para meseros y personal de cocina.
- Permitir el seguimiento de los pedidos en tiempo real.
- Agregar módulos para productos, mesas, inventario y reportes.

## 📄 Estado del proyecto

**En desarrollo — Prototipo frontend.**

FOODMANG es un proyecto ilustrativo cuyo objetivo es representar la interfaz y el funcionamiento básico de un sistema de control para restaurantes. Su arquitectura podrá ampliarse posteriormente con servicios backend y almacenamiento persistente.
