# Plano de Integração: Unificação dos Três Aplicativos

## Diagnóstico Inicial

Após análise dos três aplicativos, identifiquei os seguintes pontos principais:

### 1. Estrutura Atual

- **Escola de Dublagem (Diretório Principal)**: 
  - Frontend React com Vite
  - Firebase para autenticação e armazenamento de dados
  - Stripe para pagamentos
  - Hospedado via Railway (railway.json existente)

- **UltimoHub**: 
  - Aplicação full-stack (Express + React)
  - PostgreSQL com Drizzle ORM
  - Sistema de autenticação próprio
  - Funcionalidades para estúdios, sessões de gravação e gerenciamento de usuários

- **Voz & Carreira - Portal de Dublagem**: 
  - Frontend React com Vite
  - Estrutura similar ao aplicativo principal

### 2. Principais Conflitos

- **Bancos de Dados Diferentes**: Firebase vs PostgreSQL
- **Sistemas de Autenticação Separados**: Firebase Auth vs sistema próprio do UltimoHub
- **Duplicação de Componentes**: Componentes UI similares em diferentes aplicativos
- **Scripts de Build/Deploy Separados**: Cada aplicativo tem seu próprio fluxo de build

## Plano de Unificação

### 1. Unificação do Banco de Dados (Supabase/PostgreSQL)

1. **Migrar dados do Firebase para PostgreSQL**:
   - Criar esquema unificado no PostgreSQL
   - Migrar dados do Firestore para tabelas PostgreSQL
   - Adaptar consultas Firebase para PostgreSQL

2. **Ponto único de conexão**:
   - Criar serviço centralizado de banco de dados
   - Implementar camada de abstração para operações de banco de dados

3. **Consolidação de variáveis de ambiente**:
   - Criar arquivo .env unificado
   - Padronizar nomes de variáveis de ambiente

### 2. Harmonização e Debugging

1. **Unificação de Rotas**:
   - Criar estrutura de roteamento hierárquica
   - Prefixar rotas para evitar conflitos

2. **Unificação de Dependências**:
   - Consolidar package.json
   - Resolver conflitos de versões
   - Remover dependências duplicadas

3. **Refatoração de Componentes**:
   - Criar biblioteca de componentes compartilhados
   - Padronizar estilos e comportamentos

### 3. Otimização para Railway

1. **Configuração de Entry Point Unificado**:
   - Criar servidor Express principal
   - Configurar para servir aplicativos frontend
   - Garantir uso correto da variável PORT

2. **Configuração de Build**:
   - Criar scripts de build unificados
   - Otimizar railway.json

3. **Configuração de Ambiente**:
   - Configurar variáveis de ambiente para Railway
   - Implementar fallbacks para desenvolvimento local
