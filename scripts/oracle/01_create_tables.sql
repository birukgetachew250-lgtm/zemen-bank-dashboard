-- ============================================================
-- Zemen Bank Dashboard Module - Oracle DDL
-- Schema/User: dash_module
-- Run as: dash_module user or DBA granting to dash_module
-- ============================================================

-- ─── Sequences for auto-increment IDs ───────────────────────

CREATE SEQUENCE seq_users       START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_roles       START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_customers   START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_approvals   START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_activity    START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_pwd_history START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_ip_whitelist START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_otp_codes   START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_ips_banks   START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_ips_wallets START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- ─── 1. USERS ───────────────────────────────────────────────

CREATE TABLE DASH_USERS (
  id                     NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id            VARCHAR2(100)   NOT NULL UNIQUE,
  name                   VARCHAR2(255)   NOT NULL,
  email                  VARCHAR2(255)   NOT NULL UNIQUE,
  password               VARCHAR2(500)   NOT NULL,
  role                   VARCHAR2(100)   NOT NULL,
  branch                 VARCHAR2(100),
  department             VARCHAR2(100)   NOT NULL,
  created_at             TIMESTAMP       DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at             TIMESTAMP       DEFAULT SYSTIMESTAMP NOT NULL,
  mfa_enabled            NUMBER(1)       DEFAULT 0 NOT NULL,
  status                 VARCHAR2(50)    DEFAULT 'Active' NOT NULL,
  failed_login_attempts  NUMBER          DEFAULT 0 NOT NULL,
  is_locked              NUMBER(1)       DEFAULT 0 NOT NULL,
  last_login_attempt     TIMESTAMP,
  session_invalidated_at TIMESTAMP,
  password_changed_at    TIMESTAMP
);

-- ─── 2. ROLES ───────────────────────────────────────────────

CREATE TABLE DASH_ROLES (
  id          NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        VARCHAR2(100) NOT NULL UNIQUE,
  description VARCHAR2(500) NOT NULL
);

-- ─── 3. BRANCHES ────────────────────────────────────────────

CREATE TABLE DASH_BRANCHES (
  id         VARCHAR2(50)  PRIMARY KEY,
  name       VARCHAR2(255) NOT NULL UNIQUE,
  location   VARCHAR2(500) NOT NULL,
  created_at TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);

-- ─── 4. DEPARTMENTS ─────────────────────────────────────────

CREATE TABLE DASH_DEPARTMENTS (
  id         VARCHAR2(50)  PRIMARY KEY,
  name       VARCHAR2(255) NOT NULL UNIQUE,
  branch_id  VARCHAR2(50)  NOT NULL,
  created_at TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_dept_branch FOREIGN KEY (branch_id) REFERENCES DASH_BRANCHES(id)
);

-- ─── 5. CUSTOMERS ───────────────────────────────────────────

CREATE TABLE DASH_CUSTOMERS (
  id            NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR2(255) NOT NULL,
  phone         VARCHAR2(50)  NOT NULL UNIQUE,
  status        VARCHAR2(50)  NOT NULL,
  registered_at TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);

-- ─── 6. PENDING_APPROVALS ───────────────────────────────────

CREATE TABLE DASH_PENDING_APPROVALS (
  id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id         NUMBER          NOT NULL,
  type                VARCHAR2(100)   NOT NULL,
  requested_at        TIMESTAMP       DEFAULT SYSTIMESTAMP NOT NULL,
  customer_name       VARCHAR2(255)   NOT NULL,
  customer_phone      VARCHAR2(50)    NOT NULL,
  details             CLOB,
  status              VARCHAR2(50)    DEFAULT 'pending' NOT NULL,
  requested_by_email  VARCHAR2(255),
  CONSTRAINT fk_approval_customer FOREIGN KEY (customer_id) REFERENCES DASH_CUSTOMERS(id)
);

-- ─── 7. TRANSACTIONS ────────────────────────────────────────

CREATE TABLE DASH_TRANSACTIONS (
  id             VARCHAR2(36)  PRIMARY KEY,
  customer_id    NUMBER        NOT NULL,
  amount         NUMBER(20,4)  NOT NULL,
  fee            NUMBER(20,4)  NOT NULL,
  status         VARCHAR2(50)  NOT NULL,
  tx_timestamp   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  type           VARCHAR2(100) NOT NULL,
  channel        VARCHAR2(100) NOT NULL,
  from_account   VARCHAR2(100),
  to_account     VARCHAR2(100),
  is_anomalous   NUMBER(1)     DEFAULT 0 NOT NULL,
  anomaly_reason VARCHAR2(500),
  CONSTRAINT fk_tx_customer FOREIGN KEY (customer_id) REFERENCES DASH_CUSTOMERS(id)
);

-- ─── 8. SYSTEM_ACTIVITY_LOG ─────────────────────────────────

CREATE TABLE DASH_ACTIVITY_LOG (
  id          NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  log_timestamp TIMESTAMP   DEFAULT SYSTIMESTAMP NOT NULL,
  user_email  VARCHAR2(255) NOT NULL,
  action      VARCHAR2(255) NOT NULL,
  status      VARCHAR2(50)  NOT NULL,
  details     CLOB,
  ip_address  VARCHAR2(100)
);

