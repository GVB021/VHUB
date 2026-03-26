# Railway npm ci Loop Fix - COMPLETED ✅

## Problem
- `npm ci` running in infinite loop during Railway deployment
- Build timeout with exit code 249
- EBUSY errors when removing `/app/node_modules/.cache`
- `postinstall` script recursively running `npm install` in subdirectories

## Root Causes Identified
1. **Duplicate npm ci calls**: nixpacks.toml had `npm ci` in both [phases.install] and [phases.build]
2. **Recursive postinstall**: package.json postinstall ran `npm install` in ultimohub/ and voz-&-carreira/ subdirectories
3. **Railway restart loop**: railway.unified.json had `restartPolicyType: ON_FAILURE` causing infinite retries
4. **Subproject build conflicts**: build:subprojects ran `npm run build` which could trigger more npm operations

## Fixes Applied

### 1. nixpacks.toml
- Removed `cmds = ['npm ci --include-optional']` from [phases.build]
- Kept `npm ci` only in [phases.install] to avoid duplicate execution

### 2. package.json
- Changed `postinstall` to echo message (disabled recursive npm install)
- Changed `build:subprojects` from `npm run build` to `npm ci --prefer-offline --no-audit --omit=dev`
- Added flags to speed up install and avoid cache conflicts

### 3. railway.unified.json
- Changed `restartPolicyType` from `ON_FAILURE` to `NEVER`
- Changed `restartPolicyMaxRetries` from `10` to `0`
- Prevents Railway from restarting failed builds (stops infinite loop)

## Deployment Instructions
```bash
# Commit changes
git add package.json railway.unified.json nixpacks.toml TODO.md
git commit -m "fix: resolve Railway npm ci loop and timeout issues"
git push origin main

# Deploy to Railway
railway up
```

## Verification
- [x] All configuration files updated
- [x] No duplicate npm ci calls
- [x] No recursive postinstall
- [x] Railway restart policy disabled
- [ ] Deploy and monitor logs for successful build
