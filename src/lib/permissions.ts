/**
 * Centralized permission constants for the Zemen Bank Dashboard.
 *
 * These strings are used as permission identifiers that are stored in the
 * `description.permissions` JSON array of each Role record in the database.
 * The `Super Admin` role automatically receives ['all'], which grants every permission.
 *
 * HOW TO USE:
 * - When creating/editing a Role in the UI, assign one or more of these permission IDs.
 * - In API routes, call `requirePermission(PERMISSIONS.XYZ)` to enforce access.
 */
export const PERMISSIONS = {
  // ─── Dashboard User (System User) Management ───────────────────────────────
  /** View the list of dashboard users and their details */
  USERS_READ: 'users:read',
  /** Create a new dashboard user */
  USERS_CREATE: 'users:create',
  /** Update an existing dashboard user's profile or role */
  USERS_UPDATE: 'users:update',
  /** Delete a dashboard user */
  USERS_DELETE: 'users:delete',
  /** Suspend or unsuspend a dashboard user account */
  USERS_SUSPEND: 'users:suspend',
  /** Reset a dashboard user's password */
  USERS_RESET_PASSWORD: 'users:reset-password',
  /** Unlock a locked dashboard user account */
  USERS_UNLOCK: 'users:unlock',

  // ─── Role Management ────────────────────────────────────────────────────────
  /** View roles and their permissions */
  ROLES_READ: 'roles:read',
  /** Create new roles */
  ROLES_CREATE: 'roles:create',
  /** Update roles and their permission assignments */
  ROLES_UPDATE: 'roles:update',
  /** Delete roles */
  ROLES_DELETE: 'roles:delete',

  // ─── Security & System Settings ─────────────────────────────────────────────
  /** View and manage security policies, IP whitelist, and activity logs */
  SECURITY_MANAGE: 'security:manage',

  // ─── Customer (Mobile Banking User) Management ──────────────────────────────
  /** View mobile banking customer profiles */
  CUSTOMERS_READ: 'customers:read',
  /** Submit a new customer onboarding request */
  CUSTOMERS_CREATE: 'customers:create',
  /** Reset a customer's mobile banking PIN */
  CUSTOMERS_PIN_RESET: 'customers:pin-reset',

  // ─── Approval Workflow ───────────────────────────────────────────────────────
  /** Submit maker requests (pin reset, suspend, etc.) for approval */
  APPROVALS_REQUEST: 'approvals:request',
  /** Approve or reject pending workflow requests */
  APPROVALS_ACTION: 'approvals:action',

  // ─── App Control (Mobile App Content & Configuration) ───────────────────────
  /** View and manage app updates, bank locations, mini-apps, promos, etc. */
  APP_CONTROL_MANAGE: 'app-control:manage',

  // ─── Charges & Limits ────────────────────────────────────────────────────────
  /** View and manage transaction charge rules */
  CHARGES_MANAGE: 'charges:manage',
  /** View and manage transaction limit rules */
  LIMITS_MANAGE: 'limits:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
