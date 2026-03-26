# Railway Deployment Fix - Node 20 + Prod Build Alignment

Status: 🔄 In Progress - Step 1 Complete

## Steps:
- [x] **Plan approved** by user
- [x] **1. Edit package.json**: engines Node20, prebuild npm ci --omit=dev, simplified build (main only), start server.unified.js
- [ ] **2. Local test**: Clean install + npm run build to verify vite completes
- [ ] **3. Deploy**: npm run push / git push for Railway
- [ ] **4. Verify**: Railway logs + prod healthcheck

**Next**: Test local build.
