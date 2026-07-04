# Oracle Database Migration to APP_CONTROL_MODULE

We are migrating the dashboard administration module from the old `DASH_MODULE` to the new `APP_CONTROL_MODULE` Oracle database. The user has set up a local Oracle instance.

## Proposed Changes

### 1. Environment Variables
#### [MODIFY] .env
- Replace `DASH_MODULE_DB_CONNECTION_STRING` with `APP_CONTROL_MODULE_DB_CONNECTION_STRING` using the local credentials: `APP_CONTROL_MODULE/test@localhost:1521/FREEPDB1`.

### 2. API Updates
#### [MODIFY] src/app/api/schools/route.ts
#### [MODIFY] src/app/api/online-linking/applications/route.ts
#### [MODIFY] src/app/api/online-linking/applications/[id]/route.ts
- Replace all SQL references from `"DASH_MODULE"."Schools"` to `"APP_CONTROL_MODULE"."Schools"`.
- Update `process.env.DASH_MODULE_DB_CONNECTION_STRING` to `process.env.APP_CONTROL_MODULE_DB_CONNECTION_STRING`.

### 3. Oracle Schema Migration
#### [NEW] scripts/migrate-oracle.ts
- Create a script that connects to the new `APP_CONTROL_MODULE` database.
- Execute `CREATE TABLE` statements for:
  - `"APP_CONTROL_MODULE"."Schools"`
  - `"APP_CONTROL_MODULE"."OnlineLinking"`
  - `"APP_CONTROL_MODULE"."LinkingReview"`

## Verification Plan
1. Run `npx tsx scripts/migrate-oracle.ts` to execute the table creation.
2. Verify the script outputs success messages for table creation.
3. Test the `Schools` and `Online Linking` APIs via the dashboard to ensure data is successfully read/written to the local Oracle instance without falling back to demo data.
