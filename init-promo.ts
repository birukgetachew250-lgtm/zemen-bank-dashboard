import { executeQuery } from './src/lib/oracle-db';
import * as dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

async function run() {
  const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
  try {
    const res: any = await executeQuery(CS, `
      SELECT count(*) as "cnt" 
      FROM all_tables 
      WHERE owner = 'APP_CONTROL_MODULE' AND table_name = 'PromoAd'
    `);
    
    if (res.rows[0].cnt === 0 || res.rows[0].cnt === '0') {
      console.log("Creating PromoAd table...");
      await executeQuery(CS, `
        CREATE TABLE "APP_CONTROL_MODULE"."PromoAd" (
            "Id" VARCHAR2(100) NOT NULL,
            "Title" VARCHAR2(200) NOT NULL,
            "Subtitle" VARCHAR2(500),
            "PageNumber" NUMBER(10) NOT NULL,
            "Description" VARCHAR2(1000),
            "TargetUrl" VARCHAR2(500),
            "ImageUrl" VARCHAR2(500),
            "ThumbnailUrl" VARCHAR2(500),
            "DisplayOrder" NUMBER(10) DEFAULT 0,
            "AdType" VARCHAR2(50),
            "IsIFB" NUMBER(1) DEFAULT 0 NOT NULL,
            "StartDate" TIMESTAMP,
            "EndDate" TIMESTAMP,
            "Status" VARCHAR2(30) DEFAULT 'Active',
            "ViewCount" NUMBER(10) DEFAULT 0,
            "ClickCount" NUMBER(10) DEFAULT 0,
            "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "CreatedBy" VARCHAR2(50) DEFAULT 'system',
            "UpdatedBy" VARCHAR2(50) DEFAULT 'system',
            "Version" RAW(8),
            CONSTRAINT PK_PromoAd PRIMARY KEY ("Id")
        )
      `);
      console.log("Table created.");
    } else {
      console.log("PromoAd table exists. Ensuring IsIFB column exists...");
      try {
        await executeQuery(CS, `ALTER TABLE "APP_CONTROL_MODULE"."PromoAd" ADD "IsIFB" NUMBER(1) DEFAULT 0 NOT NULL`);
        console.log("IsIFB column added.");
      } catch (err: any) {
        if (err.message.includes("ORA-01430")) {
           console.log("IsIFB column already exists.");
        } else {
           throw err;
        }
      }
    }
  } catch (err: any) {
    console.error("DB Error:", err.message);
  }
  process.exit(0);
}

run();
