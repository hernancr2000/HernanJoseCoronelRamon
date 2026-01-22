# BP Products - Hernán Coronel

Aplicación Angular para gestión de productos financieros bancarios.

## Funcionalidades

- **F1**: Listado de productos financieros
- **F2**: Búsqueda por nombre y descripción
- **F3**: Paginación (5, 10, 20 registros)
- **F4**: Registro de nuevos productos con validaciones
- **F5**: Edición de productos existentes
- **F6**: Eliminación con confirmación

## Requisitos Previos

- Node.js 18+
- npm 10+
- Backend corriendo en `http://localhost:3002`

## Instalación

```bash
npm install
```

## Ejecutar Aplicación

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Configuración del Backend

Antes de ejecutar el backend, realizar los siguientes ajustes:

1. Instalar la dependencia `cors`:

   ```bash
   npm install cors
   ```

2. En el archivo `src/main.ts`, habilitar CORS:

   ```typescript
   const app = createExpressServer({
     cors: true, // ← Habilitar esta línea
     routePrefix: '/bp',
     // ...
   });
   ```

3. Iniciar el backend:

   ```bash
   npm run start:dev
   ```

## Pruebas Unitarias

```bash
npm test
```

## Cobertura de Pruebas

```bash
npm run test:coverage
```

Cobertura actual: **>70%**

## Arquitectura

```tree
src/app/
├── core/                    # Lógica de negocio
│   ├── models/              # Interfaces/Modelos
│   └── services/            # Servicios HTTP
├── features/                # Módulos de funcionalidades
│   └── products/
│       └── pages/
│           ├── product-list/    # Listado de productos
│           └── product-form/    # Crear/Editar producto
└── shared/                  # Componentes compartidos
    ├── components/
    │   ├── toast/           # Notificaciones
    │   └── confirm-modal/   # Modal de confirmación
    └── services/
        └── notification.service.ts
```

## Validaciones del Formulario

| Campo            | Validación                          |
| ---------------- | ----------------------------------- |
| ID               | Requerido, 3-10 caracteres, único   |
| Nombre           | Requerido, 6-100 caracteres         |
| Descripción      | Requerido, 10-200 caracteres        |
| Logo             | Requerido (URL)                     |
| Fecha Liberación | Requerido, >= fecha actual          |
| Fecha Revisión   | Auto-calculada (liberación + 1 año) |

> **Nota**: Los campos de Descripción y Logo utilizan `textarea` para mejor visualización de contenido extenso.

## Decisiones Técnicas

- **Validación minLength del nombre en 6**: Alineado con las validaciones del backend para evitar errores de API.
- **Textarea para Descripción y Logo**: Mejor UX para campos que típicamente contienen texto largo o URLs extensas.
- **Botón "Volver"**: Permite regresar al listado desde el formulario sin necesidad de guardar cambios.
- **Signals de Angular**: Uso de signals para manejo de estado reactivo moderno.
- **Lazy Loading**: Carga diferida de componentes para mejor rendimiento.

## Tecnologías usadas

- Angular 21
- TypeScript 5.9
- Vitest (Testing)
- RxJS
- Angular Signals

## Autor

Hernán Coronel
