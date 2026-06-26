# TODO - Comentarios y buenas prácticas (ES)

- [x] Revisar y comentar todos los archivos TypeScript/TSX/JS/JSX en `front-end/src/` (análisis previo completado).
- [x] Mantener la lógica intacta (solo añadir comentarios y documentación en español).
- [x] Comentar: componentes (Cliente, Dashboard, Sidebar, LoginForm, ProfileCard), contextos (AuthContext, ClientContext), servicios (authService, supabaseService) y archivos de entrada (App, index).
- [x] Comentar también archivos CSS relevantes (`App.css`, `index.css`, `components/Client.css`).
- [x] Verificar que no haya errores de lint/compilación (ejecutar `npm test` o `npm run build`).
- [x] Actualizar el progreso en este archivo.

## Estado actual

- Rama de trabajo: `front_quemado`.
- Base de comentarios/documentación en español ya aplicada en los archivos principales.
- Validación de compilación completada con éxito.

## Resumen de componentes

- `App.tsx`: decide si se muestra el login o el dashboard segun la sesion activa.
- `LoginForm.tsx`: captura credenciales, valida el acceso y dispara el inicio de sesion.
- `Dashboard.tsx`: arma la vista principal con barra lateral, barra superior y modulo de clientes.
- `Sidebar.tsx`: muestra la navegacion lateral y el estado activo del modulo actual.
- `ClientTable.tsx`: lista los clientes, aplica busqueda local y renderiza las filas.
- `ClientRow.tsx`: representa una fila individual con nombre, empresa, estado, canal y fecha.
- `ProfileCard.tsx`: tarjeta auxiliar para mostrar un resumen basico de perfil.
- `AuthContext.tsx`: administra la sesion del usuario, el token y el cierre de sesion.
- `ClientContext.tsx`: concentra la lista de clientes y el estado de busqueda/filtro.
- `authService.ts`: contiene la logica de autenticacion contra el backend o credenciales demo.
- `supabaseService.ts`: centraliza la instancia de conexion con Supabase.
- `index.tsx`: punto de arranque de React que monta la aplicacion.
- `App.css`, `index.css` y `components/Client.css`: definen la presentacion visual de la app y del modulo de clientes.


