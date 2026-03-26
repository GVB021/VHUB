FROM node:20-slim

RUN apt-get update && apt-get install -y git ca-certificates --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .

# Vite build-time env vars (Railway passes these as Docker build args)
# SUPABASE_URL is the Railway variable name -> mapped to VITE_SUPABASE_URL for Vite
ARG SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG GEMINI_API_KEY
ARG API_KEY
ARG VITE_STRIPE_PUBLIC_KEY

ENV VITE_SUPABASE_URL=$SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV API_KEY=$API_KEY
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

RUN npm run build

# Clone UltimoHub if Railway didn't recursively clone the submodule
RUN if [ ! -f ultimohub/package.json ]; then \
      git clone --depth 1 https://github.com/GVB021/ultimohub.git ultimohub_tmp \
      && cp -a ultimohub_tmp/. ultimohub/ \
      && rm -rf ultimohub_tmp; \
    fi

# Build UltimoHub client
RUN cd ultimohub && npm ci --prefer-offline --no-audit --no-fund && npx vite build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.unified.js"]
