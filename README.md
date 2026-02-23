# Relatório Técnico — TaxiPet (monorepo)

**Resumo**

Este repositório é um monorepo com duas aplicações principais:
- Frontend: `apps/web` — app React + Vite + Tailwind para UI.
- Backend: `apps/pocketbase` — instância PocketBase (binário + migrations + hooks).

Abaixo está a análise detalhada de tecnologias, estrutura e comandos para rodar localmente e em produção.

**Frontend — Tecnologias e estrutura**

- Framework: React 18 (dependência `react`, `react-dom`).
- Bundler / Dev server: Vite (`vite`, `@vitejs/plugin-react`).
- Estilização: Tailwind CSS (`tailwindcss` e `tailwindcss-animate`).
- UI primitives: Radix UI (`@radix-ui/*`) e utilitários (`clsx`, `class-variance-authority`).
- Animações: `framer-motion`.
- Rotas: `react-router-dom` (v7).
- Integração PocketBase: pacote `pocketbase` usado no cliente (arquivo de cliente em `apps/web/src/lib/pocketbaseClient.js`).
- Estrutura principal:
  - `apps/web/src/main.jsx` — ponto de entrada que injeta `App` no DOM.
  - `apps/web/src/App.jsx` — configura `Router`, `Routes` e `ProtectedRoute`.
  - Componentes em `apps/web/src/components/` e páginas em `apps/web/src/pages/`.
  - Estilos globais em `apps/web/src/index.css` e Tailwind configurado em `apps/web/tailwind.config.js`.
- Alias: `@` aponta para `apps/web/src` (configurado em `vite.config.js`).

Observações de arquitetura:
- App usa provider de autenticação (`AuthContext.jsx`) e `ProtectedRoute` para rotas privadas.
- Comunicação com backend via `pocketbase` SDK; base URL padrão em `apps/web/src/lib/pocketbaseClient.js` como `/hcgi/platform` (provavelmente espera proxypass/roteamento no servidor ou no PocketBase).

**Backend — Tecnologias e estrutura (PocketBase)**

- Backend é uma instância PocketBase embutida no repositório (binário `apps/pocketbase/pocketbase`).
- Scripts (em `apps/pocketbase/package.json`):
  - `dev` — serve PocketBase em `0.0.0.0:8090` e usa a variável `PB_ENCRYPTION_KEY` para criptografia.
  - `start` — serve com `--dir=/data` e aponta `--migrationsDir=./pb_migrations` e `--hooksDir=./pb_hooks`.
  - `migrations:up` / `migrations:revert` — comandos para aplicar/reverter migrações.
- Migrations: `apps/pocketbase/pb_migrations/` contém scripts de migração (ex.: criação de coleções: users, pets, rides, ratings, etc.).
- Hooks: `apps/pocketbase/pb_hooks/` contém lógica de hooks (ex.: `superusers.pb.js`, `superusers-allow-list.js`) que restringem operações baseadas em IPs permitidos.
- Dados: `apps/pocketbase/pb_data/` contém arquivos de banco (SQLite) incluídos no repositório.

Observações de segurança e operação:
- É necessário fornecer `PB_ENCRYPTION_KEY` para executar PocketBase com criptografia.
- Hooks verificam IPs permitidos antes de permitir criação/atualização/exclusão de superusers.

**Comandos — como rodar o projeto localmente**

Pré-requisitos
- Node.js (recomendado >= 18)
- npm (ou yarn/pnpm; projeto usa npm + workspaces)
- PocketBase: o repositório já contém um binário (`apps/pocketbase/pocketbase`) — confirme se é para sua plataforma (Windows/macOS/Linux). Se não for compatível, baixe o binário apropriado em https://pocketbase.io
- Variáveis de ambiente: `PB_ENCRYPTION_KEY` (valor seguro/aleatório)

Instalação e execução (modo simples — monorepo)

1) Instalar dependências (na raiz do projeto):

```powershell
npm install
```

2) Rodar ambiente de desenvolvimento (frontend + backend simultâneo):

```powershell
# No Windows PowerShell
$env:PB_ENCRYPTION_KEY = "sua_chave_aqui"
npm run dev
```

