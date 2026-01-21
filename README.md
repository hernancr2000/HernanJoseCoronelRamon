# BP Products - Hernán Coronel

Aplicación Angular para gestión de productos financieros.

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

## Configuración y ejecución del Backend

Antes de ejecutar el backend, realizar los siguientes ajustes:

1. Instalar la dependencia `cors`:

   ```bash
   npm install cors
   ```

2. En el archivo `src/main.ts`, descomentar la línea de CORS:

   ```typescript
   const app = createExpressServer({
     cors: true, // ← Descomentar esta línea
     routePrefix: '/bp',
     // ...
   });
   ```

3. Iniciar el backend:

   ```bash
   npm run start:dev
   ```

## Ejecutar Pruebas Unitarias

```bash
npm test
```

## Cobertura de Pruebas

```bash
npm run test:coverage
```

## Tecnologías

- Angular 21
- TypeScript 5.9
- Vitest (Testing)
- RxJS
