/**
 * Oracle Data Source — replaces Prisma for the Dashboard Module
 * Connects to: dash_module/test@localhost:1521/FREEPDB1
 *
 * Uses TypeORM EntitySchema (no decorators needed — works with Next.js out of the box)
 */

import { DataSource, EntitySchema } from 'typeorm';

// ─── Entity Schemas ──────────────────────────────────────────────────────────

export const UserSchema = new EntitySchema({
  name: 'User',
  tableName: 'DASH_USERS',
  columns: {
    id:                   { name: 'ID', type: 'number',  primary: true, generated: 'increment' },
    employeeId:           { name: 'EMPLOYEE_ID',            type: 'varchar2', length: 100,  unique: true, nullable: false },
    name:                 { name: 'NAME',                   type: 'varchar2', length: 255,  nullable: false },
    email:                { name: 'EMAIL',                  type: 'varchar2', length: 255,  unique: true, nullable: false },
    password:             { name: 'PASSWORD',               type: 'varchar2', length: 500,  nullable: false },
    role:                 { name: 'ROLE',                   type: 'varchar2', length: 100,  nullable: false },
    branch:               { name: 'BRANCH',                 type: 'varchar2', length: 100,  nullable: true },
    department:           { name: 'DEPARTMENT',             type: 'varchar2', length: 100,  nullable: false },
    createdAt:            { name: 'CREATED_AT',             type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    updatedAt:            { name: 'UPDATED_AT',             type: 'timestamp', default: () => 'SYSTIMESTAMP', onUpdate: 'SYSTIMESTAMP' },
    mfaEnabled:           { name: 'MFA_ENABLED',            type: 'number',   width: 1,     default: 0 },
    status:               { name: 'STATUS',                 type: 'varchar2', length: 50,   default: 'Active' },
    failedLoginAttempts:  { name: 'FAILED_LOGIN_ATTEMPTS',  type: 'number',   default: 0 },
    isLocked:             { name: 'IS_LOCKED',              type: 'number',   width: 1,     default: 0 },
    lastLoginAttempt:     { name: 'LAST_LOGIN_ATTEMPT',     type: 'timestamp', nullable: true },
    sessionInvalidatedAt: { name: 'SESSION_INVALIDATED_AT', type: 'timestamp', nullable: true },
    passwordChangedAt:    { name: 'PASSWORD_CHANGED_AT',    type: 'timestamp', nullable: true },
  },
});

export const RoleSchema = new EntitySchema({
  name: 'Role',
  tableName: 'DASH_ROLES',
  columns: {
    id:          { name: 'ID', type: 'number',  primary: true, generated: 'increment' },
    name:        { name: 'NAME',        type: 'varchar2', length: 100, unique: true, nullable: false },
    description: { name: 'DESCRIPTION', type: 'varchar2', length: 500, nullable: false },
  },
});

export const BranchSchema = new EntitySchema({
  name: 'Branch',
  tableName: 'DASH_BRANCHES',
  columns: {
    id:        { name: 'ID',         type: 'varchar2', length: 50,  primary: true, nullable: false },
    name:      { name: 'NAME',       type: 'varchar2', length: 255, unique: true, nullable: false },
    location:  { name: 'LOCATION',   type: 'varchar2', length: 500, nullable: false },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', default: () => 'SYSTIMESTAMP' },
  },
});

export const DepartmentSchema = new EntitySchema({
  name: 'Department',
  tableName: 'DASH_DEPARTMENTS',
  columns: {
    id:        { name: 'ID',         type: 'varchar2', length: 50,  primary: true, nullable: false },
    name:      { name: 'NAME',       type: 'varchar2', length: 255, unique: true, nullable: false },
    branchId:  { name: 'BRANCH_ID',  type: 'varchar2', length: 50,  nullable: false },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', default: () => 'SYSTIMESTAMP' },
  },
});

export const CustomerSchema = new EntitySchema({
  name: 'Customer',
  tableName: 'DASH_CUSTOMERS',
  columns: {
    id:           { name: 'ID', type: 'number',  primary: true, generated: 'increment' },
    name:         { name: 'NAME',         type: 'varchar2', length: 255, nullable: false },
    phone:        { name: 'PHONE',        type: 'varchar2', length: 50,  unique: true, nullable: false },
    status:       { name: 'STATUS',       type: 'varchar2', length: 50,  nullable: false },
    registeredAt: { name: 'REGISTERED_AT', type: 'timestamp', default: () => 'SYSTIMESTAMP' },
  },
});

export const PendingApprovalSchema = new EntitySchema({
  name: 'PendingApproval',
  tableName: 'DASH_PENDING_APPROVALS',
  columns: {
    id:               { name: 'ID', type: 'number',  primary: true, generated: 'increment' },
    customerId:       { name: 'CUSTOMER_ID',       type: 'number',   nullable: false },
    type:             { name: 'TYPE',              type: 'varchar2', length: 100, nullable: false },
    requestedAt:      { name: 'REQUESTED_AT',      type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    customerName:     { name: 'CUSTOMER_NAME',     type: 'varchar2', length: 255, nullable: false },
    customerPhone:    { name: 'CUSTOMER_PHONE',    type: 'varchar2', length: 50,  nullable: false },
    details:          { name: 'DETAILS',           type: 'clob',     nullable: true },
    status:           { name: 'STATUS',            type: 'varchar2', length: 50,  default: 'pending' },
    requestedByEmail: { name: 'REQUESTED_BY_EMAIL', type: 'varchar2', length: 255, nullable: true },
  },
});

export const TransactionSchema = new EntitySchema({
  name: 'Transaction',
  tableName: 'DASH_TRANSACTIONS',
  columns: {
    id:            { name: 'ID',            type: 'varchar2', length: 36,  primary: true, nullable: false },
    customerId:    { name: 'CUSTOMER_ID',   type: 'number',   nullable: false },
    amount:        { name: 'AMOUNT',        type: 'decimal',  precision: 20, scale: 4, nullable: false },
    fee:           { name: 'FEE',           type: 'decimal',  precision: 20, scale: 4, nullable: false },
    status:        { name: 'STATUS',        type: 'varchar2', length: 50,   nullable: false },
    timestamp:     { name: 'TX_TIMESTAMP',  type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    type:          { name: 'TYPE',          type: 'varchar2', length: 100,  nullable: false },
    channel:       { name: 'CHANNEL',       type: 'varchar2', length: 100,  nullable: false },
    fromAccount:   { name: 'FROM_ACCOUNT',  type: 'varchar2', length: 100,  nullable: true },
    toAccount:     { name: 'TO_ACCOUNT',    type: 'varchar2', length: 100,  nullable: true },
    isAnomalous:   { name: 'IS_ANOMALOUS',  type: 'number',   width: 1,     default: 0 },
    anomalyReason: { name: 'ANOMALY_REASON', type: 'varchar2', length: 500, nullable: true },
  },
});

export const SystemActivityLogSchema = new EntitySchema({
  name: 'SystemActivityLog',
  tableName: 'DASH_ACTIVITY_LOG',
  columns: {
    id:        { name: 'ID', type: 'number',  primary: true, generated: 'increment' },
    timestamp: { name: 'LOG_TIMESTAMP', type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    userEmail: { name: 'USER_EMAIL',    type: 'varchar2', length: 255, nullable: false },
    action:    { name: 'ACTION',        type: 'varchar2', length: 255, nullable: false },
    status:    { name: 'STATUS',        type: 'varchar2', length: 50,  nullable: false },
    details:   { name: 'DETAILS',       type: 'clob',     nullable: true },
    ipAddress: { name: 'IP_ADDRESS',    type: 'varchar2', length: 100, nullable: true },
  },
});

export const PasswordHistorySchema = new EntitySchema({
  name: 'PasswordHistory',
  tableName: 'DASH_PASSWORD_HISTORY',
  columns: {
    id:        { name: 'ID', type: 'number',  primary: true, generated: 'increment' },
    userId:    { name: 'USER_ID',    type: 'number',   nullable: false },
    password:  { name: 'PASSWORD',   type: 'varchar2', length: 500, nullable: false },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', default: () => 'SYSTIMESTAMP' },
  },
});

export const SecurityPolicySchema = new EntitySchema({
  name: 'SecurityPolicy',
  tableName: 'DASH_SECURITY_POLICY',
  columns: {
    id:                 { name: 'ID', type: 'number',  primary: true },
    mfaRequired:        { name: 'MFA_REQUIRED',        type: 'number', width: 1, default: 1 },
    allowedMfaMethods:  { name: 'ALLOWED_MFA_METHODS',  type: 'varchar2', length: 500, default: 'EMAIL' },
    sessionTimeout:     { name: 'SESSION_TIMEOUT',      type: 'number',   default: 30 },
    concurrentSessions: { name: 'CONCURRENT_SESSIONS',  type: 'number',   default: 1 },
  },
});

export const IpWhitelistSchema = new EntitySchema({
  name: 'IpWhitelist',
  tableName: 'DASH_IP_WHITELIST',
  columns: {
    id:        { name: 'ID', type: 'number',  primary: true, generated: 'increment' },
    cidr:      { name: 'CIDR',       type: 'varchar2', length: 50,  unique: true, nullable: false },
    label:     { name: 'LABEL',      type: 'varchar2', length: 255, nullable: false },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', default: () => 'SYSTIMESTAMP' },
  },
});

export const OtpCodeSchema = new EntitySchema({
  name: 'OtpCode',
  tableName: 'DASH_OTP_CODES',
  columns: {
    Id:         { name: 'ID',          type: 'number',   primary: true, generated: 'increment' },
    Purpose:    { name: 'PURPOSE',     type: 'varchar2', length: 100, nullable: false },
    UserId:     { name: 'USER_ID',     type: 'varchar2', length: 255, nullable: false },
    OtpType:    { name: 'OTP_TYPE',    type: 'varchar2', length: 50,  nullable: false },
    Code:       { name: 'CODE',        type: 'varchar2', length: 20,  nullable: true },
    IsUsed:     { name: 'IS_USED',     type: 'number',   width: 1,    default: 0 },
    ExpiresAt:  { name: 'EXPIRES_AT',  type: 'timestamp', nullable: false },
    Attempts:   { name: 'ATTEMPTS',    type: 'number',   default: 0 },
    InsertDate: { name: 'INSERT_DATE', type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    UpdateDate: { name: 'UPDATE_DATE', type: 'timestamp', default: () => 'SYSTIMESTAMP' },
  },
});

export const IPSBankSchema = new EntitySchema({
  name: 'IPSBank',
  tableName: 'DASH_IPS_BANKS',
  columns: {
    id:                    { name: 'ID',                     type: 'varchar2', length: 36,  primary: true },
    bankName:              { name: 'BANK_NAME',              type: 'varchar2', length: 255, nullable: false },
    bankCode:              { name: 'BANK_CODE',              type: 'varchar2', length: 50,  unique: true, nullable: false },
    reconciliationAccount: { name: 'RECONCILIATION_ACCOUNT', type: 'varchar2', length: 100, nullable: false },
    bankLogo:              { name: 'BANK_LOGO',              type: 'varchar2', length: 500, nullable: true },
    primaryColor:          { name: 'PRIMARY_COLOR',          type: 'varchar2', length: 20,  nullable: true },
    secondaryColor:        { name: 'SECONDARY_COLOR',        type: 'varchar2', length: 20,  nullable: true },
    accentColor:           { name: 'ACCENT_COLOR',           type: 'varchar2', length: 20,  nullable: true },
    status:                { name: 'STATUS',                 type: 'varchar2', length: 50,  nullable: false },
    rank:                  { name: 'RANK',                   type: 'number',   nullable: false },
    createdAt:             { name: 'CREATED_AT',             type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    updatedAt:             { name: 'UPDATED_AT',             type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    branchCode:            { name: 'BRANCH_CODE',            type: 'varchar2', length: 50,  nullable: false },
  },
});

export const IPSWalletSchema = new EntitySchema({
  name: 'IPSWallet',
  tableName: 'DASH_IPS_WALLETS',
  columns: {
    id:                    { name: 'ID',                     type: 'varchar2', length: 36,  primary: true },
    walletName:            { name: 'WALLET_NAME',            type: 'varchar2', length: 255, nullable: false },
    walletCode:            { name: 'WALLET_CODE',            type: 'varchar2', length: 50,  unique: true, nullable: false },
    reconciliationAccount: { name: 'RECONCILIATION_ACCOUNT', type: 'varchar2', length: 100, nullable: false },
    walletLogo:            { name: 'WALLET_LOGO',            type: 'varchar2', length: 500, nullable: true },
    primaryColor:          { name: 'PRIMARY_COLOR',          type: 'varchar2', length: 20,  nullable: true },
    secondaryColor:        { name: 'SECONDARY_COLOR',        type: 'varchar2', length: 20,  nullable: true },
    accentColor:           { name: 'ACCENT_COLOR',           type: 'varchar2', length: 20,  nullable: true },
    status:                { name: 'STATUS',                 type: 'varchar2', length: 50,  nullable: false },
    rank:                  { name: 'RANK',                   type: 'number',   nullable: false },
    createdAt:             { name: 'CREATED_AT',             type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    updatedAt:             { name: 'UPDATED_AT',             type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    branchCode:            { name: 'BRANCH_CODE',            type: 'varchar2', length: 50,  nullable: false },
  },
});

export const ConfigBackupSchema = new EntitySchema({
  name: 'ConfigBackup',
  tableName: 'DASH_CONFIG_BACKUPS',
  columns: {
    id:          { name: 'ID',          type: 'varchar2', length: 36,   primary: true },
    label:       { name: 'LABEL',       type: 'varchar2', length: 255,  nullable: false },
    description: { name: 'DESCRIPTION', type: 'varchar2', length: 1000, nullable: true },
    backupType:  { name: 'BACKUP_TYPE', type: 'varchar2', length: 50,   default: 'Full' },
    database:    { name: 'DATABASE',    type: 'varchar2', length: 100,  default: 'Oracle' },
    status:      { name: 'STATUS',      type: 'varchar2', length: 50,   default: 'Completed' },
    filePath:    { name: 'FILE_PATH',   type: 'varchar2', length: 500,  nullable: true },
    fileSize:    { name: 'FILE_SIZE',   type: 'number',   nullable: true },
    checksum:    { name: 'CHECKSUM',    type: 'varchar2', length: 255,  nullable: true },
    createdBy:   { name: 'CREATED_BY',  type: 'varchar2', length: 255,  nullable: false },
    restoredAt:  { name: 'RESTORED_AT', type: 'timestamp', nullable: true },
    restoredBy:  { name: 'RESTORED_BY', type: 'varchar2', length: 255,  nullable: true },
    createdAt:   { name: 'CREATED_AT',  type: 'timestamp', default: () => 'SYSTIMESTAMP' },
    updatedAt:   { name: 'UPDATED_AT',  type: 'timestamp', default: () => 'SYSTIMESTAMP' },
  },
});

// ─── Data Source (singleton) ─────────────────────────────────────────────────

const connectionString = process.env.DASH_MODULE_ORACLE_CONNECTION_STRING ?? '';

// Parse "user/password@host:port/service"
function parseOracleConnString(cs: string) {
  const u = cs.match(/^(.*?)\//)?.[1] ?? '';
  const p = cs.match(/\/(.*?)@/)?.[1] ?? '';
  const s = cs.match(/@(.*?)$/)?.[1] ?? '';
  return { username: u, password: p, connectString: s };
}

const { username, password, connectString } = parseOracleConnString(connectionString);

export const AppDataSource = new DataSource({
  type: 'oracle',
  username,
  password,
  connectString,
  synchronize: false, // NEVER in production — use run_migration.js instead
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  entities: [
    UserSchema,
    RoleSchema,
    BranchSchema,
    DepartmentSchema,
    CustomerSchema,
    PendingApprovalSchema,
    TransactionSchema,
    SystemActivityLogSchema,
    PasswordHistorySchema,
    SecurityPolicySchema,
    IpWhitelistSchema,
    OtpCodeSchema,
    IPSBankSchema,
    IPSWalletSchema,
    ConfigBackupSchema,
  ],
});
