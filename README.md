# Flugo

Aplicação de gestão de colaboradores: listagem em tabela, cadastro em etapas, edição e exclusão individual, com **Firebase Auth** (login/cadastro) e persistência em **Firebase Firestore**.

Acesse [https://flugo-six.vercel.app](https://flugo-six.vercel.app).

## Stack

- **React 18** + **TypeScript** + **Vite**
- **MUI** (Material UI) + **React Router**
- **Firebase** (Auth + Firestore)

## Pré-requisitos

- Node.js 18+
- npm, yarn ou pnpm

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_STORAGE_BUCKET=
```

## Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Build e preview

```bash
npm run build
npm run preview
```

O build sai em `dist/`. O preview serve o build localmente.

## Funcionalidades

- **Login** (`/login`) e **Cadastro** (`/cadastro`): autenticação via Firebase Auth. Rotas privadas protegidas por `ProtectedRoute`.
- **Colaboradores** (`/colaboradores`): listagem em tabela com ordenação por nome, e-mail, departamento ou status; chips de status (Ativo/Inativo); **Filtros** (drawer com nome, e-mail, departamento; Limpar / Aplicar); botão “Novo colaborador”; quando há seleção, o header mostra “X selecionados” e “Excluir selecionados” (botão “Novo” e “Filtros” ficam ocultos). Botão “Editar” por linha abre **drawer de edição** (nome, e-mail, departamento, status; Salvar / Excluir). Exclusão em massa via seleção e diálogo de confirmação.
- **Novo colaborador** (`/colaboradores/novo`): formulário em etapas (Infos Básicas → Infos Profissionais), validação de e-mail, seleção de departamento e status; persistência no Firestore.
- **404** (`/404`): página não encontrada.

## Arquitetura (front × back)

- **UI não conhece domínio:** páginas, hooks, contexts e components em `src/` **não** importam `back-end/domain`. Contratos da UI ficam em **services** (tipos, inputs, filtros).
- **Service é a fronteira:** apenas `src/services/*` pode importar `back-end/domain` e `back-end/interface`. O service mapeia DTOs do domínio para os tipos expostos à UI (e vice-versa).
- **Checklist:** Page / Hook / Context / Component → ❌ domain. Service / Gateway → ✅ domain.

## Estrutura do projeto

```
flugo/
├── public/
│   ├── images.jpeg
│   └── logo2.png
├── src/
│   ├── components/
│   │   ├── colaboradores/
│   │   │   └── ColaboradoresFilters.tsx   # Drawer de filtros (nome, email, departamento)
│   │   ├── Layout.tsx                     # Layout com sidebar e outlet
│   │   ├── ProtectedRoute.tsx             # Proteção de rotas privadas
│   │   └── ui/
│   │       ├── AppButton.tsx
│   │       ├── AppCard.tsx
│   │       ├── AppSnackbar.tsx
│   │       ├── EmptyState.tsx
│   │       ├── PageHeader.tsx
│   │       ├── StatusChip.tsx
│   │       └── index.ts                   # Exporta componentes do design system
│   ├── contexts/
│   │   └── AuthContext.tsx                # Estado de autenticação (usa authService)
│   ├── pages/
│   │   ├── Cadastro.tsx
│   │   ├── Colaboradores/
│   │   │   ├── ColaboradoresPage.tsx      # Página: header, filtros, snackbars, diálogos
│   │   │   ├── ColaboradoresTable.tsx     # Tabela com ordenação e seleção
│   │   │   ├── ColaboradorEditDrawer.tsx  # Drawer de edição e exclusão única
│   │   │   ├── hooks/
│   │   │   │   └── useColaboradores.ts    # Estado e lógica da listagem/edição/filtros
│   │   │   └── index.ts
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   └── NovoColaborador.tsx
│   ├── services/
│   │   ├── auth/
│   │   │   ├── errors.ts                  # AuthServiceError (UI não conhece AuthError de back-end/data)
│   │   │   └── types.ts                   # Contrato UI: AuthUser
│   │   ├── authService.ts                 # login, register, logout, onAuthStateChanged (captura AuthError → AuthServiceError)
│   │   ├── colaboradores/
│   │   │   └── types.ts                   # Contratos UI: Colaborador, CreateColaboradorInput, UpdateColaboradorInput, ColaboradoresFilter
│   │   └── colaboradoresService.ts       # listar, criar, update, delete, bulkDelete (mapeia domain ↔ UI)
│   ├── theme/
│   │   ├── index.ts
│   │   ├── theme.ts
│   │   ├── tokens.ts
│   │   └── README.md
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── back-end/
│   ├── data/
│   │   ├── errors/
│   │   │   ├── AuthError.ts
│   │   │   └── RepositoryError.ts
│   │   ├── firebase/
│   │   │   ├── auth.ts
│   │   │   ├── colaborador.collection.ts
│   │   │   └── config.ts
│   │   └── mocks/
│   │       └── colaboradores.mock.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Colaborador.ts
│   │   ├── repositories/
│   │   │   ├── AuthRepository.ts
│   │   │   └── ColaboradorRepository.ts
│   │   └── types/
│   │       ├── AuthTypes.ts
│   │       ├── ColaboradorDTO.ts
│   │       └── ColaboradoresFilter.ts
│   └── interface/
│       ├── AuthGateway.ts
│       └── ColaboradoresGateway.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json
└── .env
```

### Observação sobre arquitetura

- **`back-end/*`:** importado apenas por `src/services/*`. A UI (pages, hooks, contexts, components) não importa nada de `back-end/domain` nem de `back-end/data`. O authService captura `AuthError` da infraestrutura e lança `AuthServiceError` (camada de aplicação); Login e Cadastro usam apenas `AuthServiceError` de `src/services/auth/errors`. ✅

## Deploy (Vercel)

O `vercel.json` está configurado para build com Vite e output em `dist/`. Configure as variáveis de ambiente do projeto na Vercel (com o prefixo `VITE_`).
