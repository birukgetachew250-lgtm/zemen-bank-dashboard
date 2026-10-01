-- ============================================================
-- Migration: Add AccountClass and CustomerCategory columns
-- to USER_MODULE.Accounts table
-- Run this on the Oracle USER_MODULE database BEFORE deploying
-- ============================================================

ALTER TABLE "USER_MODULE"."Accounts"
  ADD ("AccountClass" VARCHAR2(50) NULL);

ALTER TABLE "USER_MODULE"."Accounts"
  ADD ("CustomerCategory" VARCHAR2(50) NULL);

-- Optional: add index for filtering by AccountClass
CREATE INDEX "IDX_Accounts_AccountClass"
  ON "USER_MODULE"."Accounts" ("AccountClass");

-- Verify columns were added
SELECT COLUMN_NAME, DATA_TYPE, NULLABLE
FROM ALL_TAB_COLUMNS
WHERE TABLE_NAME = 'Accounts'
  AND OWNER = 'USER_MODULE'
ORDER BY COLUMN_ID;
