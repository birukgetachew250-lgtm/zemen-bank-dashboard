CREATE TABLE "LIMIT_CHARGE_MODULE"."CustomerLimitUsages"
(
  "Id" NVARCHAR2(36) NOT NULL ENABLE,
  "CIFNumber" NVARCHAR2(25) NOT NULL ENABLE,
  "CustomerCategoryId" NVARCHAR2(36),
  "TransactionTypeId" NVARCHAR2(36),
  "ServiceName" NVARCHAR2(200) NOT NULL ENABLE,
  "Currency" NVARCHAR2(10) DEFAULT N'ETB' NOT NULL ENABLE,
  "DailyPeriodStart" TIMESTAMP (6) NOT NULL ENABLE,
  "DailyPeriodEnd" TIMESTAMP (6) NOT NULL ENABLE,
  "DailyAmountUsed" NUMBER(18,6) DEFAULT 0.0 NOT NULL ENABLE,
  "DailyTransactionCount" NUMBER(10,0) DEFAULT 0 NOT NULL ENABLE,
  "WeeklyPeriodStart" TIMESTAMP (6) NOT NULL ENABLE,
  "WeeklyPeriodEnd" TIMESTAMP (6) NOT NULL ENABLE,
  "WeeklyAmountUsed" NUMBER(18,6) DEFAULT 0.0 NOT NULL ENABLE,
  "WeeklyTransactionCount" NUMBER(10,0) DEFAULT 0 NOT NULL ENABLE,
  "MonthlyPeriodStart" TIMESTAMP (6) NOT NULL ENABLE,
  "MonthlyPeriodEnd" TIMESTAMP (6) NOT NULL ENABLE,
  "MonthlyAmountUsed" NUMBER(18,6) DEFAULT 0.0 NOT NULL ENABLE,
  "MonthlyTransactionCount" NUMBER(10,0) DEFAULT 0 NOT NULL ENABLE,
  "AppliedLimitRuleId" NVARCHAR2(36),
  "AppliedExceptionId" NVARCHAR2(36),
  "IsActive" NUMBER(1,0) DEFAULT (1) NOT NULL ENABLE,
  "LastTransactionDate" TIMESTAMP (6) NOT NULL ENABLE,
  "LastDailyReset" TIMESTAMP (6),
  "LastWeeklyReset" TIMESTAMP (6),
  "LastMonthlyReset" TIMESTAMP (6),
  "InsertDate" TIMESTAMP (6) DEFAULT (CURRENT_TIMESTAMP) NOT NULL ENABLE,
  "UpdateDate" TIMESTAMP (6) DEFAULT (CURRENT_TIMESTAMP) NOT NULL ENABLE,
  "InsertUser" NVARCHAR2(50) DEFAULT N'system' NOT NULL ENABLE,
  "UpdateUser" NVARCHAR2(50) DEFAULT N'system' NOT NULL ENABLE,
  CONSTRAINT "PK_CustomerLimitUsages" PRIMARY KEY ("Id"),
  CONSTRAINT "FK_CustomerLimitUsages_CustomerCategories_CustomerCategoryId"
    FOREIGN KEY ("CustomerCategoryId")
    REFERENCES "LIMIT_CHARGE_MODULE"."CustomerCategories" ("Id") ENABLE,
  CONSTRAINT "FK_CustomerLimitUsages_TransactionTypes_TransactionTypeId"
    FOREIGN KEY ("TransactionTypeId")
    REFERENCES "LIMIT_CHARGE_MODULE"."TransactionTypes" ("Id") ENABLE,
  CONSTRAINT "FK_CustomerLimitUsages_LimitRules_AppliedLimitRuleId"
    FOREIGN KEY ("AppliedLimitRuleId")
    REFERENCES "LIMIT_CHARGE_MODULE"."LimitRules" ("Id") ENABLE,
  CONSTRAINT "FK_CustomerLimitUsages_LimitExceptions_AppliedExceptionId"
    FOREIGN KEY ("AppliedExceptionId")
    REFERENCES "LIMIT_CHARGE_MODULE"."LimitExceptions" ("Id") ENABLE
)
SEGMENT CREATION IMMEDIATE
PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255
NOCOMPRESS LOGGING
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_CustomerLimitUsages_CustomerCategoryId"
ON "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" ("CustomerCategoryId")
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_CustomerLimitUsages_TransactionTypeId"
ON "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" ("TransactionTypeId")
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_CustomerLimitUsage_CIF_Service_Type"
ON "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" ("CIFNumber", "ServiceName", "TransactionTypeId")
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_CustomerLimitUsage_CIFNumber"
ON "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" ("CIFNumber")
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_CustomerLimitUsage_DailyPeriodEnd"
ON "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" ("DailyPeriodEnd")
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_CustomerLimitUsage_WeeklyPeriodEnd"
ON "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" ("WeeklyPeriodEnd")
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_CustomerLimitUsage_MonthlyPeriodEnd"
ON "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" ("MonthlyPeriodEnd")
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_CustomerLimitUsages_AppliedLimitRuleId"
ON "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" ("AppliedLimitRuleId")
TABLESPACE "USERS";

CREATE INDEX "LIMIT_CHARGE_MODULE"."IX_CustomerLimitUsages_AppliedExceptionId"
ON "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" ("AppliedExceptionId")
TABLESPACE "USERS";
