# Guia de Implementação Unificada

Este guia fornece instruções detalhadas para implementar a versão unificada da Escola de Dublagem, integrando os três aplicativos (Escola de Dublagem, Voz & Carreira, e UltimoHub) em uma única plataforma coesa.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Migração do Firebase para Supabase](#migração-do-firebase-para-supabase)
4. [Configuração do Servidor Unificado](#configuração-do-servidor-unificado)
5. [Integração do Módulo de Gravação de Áudio](#integração-do-módulo-de-gravação-de-áudio)
6. [Implantação no Railway](#implantação-no-railway)
7. [Solução de Problemas](#solução-de-problemas)

## Pré-requisitos

- Node.js 18.0.0 ou superior
- Conta no Supabase (https://supabase.com)
- Conta no Railway (https://railway.app)
- Git

## Configuração do Ambiente

### 1. Clone o repositório unificado

```bash
git clone <url-do-repositorio> escola-dublagem-unificado
cd escola-dublagem-unificado
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase

# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/escola_dublagem

# Stripe (opcional)
VITE_STRIPE_PUBLIC_KEY=sua_chave_publica_do_stripe
STRIPE_SECRET_KEY=sua_chave_secreta_do_stripe
```

### 3. Instale as dependências

```bash
# Substitua o package.json original pelo unificado
cp package.unified.json package.json

# Instale as dependências
npm install
```

## Migração do Firebase para Supabase

### 1. Configure o banco de dados Supabase

```bash
# Execute o script de configuração do banco de dados
npm run setup-db
```

Este script criará todas as tabelas necessárias no seu banco de dados Supabase.

### 2. Migre os dados do Firebase para o Supabase

```bash
# Execute o script de migração
npm run migrate-data
```

Este script transferirá todos os dados do Firebase para o Supabase.

### 3. Atualize os serviços para usar o Supabase

```bash
# Substitua o serviço de banco de dados pelo unificado
cp src/services/databaseService.unified.ts src/services/databaseService.ts
```

## Configuração do Servidor Unificado

### 1. Configure o servidor Express unificado

```bash
# Substitua o servidor original pelo unificado
cp server.unified.js server.js
```

### 2. Atualize a configuração do Railway

```bash
# Substitua a configuração do Railway pela unificada
cp railway.unified.json railway.json
```

## Integração do Módulo de Gravação de Áudio

### 1. Copie os arquivos otimizados de gravação de áudio

```bash
# Copie os arquivos otimizados para o diretório do UltimoHub
cp optimized-microphoneManager.ts ultimohub/client/src/audio/microphoneManager.ts
cp optimized-recordingEngine.ts ultimohub/client/src/audio/recordingEngine.ts
cp optimized-wavEncoder.ts ultimohub/client/src/audio/wavEncoder.ts
cp optimized-qualityAnalysis.ts ultimohub/client/src/audio/qualityAnalysis.ts
```

### 2. Copie o processador de áudio para o diretório público

```bash
# Copie o processador de áudio para o diretório público do UltimoHub
npm run copy-audio-processor
```

## Implantação no Railway

### 1. Inicialize o repositório Git (se ainda não estiver inicializado)

```bash
git init
git add .
git commit -m "Versão unificada da Escola de Dublagem"
```

### 2. Conecte ao Railway

```bash
# Instale a CLI do Railway (se ainda não estiver instalada)
npm install -g @railway/cli

# Faça login no Railway
railway login

# Vincule o projeto ao Railway
railway link

# Configure as variáveis de ambiente no Railway
railway variables set VITE_SUPABASE_URL=sua_url_do_supabase
railway variables set VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
railway variables set SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
railway variables set DATABASE_URL=sua_url_do_banco_de_dados_no_railway
```

### 3. Implante o projeto

```bash
# Implante o projeto no Railway
railway up
```

## Solução de Problemas

### Problemas com a gravação de áudio

Se você encontrar problemas com a gravação de áudio, verifique:

1. Se o arquivo `audio-processor.js` foi copiado corretamente para o diretório público do UltimoHub
2. Se o navegador suporta AudioWorklet (Chrome, Firefox e Edge modernos suportam)
3. Se as permissões de microfone foram concedidas

### Problemas com o WebSocket

Se você encontrar problemas com a sincronização de vídeo via WebSocket:

1. Verifique se o servidor está sendo executado corretamente
2. Verifique se o cliente está se conectando ao endpoint WebSocket correto
3. Verifique se o parâmetro `sessionId` está sendo passado corretamente na URL do WebSocket

### Problemas com o banco de dados

Se você encontrar problemas com o banco de dados:

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Verifique se as tabelas foram criadas corretamente no Supabase
3. Verifique se os dados foram migrados corretamente do Firebase para o Supabase

### Problemas com o Railway

Se você encontrar problemas com a implantação no Railway:

1. Verifique se o arquivo `railway.json` está configurado corretamente
2. Verifique se todas as variáveis de ambiente necessárias foram configuradas no Railway
3. Verifique os logs de implantação no Railway para identificar possíveis erros
