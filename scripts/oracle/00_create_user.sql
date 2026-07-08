-- ============================================================
-- DBA Setup Script — Run as SYSDBA or privileged Oracle user
-- Creates the dash_module schema user
-- ============================================================

-- Create the user (schema)
CREATE USER dash_module IDENTIFIED BY test
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;

-- Grant required privileges
GRANT CONNECT, RESOURCE TO dash_module;
GRANT CREATE SESSION TO dash_module;
GRANT CREATE TABLE TO dash_module;
GRANT CREATE SEQUENCE TO dash_module;
GRANT CREATE INDEX TO dash_module;
GRANT CREATE VIEW TO dash_module;
GRANT UNLIMITED TABLESPACE TO dash_module;

COMMIT;
