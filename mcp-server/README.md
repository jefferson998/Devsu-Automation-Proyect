# ClickUp MCP Server

Servidor MCP (Model Context Protocol) para gestión de tareas en ClickUp. Permite a agentes de IA crear, actualizar, listar y eliminar tareas en ClickUp a través de herramientas estandarizadas.

## Características

- **Gestión completa de tareas**: Crear, leer, actualizar, eliminar
- **Filtrado avanzado**: Por estado, asignado, fecha de vencimiento
- **Comentarios**: Agregar y leer comentarios en tareas
- **Estructura ClickUp**: Navegar equipos, espacios, listas
- **Autenticación**: Token de API de ClickUp

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp mcp-server/.env.example mcp-server/.env
# Editar mcp-server/.env con tus credenciales
```

3. Variables requeridas:
- `CLICKUP_API_TOKEN`: Tu token de API de ClickUp
- `CLICKUP_TEAM_ID`: ID de tu equipo/workspace
- `CLICKUP_DEFAULT_LIST_ID`: (Opcional) ID de lista por defecto

## Obtener credenciales de ClickUp

1. **API Token**: 
   - Ve a ClickUp → Settings (configuración) → Apps
   - Genera un token de API personal

2. **Team ID**:
   ```bash
   curl -H "Authorization: TU_TOKEN" \
     https://api.clickup.com/api/v2/team
   ```

3. **List ID**:
   - Navega a tu lista en ClickUp
   - El ID está en la URL: `/li/XXXXXXXXX`

## Uso

### Iniciar servidor

```bash
# Producción
npm run mcp:start

# Desarrollo (con auto-reload)
npm run mcp:dev
```

### Integrar con Claude/Cursor

Agregar a tu configuración de MCP (`mcp.json` o `mcp_config.json`):

```json
{
  "mcpServers": {
    "clickup": {
      "command": "node",
      "args": ["/ruta/al/proyecto/mcp-server/index.js"],
      "env": {
        "CLICKUP_API_TOKEN": "tu_token",
        "CLICKUP_TEAM_ID": "tu_team_id",
        "CLICKUP_DEFAULT_LIST_ID": "tu_list_id"
      }
    }
  }
}
```

## Herramientas disponibles

### Gestión de usuario y estructura
- `clickup_get_user` - Información del usuario autenticado
- `clickup_get_teams` - Listar equipos/workspaces
- `clickup_get_spaces` - Listar espacios en un team
- `clickup_get_lists` - Listar listas en un espacio
- `clickup_get_statuses` - Estados disponibles en una lista

### Gestión de tareas
- `clickup_get_tasks` - Listar tareas (con filtros opcionales)
- `clickup_get_task` - Obtener detalle de una tarea específica
- `clickup_create_task` - Crear nueva tarea
- `clickup_update_task` - Actualizar tarea existente
- `clickup_delete_task` - Eliminar tarea

### Comentarios
- `clickup_add_comment` - Agregar comentario a tarea
- `clickup_get_comments` - Obtener comentarios de una tarea

## Ejemplos de uso

### Crear una tarea
```json
{
  "name": "clickup_create_task",
  "arguments": {
    "name": "Implementar login",
    "description": "Crear flujo de autenticación con OAuth",
    "status": "to do",
    "priority": 2,
    "due_date": 1704067200000
  }
}
```

### Listar tareas pendientes
```json
{
  "name": "clickup_get_tasks",
  "arguments": {
    "status": "to do",
    "limit": 50
  }
}
```

### Actualizar estado
```json
{
  "name": "clickup_update_task",
  "arguments": {
    "task_id": "ABC-123",
    "status": "in progress",
    "assignees": { "add": [12345678] }
  }
}
```

## Estructura del proyecto

```
mcp-server/
├── index.js              # Servidor MCP principal
├── clickup-client.js     # Cliente HTTP para ClickUp API
├── .env.example          # Ejemplo de variables de entorno
└── README.md             # Este archivo
```

## Scripts npm

- `npm run mcp:start` - Iniciar servidor MCP
- `npm run mcp:dev` - Iniciar con nodemon (auto-reload)

## API de ClickUp

Documentación oficial: https://clickup.com/api

## Licencia

ISC
