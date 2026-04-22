-- =============================================================================
-- Migration: AddTieredChargingAndPerTransactionLimits
-- Description: Adds tiered charging support and per-transaction limits
-- Date: 2026-04-22
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add ChargeType column to ChargeRules
-- -----------------------------------------------------------------------------
ALTER TABLE "LIMIT_CHARGE_MODULE"."ChargeRules"
ADD "ChargeType" NVARCHAR2(20) DEFAULT N'FLAT';

-- -----------------------------------------------------------------------------
-- 2. Add PerTransactionLimit column to LimitRules (rule-level, not per-interval)
-- -----------------------------------------------------------------------------
ALTER TABLE "LIMIT_CHARGE_MODULE"."LimitRules"
ADD "PerTransactionLimit" NUMBER(18,6);

-- -----------------------------------------------------------------------------
-- 3. Create ChargeTiers table
-- -----------------------------------------------------------------------------
CREATE TABLE "LIMIT_CHARGE_MODULE"."ChargeTiers"
(
  "Id"             NVARCHAR2(36)    NOT NULL ENABLE,
  "ChargeRuleId"   NVARCHAR2(36)    NOT NULL ENABLE,
  "TierName"       NVARCHAR2(100),
  "AmountFrom"     NUMBER(18,6)     DEFAULT 0            NOT NULL ENABLE,
  "AmountTo"       NUMBER(18,6),
  "Percentage"     NUMBER(18,6)     DEFAULT 0            NOT NULL ENABLE,
  "FixedAmount"    NUMBER(18,6)     DEFAULT 0            NOT NULL ENABLE,
  "VatPercentage"  NUMBER(18,6),
  "MinCharge"      NUMBER(18,6),
  "MaxCharge"      NUMBER(18,6),
  "Currency"       NVARCHAR2(10)    DEFAULT N'ETB'       NOT NULL ENABLE,
  "IsActive"       NUMBER(1,0)      DEFAULT 1            NOT NULL ENABLE,
  "DisplayOrder"   NUMBER(10,0)     DEFAULT 0            NOT NULL ENABLE,
  "InsertDate"     TIMESTAMP (6)    DEFAULT CURRENT_TIMESTAMP NOT NULL ENABLE,
  "UpdateDate"     TIMESTAMP (6)    DEFAULT CURRENT_TIMESTAMP NOT NULL ENABLE,
  "InsertUser"     NVARCHAR2(50)    DEFAULT N'system'    NOT NULL ENABLE,
  "UpdateUser"     NVARCHAR2(50)    DEFAULT N'system'    NOT NULL ENABLE,
  "Version"        RAW(2000)        DEFAULT HEXTORAW('') NOT NULL ENABLE,
  CONSTRAINT "PK_ChargeTiers" PRIMARY KEY ("Id"),
  CONSTRAINT "FK_ChargeTiers_ChargeRules_ChargeRuleId"
    FOREIGN KEY ("ChargeRuleId")
    REFERENCES "LIMIT_CHARGE_MODULE"."ChargeRules" ("Id")
    ON DELETE CASCADE ENABLE
)
SEGMENT CREATION DEFERRED
PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255
NOCOMPRESS LOGGING
TABLESPACE "USERS";

-- Indexes
CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_ChargeTiers_ChargeRuleId"
ON "LIMIT_CHARGE_MODULE"."ChargeTiers" ("ChargeRuleId")
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_ChargeTiers_IsActive"
ON "LIMIT_CHARGE_MODULE"."ChargeTiers" ("IsActive")
TABLESPACE "USERS";

-- Row-version trigger
CREATE OR REPLACE EDITIONABLE TRIGGER "LIMIT_CHARGE_MODULE"."rowversion_ChargeTiers"
BEFORE INSERT OR UPDATE ON "LIMIT_CHARGE_MODULE"."ChargeTiers"
FOR EACH ROW
BEGIN
  :NEW."Version" := UTL_RAW.CAST_FROM_BINARY_INTEGER(
    UTL_RAW.CAST_TO_BINARY_INTEGER(NVL(:OLD."Version", '00000000')) + 1
  );
END;
/
