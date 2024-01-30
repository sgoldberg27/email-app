# Email app

API's para una aplicación que replica un mail server.

## Instrucciones
- Clonar este repositorio.
- Es necesario tener Node.js, npm y typescript instalados.
- Agregar el contenido de la carpeta `Modelos`, dentro de `Modelos.zip` en una carpeta de nombre `db`. Debería quedar así:

```
├── db
│   ├── drafts.json
│   ├── folders.json
│   ├── important.json
│   ├── inbox.json
│   ├── sent.json
│   ├── spam.json
│   └── starred.json

```

- Correr:

```bash
npm install
npm run start
npm run build
```

