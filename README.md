# Flugo

Aplicação de gestão de colaboradores: listagem em tabela e cadastro em etapas, com persistência em **Firebase Firestore**.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **MUI** (Material UI) + **React Router**
- **Firebase** (Firestore) para dados

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
```

Opcional: `VITE_FIREBASE_STORAGE_BUCKET` se for usar Storage.

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

- **Colaboradores** (`/colaboradores`): listagem em tabela com ordenação por nome, e-mail ou departamento; chips de status (Ativo/Inativo); botão “Novo Colaborador”.
- **Novo colaborador** (`/colaboradores/novo`): formulário em etapas (Infos Básicas → Infos Profissionais), validação de e-mail, seleção de departamento e status; persistência no Firestore.

## Estrutura do projeto

```
flugo/
├── public/
│   ├── images.jpeg
│   └── logo2.png
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Layout com sidebar e outlet
│   ├── pages/
│   │   ├── Colaboradores.tsx   # Listagem e tabela
│   │   └── NovoColaborador.tsx # Cadastro em steps
│   ├── services/
│   │   └── colaboradoresService.ts   # Chama o gateway
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   ├── index.css
│   ├── theme.ts                # Tema MUI
│   └── vite-env.d.ts
├── back-end/
│   ├── data/
│   │   ├── errors/
│   │   │   └── RepositoryError.ts
│   │   ├── firebase/
│   │   │   ├── colaborador.collection.ts   # Repo Firestore
│   │   │   └── config.ts                   # Init Firebase
│   │   └── mocks/
│   │       └── colaboradores.mock.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Colaborador.ts
│   │   ├── repositories/
│   │   │   └── ColaboradorRepository.ts
│   │   └── types/
│   │       └── ColaboradorDTO.ts
│   └── interface/
│       └── ColaboradoresGateway.ts   # Gateway (usa repositório)
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json                  # Deploy na Vercel
└── .env                         # Variáveis Firebase (não versionar)
```

O front chama `colaboradoresService`, que usa `ColaboradoresGateway`; o gateway delega ao `ColaboradorRepository` (implementação Firestore em `colaborador.collection`).

## Deploy (Vercel)

O `vercel.json` está configurado para build com Vite e output em `dist/`. Configure as variáveis de ambiente do projeto na Vercel (com o prefixo `VITE_`).
