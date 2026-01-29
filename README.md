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
├── public/          # Arquivos estáticos
├── src/
│   ├── App.tsx      # Componente principal
│   ├── App.css
│   ├── main.tsx     # Entry point
│   ├── index.css    # Estilos globais
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json      # Config opcional para Vercel
```
