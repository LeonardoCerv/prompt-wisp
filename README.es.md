![Prompt Wisp](/public/wisplogo.svg)

![Language](https://img.shields.io/badge/Lenguaje-TypeScript-3178c6?logo=typescript&logoColor=white)
![Library](https://img.shields.io/badge/Libreria-React-4fccf3?logo=react&logoColor=white)
![Framework](https://img.shields.io/badge/Framework-NextJS-black?logo=nextdotjs&logoColor=white)
![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e?logo=supabase&logoColor=white)
![Field](https://img.shields.io/badge/Campo-Ingenieria%20de%20Software-white)
![License](https://img.shields.io/badge/Licencia-MIT-brown)


### ```Prompt Wisp``` es una plataforma para ayudarte a organizar, gestionar y compartir prompts de IA.

### [Sitio web](https://prompt-wisp.vercel.app/) • [Repo de extension de chrome](https://github.com/LeonardoCerv/prompt-wisp-web-extension) • [Demo en vivo](https://prompt-wisp.vercel.app/prompt) • [Linkedin](https://www.linkedin.com/in/leonardocerv/) • [Gmail](mailto:Leocerva29@gmail.com)


![Vista previa de Prompt Wisp](/public/preview.png)

## Descripción General

Prompt Wisp es una aplicación moderna full-stack creada para resolver el creciente desafío de la gestión de prompts en la era de la IA. Ofrece una plataforma profesional para descubrir, organizar y compartir prompts de IA, diseñada tanto para individuos como para equipos que buscan excelencia en sus interacciones con IA.

## Características

### Capacidades Principales
- **Gestión de Prompts**: Crea, edita, organiza y elimina prompts de IA con soporte de texto enriquecido
- **Colecciones**: Agrupa prompts relacionados en colecciones para una mejor organización
- **Compartir y Colaborar**: Comparte prompts de forma pública, privada o con miembros específicos del equipo
- **Sistema de Etiquetas**: Categoriza prompts con etiquetas personalizadas para un filtrado eficiente
- **Búsqueda**: Potente búsqueda semántica en toda tu biblioteca de prompts
- **Controles de Visibilidad**: Define prompts como públicos, privados o no listados
- **Autenticación de Usuario**: Creación y gestión segura de cuentas con Supabase

## Stack Tecnológico

- **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Rutas API de Next.js, Supabase
- **Autenticación**: Supabase Auth
- **Base de Datos**: PostgreSQL (a través de Supabase)
- **Estilos**: Tailwind CSS, componentes shadcn/ui
- **Gestión de Estado**: React Context API con hooks personalizados
- **Despliegue**: Vercel

## Arquitectura

Prompt Wisp sigue un patrón de arquitectura moderna con:

- Renderizado del lado del servidor mediante Next.js para un rendimiento y SEO óptimos
- Rutas API para funcionalidad backend
- Modelos de datos tipados usando interfaces de TypeScript
- Esquema de base de datos con relaciones y restricciones apropiadas
- Flujo de autenticación con gestión segura de sesiones
- Diseño responsivo para todos los dispositivos

### Esquema de Base de Datos

La aplicación utiliza una base de datos PostgreSQL con las siguientes tablas principales:
- `prompts`: Almacena todos los datos de los prompts incluyendo contenido, metadatos y configuraciones de visibilidad
- `collections`: Grupos de prompts con sus propios metadatos y configuraciones de visibilidad
- `users_prompts`: Gestiona las relaciones entre usuarios y prompts
- `users_collections`: Gestiona las relaciones entre usuarios y colecciones
- `collection_prompts`: Gestiona las relaciones entre colecciones y prompts

## Desarrollo

### Requisitos Previos

- Node.js 18+ y npm/yarn
- Cuenta de Supabase

### Configuración

1. Clona el repositorio
```bash
git clone https://github.com/yourusername/prompt-wisp.git
cd prompt-wisp
```

2. Instala las dependencias
```bash
npm install
# o
yarn install
```

3. Configura las variables de entorno
```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. Ejecuta el servidor de desarrollo
```bash
npm run dev
# o
yarn dev
```

5. Accede a la aplicación en http://localhost:3000

## Hoja de Ruta Futura

### Funcionalidades Planeadas

- **Colaboración en Tiempo Real**: Varios usuarios editando prompts simultáneamente
- **Historial de Versiones**: Seguimiento de cambios en los prompts a lo largo del tiempo
- **Análisis de Prompts con IA**: Obtén ideas y sugerencias para mejorar tus prompts
- **Permisos Avanzados**: Control de acceso granular para equipos empresariales
- **Acceso por API**: Acceso programático a tu biblioteca de prompts
- **Ecosistema de Integraciones**: Conexión con herramientas y plataformas de IA populares
- **Analíticas Mejoradas**: Seguimiento del rendimiento y uso de los prompts
- **Plantillas Personalizadas**: Crea plantillas reutilizables para casos de uso comunes
- **App Móvil**: Experiencia móvil nativa para acceso en cualquier lugar

## Contribuciones

¡Las contribuciones son bienvenidas! No dudes en enviar un Pull Request.

1. Haz un fork del repositorio
2. Crea tu rama de funcionalidad (`git checkout -b feature/funcionalidad-increíble`)
3. Haz commit de tus cambios (`git commit -m 'Agrega una funcionalidad increíble'`)
4. Haz push a la rama (`git push origin feature/funcionalidad-increíble`)
5. Abre un Pull Request

## Licencia

Distribuido bajo la [Licencia MIT](LICENSE).