-- ─── 9. PASSWORD_HISTORY ────────────────────────────────────

CREATE TABLE DASH_PASSWORD_HISTORY (
  id         NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    NUMBER        NOT NULL,
  password   VARCHAR2(500) NOT NULL,
  created_at TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_pwdhist_user FOREIGN KEY (user_id) REFERENCES DASH_USERS(id) ON DELETE CASCADE
);

CREATE INDEX idx_pwd_history_user ON DASH_PASSWORD_HISTORY(user_id);

-- ─── 10. SECURITY_POLICY ────────────────────────────────────

CREATE TABLE DASH_SECURITY_POLICY (
  id                  NUMBER        PRIMARY KEY,
  mfa_required        NUMBER(1)     DEFAULT 1 NOT NULL,
  allowed_mfa_methods VARCHAR2(500) DEFAULT 'EMAIL' NOT NULL,
  session_timeout     NUMBER        DEFAULT 30 NOT NULL,
  concurrent_sessions NUMBER        DEFAULT 1 NOT NULL
);

-- ─── 11. IP_WHITELIST ───────────────────────────────────────

CREATE TABLE DASH_IP_WHITELIST (
  id         NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cidr       VARCHAR2(50)  NOT NULL UNIQUE,
  label      VARCHAR2(255) NOT NULL,
  created_at TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);

-- ─── 12. OTP_CODES ──────────────────────────────────────────

CREATE TABLE DASH_OTP_CODES (
  id          NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  purpose     VARCHAR2(100) NOT NULL,
  user_id     VARCHAR2(255) NOT NULL,
  otp_type    VARCHAR2(50)  NOT NULL,
  code        VARCHAR2(20),
  is_used     NUMBER(1)     DEFAULT 0 NOT NULL,
  expires_at  TIMESTAMP     NOT NULL,
  attempts    NUMBER        DEFAULT 0 NOT NULL,
  insert_date TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  update_date TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);

-- ─── 13. IPS_BANKS ──────────────────────────────────────────

CREATE TABLE DASH_IPS_BANKS (
  id                     VARCHAR2(36)  PRIMARY KEY,
  bank_name              VARCHAR2(255) NOT NULL,
  bank_code              VARCHAR2(50)  NOT NULL UNIQUE,
  reconciliation_account VARCHAR2(100) NOT NULL,
  bank_logo              VARCHAR2(500),
  primary_color          VARCHAR2(20),
  secondary_color        VARCHAR2(20),
  accent_color           VARCHAR2(20),
  status                 VARCHAR2(50)  NOT NULL,
  rank                   NUMBER        NOT NULL,
  created_at             TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at             TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  branch_code            VARCHAR2(50)  NOT NULL
);

CREATE INDEX idx_ips_banks_status ON DASH_IPS_BANKS(status);
CREATE INDEX idx_ips_banks_rank   ON DASH_IPS_BANKS(rank);

-- ─── 14. IPS_WALLETS ────────────────────────────────────────

CREATE TABLE DASH_IPS_WALLETS (
  id                     VARCHAR2(36)  PRIMARY KEY,
  wallet_name            VARCHAR2(255) NOT NULL,
  wallet_code            VARCHAR2(50)  NOT NULL UNIQUE,
  reconciliation_account VARCHAR2(100) NOT NULL,
  wallet_logo            VARCHAR2(500),
  primary_color          VARCHAR2(20),
  secondary_color        VARCHAR2(20),
  accent_color           VARCHAR2(20),
  status                 VARCHAR2(50)  NOT NULL,
  rank                   NUMBER        NOT NULL,
  created_at             TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at             TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  branch_code            VARCHAR2(50)  NOT NULL
);

CREATE INDEX idx_ips_wallets_status ON DASH_IPS_WALLETS(status);
CREATE INDEX idx_ips_wallets_rank   ON DASH_IPS_WALLETS(rank);

-- ─── 15. CONFIG_BACKUPS ─────────────────────────────────────

CREATE TABLE DASH_CONFIG_BACKUPS (
  id          VARCHAR2(36)  PRIMARY KEY,
  label       VARCHAR2(255) NOT NULL,
  description VARCHAR2(1000),
  backup_type VARCHAR2(50)  DEFAULT 'Full' NOT NULL,
  database    VARCHAR2(100) DEFAULT 'Oracle' NOT NULL,
  status      VARCHAR2(50)  DEFAULT 'Completed' NOT NULL,
  file_path   VARCHAR2(500),
  file_size   NUMBER,
  checksum    VARCHAR2(255),
  created_by  VARCHAR2(255) NOT NULL,
  restored_at TIMESTAMP,
  restored_by VARCHAR2(255),
  created_at  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_backups_status     ON DASH_CONFIG_BACKUPS(status);
CREATE INDEX idx_backups_created_at ON DASH_CONFIG_BACKUPS(created_at);

-- ─── Commit ──────────────────────────────────────────────────
COMMIT;
