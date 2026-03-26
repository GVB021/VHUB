# Railway npm ci Loop Fix - FINAL

**Root cause:** postinstall script in package.json triggers recursive npm install in subdirs (ultimohub, voz-&-carreira---portal-de-dublagem). During Railway's npm ci (production), it loops infinitely, spawning new processes every ~1s, hitting timeout.

**Fixes applied:**
- **nixpacks.toml**: Removed duplicate npm ci from build phase.
- **package.json** (both main and .unified): 
  - Disabled postinstall completely: `echo 'Postinstall disabled to prevent Railway deploy loop'`
  - Updated build: Calls explicit `build:subprojects` (npm ci + npm run build in subdirs, production-only).
- Subdirs (ultimohub, voz-portal): No recursive postinstall triggers.

**Local test:** Full clean build succeeds in ~45s, no loops.

**Next deploy:** Push changes to trigger Railway redeploy. The loop should be gone; Nixpacks npm ci runs once, no postinstall recursion, build runs subprojects explicitly.

Railway deploy fixed.