O script `dev` da raiz usa `concurrently` para iniciar:
- `npm run dev --prefix apps/web` — inicia Vite (`http://localhost:3000` por padrão)
- `npm run dev --prefix apps/pocketbase` — inicia PocketBase (`http://0.0.0.0:8090`)

Se preferir executar apps separadamente:

Frontend (apenas web):
```powershell
cd apps/web
npm install
npm run dev
# Acesse http://localhost:3000
```

Backend (apenas pocketbase):
```powershell
cd apps/pocketbase
$env:PB_ENCRYPTION_KEY = "sua_chave_aqui"
# No Linux/macOS: ./pocketbase serve --http=0.0.0.0:8090 --encryptionEnv=PB_ENCRYPTION_KEY --hooksWatch=false
# No Windows PowerShell (se binário for .exe): .\pocketbase.exe serve --http=0.0.0.0:8090 --encryptionEnv=PB_ENCRYPTION_KEY --hooksWatch=false
npm run dev
```

Build (produção)

```powershell
# Executa build apenas do frontend e coloca saída em dist/
npm run build --workspace-root
# ou, na raiz (script já configurado):
npm run build
```

Notas sobre ambiente Windows
- Os scripts em `apps/pocketbase/package.json` usam `./pocketbase` (estilo Unix). Em PowerShell/Windows use `./pocketbase.exe` ou `.\binarioname.exe` conforme o arquivo local.
- Garanta permissão de execução para o binário no Linux/macOS (`chmod +x apps/pocketbase/pocketbase`).

Variáveis de ambiente úteis
- `PB_ENCRYPTION_KEY` — obrigatório para rodar PocketBase com criptografia.
- `NODE_ENV=production` — para builds de produção.
- `TEMPLATE_BANNER_SCRIPT_URL` / `TEMPLATE_REDIRECT_URL` — usadas condicionalmente pelo `vite.config.js` para injetar scripts no index HTML.

**Observações de rede / proxy**
- O `pocketbaseClient` do frontend usa `/hcgi/platform` como `POCKETBASE_API_URL`. Isso indica que em produção pode haver um proxy ou rota que mapeia `/hcgi/platform` para a API PocketBase. Em dev, o frontend costuma chamar diretamente o PocketBase (por porta), então você pode precisar configurar proxy no servidor de produção ou ajustar a constante para `http://localhost:8090` durante desenvolvimento.

Exemplo de ajuste temporário para desenvolvimento (apps/web/src/lib/pocketbaseClient.js):
```javascript
const POCKETBASE_API_URL = import.meta.env.DEV ? 'http://localhost:8090' : '/hcgi/platform';
```

**Resumo dos arquivos-chave**
- [package.json](package.json) — scripts de monorepo (`dev`, `build`, `start`, `lint`) e `workspaces`.
- [apps/web/package.json](apps/web/package.json) — dependências do frontend e scripts `dev | build | start`.
- [apps/web/vite.config.js](apps/web/vite.config.js) — configura Vite, plugins dev, alias `@` e injeção de handlers.
- [apps/web/tailwind.config.js](apps/web/tailwind.config.js) — configuração Tailwind.
- [apps/web/src/App.jsx](apps/web/src/App.jsx) — rotas e proteção de rotas.
- [apps/web/src/lib/pocketbaseClient.js](apps/web/src/lib/pocketbaseClient.js) — inicialização do SDK `pocketbase`.
- [apps/pocketbase/package.json](apps/pocketbase/package.json) — scripts PocketBase (serve, migrations).
- `apps/pocketbase/pb_migrations/` — migrations SQL/js para criar coleções.
- `apps/pocketbase/pb_hooks/` — hooks do PocketBase com lógica customizada.

**Melhorias recomendadas (opcionais)**
- Tornar `POCKETBASE_API_URL` configurável via `import.meta.env` para não depender de proxies em dev.
- Incluir documentação de variáveis de ambiente e instruções Windows no `README.md`.
- Não versionar o arquivo de dados SQLite em produção; usar mecanismo de backup/migrações.
- Adicionar `Makefile` ou `scripts` cross-platform (ex.: `cross-env`) para facilitar execução em Windows.

---

