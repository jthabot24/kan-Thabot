# React shell

Run the shell against Kanboard with:

```sh
REACT_DEV_SERVER=http://127.0.0.1:5173 REACT_SHELL_AREAS=all php -S 127.0.0.1:8080 /home/ubuntu/router.php
cd frontend && npm install && npm run dev
```

Build production assets with `npm run build` or `make react`. Generated files are written to `assets/react/`.

`src/api/types.ts` is additive-only: feature streams append new entries and never edit existing ones. Only this infrastructure stream edits `src/api/client.ts` and `src/routes.tsx`.
