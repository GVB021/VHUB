# 🚀 VHUB Platform - Railway Deployment Guide

Guia completo para deploy da plataforma VHUB no Railway.

## 📋 Requisitos Prévios

- Conta no Railway (railway.app)
- Projeto configurado no Supabase
- API Key do Gemini (Google AI)
- Repositório Git com código empurrado

## 🏗️ Arquitetura do Sistema

```
VHUB Platform
├── Main App (/) - Escola de Dublagem
├── Voz & Carreira (/voz-carreira) - Portal de Carreira
└── UltimoHub (/ultimohub) - Em desenvolvimento
```

## ⚡ Deploy Rápido

### 1. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório do projeto

### 2. Configurar Variáveis de Ambiente

No painel do Railway, vá em "Variables" e adicione:

**Obrigatórias:**
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
GEMINI_API_KEY=sua_chave_gemini
API_KEY=sua_chave_api
NODE_ENV=production
```

**Opcionais:**
```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
DAILY_CO_API_KEY=...
```

### 3. Configurações de Build

O projeto já inclui `railway.json` e `nixpacks.toml` configurados:

- **Build Command:** `npm ci && npm run build`
- **Start Command:** `node server.unified.js`
- **Health Check:** `/health`

### 4. Deploy Automático

O Railway detectará automaticamente:
- Runtime: Node.js 20
- Build: Vite + React
- Server: Express.js

Clique em "Deploy" e aguarde a construção.

## ✅ Verificação Pós-Deploy

### Endpoints para Testar

```
GET /health                    → Status da aplicação
GET /                          → Main App
GET /voz-carreira              → Portal de Carreira
GET /voz-carreira/health       → Health do Voz & Carreira
```

### Comandos de Teste

```bash
# Testar health check
curl https://seu-app.railway.app/health

# Testar Main App
curl https://seu-app.railway.app/

# Testar Voz & Carreira
curl https://seu-app.railway.app/voz-carreira
```

## 🔧 Configuração Manual (Alternativa)

Se preferir configurar manualmente no dashboard:

### Build Settings
- **Builder:** Nixpacks
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `node server.unified.js`

### Health Check
- **Path:** `/health`
- **Timeout:** 30 segundos
- **Interval:** 10 segundos

## 📊 Monitoramento

### Logs
```bash
railway logs
```

### Métricas
- CPU e Memória no dashboard do Railway
- Health check automático
- Restart automático em caso de falha

## 🔐 Segurança

### Variáveis Sensíveis
Todas as variáveis são criptografadas no Railway.

### Headers de Segurança
O servidor já inclui:
- Helmet para headers de segurança
- CORS configurado
- Rate limiting pronto

## 🚨 Troubleshooting

### Erro: "Cannot find module"
```bash
# Limpar cache e reinstalar
rm -rf node_modules
npm ci
```

### Erro: Porta em uso
```bash
# Railway define PORT automaticamente
# Não defina PORT manualmente nas variáveis
```

### Erro: Build falha
```bash
# Testar build localmente
npm run build
```

### Erro: Supabase não conecta
- Verifique se as variáveis estão corretas
- Teste a URL do Supabase no browser

## 📝 Variáveis de Ambiente Completas

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| VITE_SUPABASE_URL | Sim | URL do projeto Supabase |
| VITE_SUPABASE_ANON_KEY | Sim | Chave anon do Supabase |
| GEMINI_API_KEY | Sim | Chave API do Google Gemini |
| API_KEY | Sim | Chave para Voz & Carreira |
| NODE_ENV | Sim | production |
| VITE_STRIPE_PUBLIC_KEY | Não | Chave pública Stripe |
| DAILY_CO_API_KEY | Não | Chave Daily.co |

## 🎯 Próximos Passos

1. ✅ Deploy realizado
2. Configurar domínio customizado
3. Habilitar SSL
4. Configurar CDN (opcional)
5. Adicionar monitoring

## 📚 Documentação Relacionada

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia geral de deploy
- [README.md](./README.md) - Documentação do projeto
- [NAVIGATION_GUIDE.md](./NAVIGATION_GUIDE.md) - Navegação entre apps

---

**Suporte:** Em caso de problemas, verifique os logs do Railway e consulte a documentação.
