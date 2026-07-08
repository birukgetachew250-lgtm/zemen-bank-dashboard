-- ============================================================
-- Zemen Bank Dashboard Module - Seed Data
-- Run AFTER 01_create_tables.sql
-- ============================================================

-- ─── Roles ──────────────────────────────────────────────────
INSERT INTO DASH_ROLES (name, description) VALUES ('Admin', '{"main":"Full system access — can manage users, roles, settings, and all modules","permissions":["all"]}');
INSERT INTO DASH_ROLES (name, description) VALUES ('Maker', '{"main":"Can create and submit customer requests for approval","permissions":["customers:read","customers:create","customers:pin-reset","approvals:request","users:read"]}');
INSERT INTO DASH_ROLES (name, description) VALUES ('Checker', '{"main":"Can approve or reject requests submitted by Makers","permissions":["customers:read","approvals:action","users:read"]}');
INSERT INTO DASH_ROLES (name, description) VALUES ('Viewer', '{"main":"Read-only access to reports and dashboards","permissions":["users:read","roles:read","customers:read"]}');
INSERT INTO DASH_ROLES (name, description) VALUES ('Risk Officer', '{"main":"Access to fraud monitoring and risk management modules","permissions":["security:manage","customers:read","users:read"]}');
INSERT INTO DASH_ROLES (name, description) VALUES ('Support', '{"main":"Customer support — limited customer search and view access","permissions":["customers:read","users:read"]}');

-- ─── Branches ───────────────────────────────────────────────
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('HQ', 'Head Office', 'Addis Ababa, Bole Road, Ethio-China Friendship Ave');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-301', 'Bole Branch', 'Bole, Addis Ababa');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-302', 'Kazanchis Branch', 'Kazanchis, Addis Ababa');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-303', 'Merkato Branch', 'Merkato, Addis Ababa');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-304', 'Piassa Branch', 'Piassa, Addis Ababa');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-305', 'Mexico Branch', 'Mexico Square, Addis Ababa');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-306', 'Megenagna Branch', 'Megenagna, Addis Ababa');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-307', 'Sarbet Branch', 'Sarbet, Addis Ababa');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-308', 'Lebu Branch', 'Lebu, Addis Ababa');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-309', 'Hawassa Branch', 'Hawassa, Sidama Region');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-310', 'Bahir Dar Branch', 'Bahir Dar, Amhara Region');
INSERT INTO DASH_BRANCHES (id, name, location) VALUES ('BR-311', 'Dire Dawa Branch', 'Dire Dawa City');

-- ─── Departments ────────────────────────────────────────────
INSERT INTO DASH_DEPARTMENTS (id, name, branch_id) VALUES ('DEPT-HQ-IT', 'Information Technology', 'HQ');
INSERT INTO DASH_DEPARTMENTS (id, name, branch_id) VALUES ('DEPT-HQ-OPS', 'Operations', 'HQ');
INSERT INTO DASH_DEPARTMENTS (id, name, branch_id) VALUES ('DEPT-HQ-RISK', 'Risk & Compliance', 'HQ');
INSERT INTO DASH_DEPARTMENTS (id, name, branch_id) VALUES ('DEPT-HQ-AUDIT', 'Internal Audit', 'HQ');
INSERT INTO DASH_DEPARTMENTS (id, name, branch_id) VALUES ('DEPT-HQ-CUST', 'Customer Service', 'HQ');

-- ─── Admin User ─────────────────────────────────────────────
-- Password: Admin@1234 (bcrypt hash — update with real hash before production)
INSERT INTO DASH_USERS (employee_id, name, email, password, role, branch, department, mfa_enabled, status)
VALUES (
  'EMP-001',
  'System Administrator',
  'admin@zemenbank.com',
  '$2b$10$8K1p/a0dR1xqM4t3mS/7LuXyUZm7V3vBzOqJz5e6XtNpFgK8wQ2Oi',
  'Admin',
  'HQ',
  'Information Technology',
  0,
  'Active'
);

INSERT INTO DASH_USERS (employee_id, name, email, password, role, branch, department, mfa_enabled, status)
VALUES (
  'EMP-002',
  'Abebe Maker',
  'maker@zemenbank.com',
  '$2b$10$8K1p/a0dR1xqM4t3mS/7LuXyUZm7V3vBzOqJz5e6XtNpFgK8wQ2Oi',
  'Maker',
  'BR-301',
  'Operations',
  0,
  'Active'
);

INSERT INTO DASH_USERS (employee_id, name, email, password, role, branch, department, mfa_enabled, status)
VALUES (
  'EMP-003',
  'Tigist Checker',
  'checker@zemenbank.com',
  '$2b$10$8K1p/a0dR1xqM4t3mS/7LuXyUZm7V3vBzOqJz5e6XtNpFgK8wQ2Oi',
  'Checker',
  'HQ',
  'Operations',
  0,
  'Active'
);

-- ─── Security Policy (single row, id = 1) ───────────────────
INSERT INTO DASH_SECURITY_POLICY (id, mfa_required, allowed_mfa_methods, session_timeout, concurrent_sessions)
VALUES (1, 1, 'EMAIL,SMS', 30, 1);

-- ─── IPS Banks ──────────────────────────────────────────────
INSERT INTO DASH_IPS_BANKS (id, bank_name, bank_code, reconciliation_account, status, rank, branch_code)
VALUES ('bank-CBE', 'Commercial Bank of Ethiopia', 'CBE', '1000123456789', 'Active', 1, 'HQ');
INSERT INTO DASH_IPS_BANKS (id, bank_name, bank_code, reconciliation_account, status, rank, branch_code)
VALUES ('bank-BOA', 'Bank of Abyssinia', 'BOA', '2000123456789', 'Active', 2, 'HQ');
INSERT INTO DASH_IPS_BANKS (id, bank_name, bank_code, reconciliation_account, status, rank, branch_code)
VALUES ('bank-AWASH', 'Awash Bank', 'AWASH', '3000123456789', 'Active', 3, 'HQ');
INSERT INTO DASH_IPS_BANKS (id, bank_name, bank_code, reconciliation_account, status, rank, branch_code)
VALUES ('bank-DASHEN', 'Dashen Bank', 'DASHEN', '4000123456789', 'Active', 4, 'HQ');

-- ─── IPS Wallets ────────────────────────────────────────────
INSERT INTO DASH_IPS_WALLETS (id, wallet_name, wallet_code, reconciliation_account, status, rank, branch_code)
VALUES ('wallet-TELEBIRR', 'TeleBirr', 'TELEBIRR', '9000100000001', 'Active', 1, 'HQ');
INSERT INTO DASH_IPS_WALLETS (id, wallet_name, wallet_code, reconciliation_account, status, rank, branch_code)
VALUES ('wallet-AMOLE', 'Amole', 'AMOLE', '9000100000002', 'Active', 2, 'HQ');
INSERT INTO DASH_IPS_WALLETS (id, wallet_name, wallet_code, reconciliation_account, status, rank, branch_code)
VALUES ('wallet-MPESA', 'M-Pesa Ethiopia', 'MPESA', '9000100000003', 'Active', 3, 'HQ');

COMMIT;
