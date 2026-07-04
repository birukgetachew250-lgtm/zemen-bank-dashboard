# Oracle Database Migration to APP_CONTROL_MODULE

- `[ ]` Update `.env` with `APP_CONTROL_MODULE_DB_CONNECTION_STRING`
- `[x]` Update `src/app/api/schools/route.ts` (replace DASH_MODULE with APP_CONTROL_MODULE)
- `[x]` Update `src/app/api/online-linking/applications/route.ts` (replace DASH_MODULE with APP_CONTROL_MODULE)
- `[x]` Update `src/app/api/online-linking/applications/[id]/route.ts` (replace DASH_MODULE with APP_CONTROL_MODULE)
- `[x]` Create `scripts/migrate-oracle.ts` with `CREATE TABLE` statements
- `[ ]` Run `migrate-oracle.ts` to create tables in local Oracle DB
