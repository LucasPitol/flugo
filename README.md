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
- **Colaboradores** (`/colaboradores`): listagem em tabela com ordenação por nome, e-mail, departamento ou status; chips de status (Ativo/Inativo); botão “Novo Colaborador”; botão “Editar” por linha abre **drawer de edição** (formulário com nome, e-mail, departamento, status; Salvar / Cancelar). No drawer, botão **“Excluir”** abre confirmação; ao confirmar, chama o service de exclusão individual, fecha o drawer, atualiza a lista e exibe toast. Exclusão em massa via seleção (checkbox) e “Excluir selecionados”, com diálogo de confirmação.
- **Novo colaborador** (`/colaboradores/novo`): formulário em etapas (Infos Básicas → Infos Profissionais), validação de e-mail, seleção de departamento e status; persistência no Firestore.
- **404** (`/404`): página não encontrada.

## Estrutura do projeto

```
flugo/
├── public/
│   ├── images.jpeg
│   └── logo2.png
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # Layout com sidebar e outlet
│   │   ├── ProtectedRoute.tsx   # Proteção de rotas privadas
│   │   └── ui/
│   │       ├── AppButton.tsx
│   │       ├── AppCard.tsx
│   │       ├── AppSnackbar.tsx
│   │       ├── EmptyState.tsx
│   │       ├── PageHeader.tsx
│   │       ├── StatusChip.tsx
│   │       └── index.ts         # Exporta componentes do design system
│   ├── contexts/
│   │   └── AuthContext.tsx      # Estado de autenticação
│   ├── pages/
│   │   ├── Cadastro.tsx
│   │   ├── Colaboradores/
│   │   │   ├── ColaboradoresPage.tsx   # Página: header, snackbars, diálogos
│   │   │   ├── ColaboradoresTable.tsx  # Tabela com ordenação e seleção
│   │   │   ├── ColaboradorEditDrawer.tsx   # Drawer de edição e exclusão única
│   │   │   ├── hooks/
│   │   │   │   └── useColaboradores.ts     # Estado e lógica da listagem/edição
│   │   │   └── index.ts                    # Re-exporta Colaboradores
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   └── NovoColaborador.tsx
│   ├── services/
│   │   └── colaboradoresService.ts   # listar, criar, update, delete, bulkDelete
│   ├── theme/
│   │   ├── index.ts             # Exporta theme e tokens
│   │   ├── theme.ts             # Tema MUI
│   │   ├── tokens.ts            # Cores, tipografia, espaçamentos, etc.
│   │   └── README.md            # Guia do design system
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
│   │   │   ├── auth.ts                     # Repo Firebase Auth
│   │   │   ├── colaborador.collection.ts   # Repo Firestore
│   │   │   └── config.ts                   # Init Firebase
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
│   │       └── ColaboradorDTO.ts
│   └── interface/
│       ├── AuthGateway.ts            # Gateway auth (Firebase Auth)
│       └── ColaboradoresGateway.ts   # listar, criar, editar, excluir, excluirEmMassa
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json                  # Deploy na Vercel
└── .env                         # Variáveis Firebase (não versionar)
```

## Deploy (Vercel)

O `vercel.json` está configurado para build com Vite e output em `dist/`. Configure as variáveis de ambiente do projeto na Vercel (com o prefixo `VITE_`).
