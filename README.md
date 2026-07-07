# Carreiros do Paraná

Projeto desenolvido para a disciplina de Engenharia de Software, UTFPR campus Campo Mourão.

Carreiros do Paraná é uma plataforma web para descoberta, avaliação e organização de trilhas. Os usuários podem explorar trilhas em um mapa interativo, publicar avaliações, criar coleções personalizadas, interagir com outros usuários através do sistema de amizades e contribuir com sugestões de novas trilhas.

## Funcionalidades
- Cadastro e autenticação de usuários
- Verificação de e-mail
- Recuperação de senha
- Perfil público e privado
- Sistema de amizades
- Exploração de trilhas em mapa interativo
- Busca e filtros de trilhas
- Avaliações de trilhas
- Coleções personalizadas de trilhas
- Sugestão de novas trilhas
- Painéis administrativos

## Tecnologias

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- MapLibre GL JS

### Backend
- Express
- TypeScript
- Prisma ORM
- PostgreSQL + PostGIS
- Martin (Vector Tiles)

### Ferramentas
- pnpm Workspaces
- Vitest
- Playwright

# Estrutura do projeto
```
.
├── apps
│   ├── api       # Repositório do Backend
│   └── web       # Repositório do Frontend
├── packages
│   ├── database  # Repositório dedicado ao Prisma ORM
│   └── shared    # Repositório compartilhado com funções e definições de tipo
├── scripts       # Scripts utilitários para configuração e execução do projeto
├── nginx         # Configuração do proxy reverso nginx
└── martin        # Configuração do tile server Martin
```

# Requisitos
- Node.js 22+
- pnpm
- Docker e Docker Compose

# Instalação
Clone o repositório:
```bash
git clone https://github.com/LucasScopel/Carreiros-do-Paran-.git
cd "Carreiros-do-Paran-"
```

Cria o arquivo `.env` baseado no `.env.example` e preencha as variáveis vazias e placeholders:
```
POSTGRES_USER=admin
POSTGRES_PASSWORD=senhasegura123
POSTGRES_DB=dev_db
POSTGRES_PORT=5432
...
```

## Desenvolvimento

### 1. Instale as dependências:
```bash
pnpm install
```

### 2. Inicie a infraestrutura com Docker Compose

É possível que o docker crie o diretório `uploads` automaticamente, porém com outro usuário, impedindo que o Express possa adicionar arquivos ali, então criamos ele previamente.
```bash
mkdir uploads
```

```bash
pnpm docker:up
```

Serão iniciados:

- PostgreSQL/PostGIS
- Nginx
- Martin

### 3. Execute as migrations e crie o cliente Prisma

```bash
pnpm db:migrate
pnpm db:generate
```

### 4. Configure o Martin

```bash
pnpm martin:setup
```

Isso vai adicionar um usuário no PostgreSQL com permissões limitadas e criará a função que o Martin utilizará para recuperar trilhas no banco de dados.

### 5. Inicie a aplicação

```bash
pnpm dev
```

Ou individualmente:

Frontend:
```bash
pnpm dev:web
```

Backend:
```bash
pnpm dev:api
```

## Produção
No ambiente de produção, todos os processos são executados em containers Docker, não necessitando de configurações adicionais para além do `.env`:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
Também pode-se adicionar algo como `--env-file .env.production` para mudar o arquivo `.env` carregado.

# Scripts úteis
Criar usuário:
```bash
pnpm user create <email> <password> [--admin] [--verified]
```
```bash
# Cria usuário com email <name>@example.com e senha 123456
pnpm user create <name> [--admin] [--verified]
```

Dar ou tirar permissão de administrador:
```bash
pnpm user grant-admin <email>
pnpm user revoke-admin <email>
```

# Testes
Os testes unitários utilizam **Vitest**.
```bash
pnpm test:unit
```

Os testes E2E utilizam **Playwright**.
```bash
pnpm test:e2e
```

# Uso de LLM

