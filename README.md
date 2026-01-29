# Flugo

## Pré-requisitos

- Node.js 18+
- npm, yarn ou pnpm

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Subir servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Build para produção

```bash
npm run build
```

O build é gerado na pasta `dist/`.

## Preview do build

```bash
npm run preview
```

## Estrutura do projeto

```
flugo/
├── public/              # Arquivos estáticos (imagens, etc.)
│   ├── images.jpeg
│   └── logo2.png
├── src/
│   ├── components/     # Componentes reutilizáveis
│   │   └── Layout.tsx
│   ├── pages/          # Páginas da aplicação
│   │   ├── Colaboradores.tsx
│   │   └── NovoColaborador.tsx
│   ├── services/      # Gateways (chamam back-end)
│   │   └── colaboradoresService.ts
│   ├── App.tsx         # Componente principal
│   ├── App.css
│   ├── main.tsx        # Entry point
│   ├── index.css       # Estilos globais
│   ├── theme.ts        # Tema (MUI)
│   └── vite-env.d.ts
├── back-end/           # Camada de dados e regras (front chama via src/services)
│   ├── data/           # Implementações (Firebase, mocks)
│   │   ├── firebase/   
│   │   │   ├── firestore/
│   │   │   │   └── colaborador.collection.ts
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   └── mocks/      
│   │       └── colaboradores.mock.ts
│   │
│   ├── domain/         # Regras e contratos (entidades, DTOs, repositórios)
│   │   ├── entities/   # Entidades de domínio
│   │   │   └── Colaborador.ts
│   │   ├── repositories/  # Contratos (interfaces) de repositório
│   │   │   └── ColaboradorRepository.ts
│   │   └── types/      
│   │       └── ColaboradorDTO.ts
│   │
│   └── interface/      # Porta de entrada (gateways usados pelo front)
│       └── gateways/
│           └── colaboradoresGateway.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vercel.json         # Config opcional para Vercel
```
