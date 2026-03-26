# Fix Railway Rollup Build Error - TODO

## Plan Breakdown (Approved)
1. [✅] Update package.json: Add prebuild script (rm node_modules/package-lock + npm install full), update build script with clean/prebuild.
2. [✅] Update package.unified.json: Align scripts with package.json changes.
3. [✅] Update railway.unified.json: Modify buildCommand to use prebuild.
4. [✅] Create nixpacks.toml: Explicit Node/Railway build config.
5. [✅] Test local: Run npm run build, verify success.
6. [✅] Commit/push/deploy: railway up, check logs.
7. [✅] Mark complete: attempt_completion.

Progress will be updated after each step.

