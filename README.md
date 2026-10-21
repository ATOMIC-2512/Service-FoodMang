FOODMANG 🍽️
Sistema de gestión para restaurantes

FOODMANG es un proyecto de software que integra una interfaz web y un backend para apoyar la gestión de las operaciones de un restaurante. La aplicación está organizada en módulos y busca centralizar funcionalidades del sistema, con una API para procesar solicitudes y una base de datos para la información persistente.
Estado: En desarrollo. Las funcionalidades disponibles dependen de los módulos implementados e integrados en la versión actual.

Funcionalidades
- Interfaz web para las funciones operativas del restaurante.
- Backend con API REST para procesar las solicitudes del sistema.
- Gestión de información mediante una base de datos relacional.
- Organización modular para facilitar el mantenimiento y la incorporación de nuevas funciones.
Tecnologías
- Frontend: HTML, CSS y JavaScript.
- Backend: Node.js y Express.
- Base de datos: PostgreSQL.
- Acceso a datos: Sequelize.
- Herramientas: npm, Git y Postman.
La lista debe actualizarse si cambia la tecnología utilizada por alguna parte del proyecto.
Estructura del proyecto
FOODMANG/
├── config/                 # Configuración de la aplicación y conexiones
├── controllers/            # Controladores de la API
├── middlewares/            # Validaciones y controles de acceso
├── models/                 # Modelos de datos
├── modules/                # Módulos funcionales del sistema
├── routes/                 # Rutas de la API
├── scripts/                # Scripts auxiliares
├── services/               # Lógica de negocio
├── .env.example            # Plantilla de configuración
├── index.js                # Punto de entrada del backend
├── FOOD SERVICE MANG.sql   # Script SQL de referencia
├── MANG - ERD.png          # Diagrama entidad-relación
├── package.json            # Dependencias y comandos del proyecto
└── README.md
Requisitos
- Node.js y npm.
- PostgreSQL.
- Navegador web moderno.
- Git (opcional, para clonar y actualizar el repositorio).
Instalación y ejecución
1. Clona el repositorio y accede a su carpeta raíz.
   git clone <URL_DEL_REPOSITORIO>
   cd FOODMANG
2. Instala las dependencias del backend.
   npm install
3. Crea la base de datos en PostgreSQL. Revisa FOOD SERVICE MANG.sql antes de ejecutarlo y consulta MANG - ERD.png para visualizar el diseño de datos.
4. Crea el archivo .env a partir de .env.example y configura las variables que utiliza la aplicación. No publiques credenciales ni secretos.
5. Inicia el backend con el comando definido en package.json. Para consultar los comandos disponibles:
   npm run
6. Ejecuta el frontend con el método configurado para sus archivos. Si está compuesto por páginas estáticas, puedes abrir su HTML de entrada en un navegador o utilizar Live Server desde Visual Studio Code.
Los comandos exactos y las variables requeridas dependen de la configuración actual del repositorio. Consulta package.json y .env.example antes de iniciar la aplicación.

Desarrollo y pruebas
Utiliza Postman para comprobar los endpoints de la API y validar respuestas, datos de entrada y permisos de acceso. Prueba también el flujo de la interfaz y su comunicación con el backend cuando ambos estén integrados.

No incluyas contraseñas, tokens vigentes ni otros datos sensibles en capturas o archivos versionados. Mantén .env y node_modules/ fuera del control de versiones.
Estado del proyecto
FOODMANG se encuentra en desarrollo. La documentación debe mantenerse alineada con las funcionalidades implementadas, la estructura de la base de datos y los procedimientos de ejecución vigentes.