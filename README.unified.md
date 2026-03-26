# Escola de Dublagem - Plataforma Unificada

Uma plataforma completa para ensino de dublagem, gerenciamento de estúdios e desenvolvimento de carreira para dubladores, unificando três aplicações em uma única solução integrada.

## Visão Geral

Este projeto unifica três aplicações anteriormente separadas:

1. **Escola de Dublagem (Principal)**: Portal educacional com cursos, professores e sistema de matrícula
2. **Voz & Carreira**: Portal focado em desenvolvimento de carreira para dubladores
3. **UltimoHub**: Sistema de gerenciamento de estúdios e sessões de gravação

A unificação traz diversas vantagens:
- Experiência de usuário integrada
- Banco de dados centralizado
- Autenticação unificada
- Implantação simplificada
- Manutenção mais eficiente

## Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express, WebSockets
- **Banco de Dados**: PostgreSQL via Supabase
- **Autenticação**: Supabase Auth
- **Implantação**: Railway

## Estrutura do Projeto

```
escola-dublagem-unificado/
├── src/                      # Código-fonte principal
│   ├── components/           # Componentes React
│   ├── lib/                  # Utilitários e helpers
│   ├── services/             # Serviços (API, banco de dados)
│   ├── store/                # Gerenciamento de estado (Zustand)
│   └── types/                # Definições de tipos TypeScript
├── ultimohub/                # Código-fonte do UltimoHub
│   ├── client/               # Frontend do UltimoHub
│   └── server/               # Backend do UltimoHub
├── voz-&-carreira---portal-de-dublagem/ # Código-fonte do portal Voz & Carreira
├── public/                   # Arquivos estáticos
├── scripts/                  # Scripts de utilidade
│   ├── setup-database.js     # Configuração do banco de dados
│   └── migrate-firebase-to-postgres.js # Migração de dados
├── server.js                 # Servidor Express unificado
├── package.json              # Dependências e scripts
└── railway.json              # Configuração de implantação
```

## Funcionalidades Principais

### Escola de Dublagem
- Catálogo de cursos e módulos
- Perfis de professores
- Sistema de matrícula
- Depoimentos e FAQ

### Minicursos
- Biblioteca de minicursos gratuitos
- Sistema de progresso do aluno
- Conteúdo em vídeo e texto

### UltimoHub
- Gerenciamento de estúdios
- Agendamento de sessões
- Gravação de áudio de alta fidelidade
- Sincronização de vídeo em tempo real

## Começando

### Pré-requisitos

- Node.js 18.0.0 ou superior
- Conta no Supabase (https://supabase.com)
- Conta no Railway (opcional, para implantação)

### Instalação

1. Clone o repositório
   ```bash
   git clone <url-do-repositorio> escola-dublagem-unificado
   cd escola-dublagem-unificado
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente
   Crie um arquivo `.env.local` na raiz do projeto com:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/escola_dublagem
   ```

4. Configure o banco de dados
   ```bash
   npm run setup-db
   ```

5. Migre os dados (se estiver migrando do Firebase)
   ```bash
   npm run migrate-data
   ```

6. Execute o projeto em modo de desenvolvimento
   ```bash
   npm run dev
   ```

### Implantação

Para implantar no Railway:

1. Instale a CLI do Railway
   ```bash
   npm install -g @railway/cli
   ```

2. Faça login e vincule o projeto
   ```bash
   railway login
   railway link
   ```

3. Configure as variáveis de ambiente
   ```bash
   railway variables set VITE_SUPABASE_URL=sua_url_do_supabase
   railway variables set VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   railway variables set SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
   ```

4. Implante o projeto
   ```bash
   railway up
   ```

## Documentação Adicional

- [Guia de Implementação Unificada](./guia-implementacao-unificada.md)
- [Guia de Otimização de Gravação de Áudio](./audio-recording-optimization-guide.md)
- [Guia de Uso dos Agency Agents](./guia-agency-agents.md)

## Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
