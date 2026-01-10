
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'role',
  branch: 'branch',
  department: 'department',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description'
};

exports.Prisma.BranchScalarFieldEnum = {
  id: 'id',
  name: 'name',
  location: 'location',
  createdAt: 'createdAt'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  branchId: 'branchId',
  createdAt: 'createdAt'
};

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  status: 'status',
  registeredAt: 'registeredAt'
};

exports.Prisma.PendingApprovalScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  type: 'type',
  requestedAt: 'requestedAt',
  customerName: 'customerName',
  customerPhone: 'customerPhone',
  details: 'details',
  status: 'status'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  amount: 'amount',
  fee: 'fee',
  status: 'status',
  timestamp: 'timestamp',
  type: 'type',
  channel: 'channel',
  from_account: 'from_account',
  to_account: 'to_account',
  is_anomalous: 'is_anomalous',
  anomaly_reason: 'anomaly_reason'
};

exports.Prisma.AppUserScalarFieldEnum = {
  Id: 'Id',
  CIFNumber: 'CIFNumber',
  FirstName: 'FirstName',
  SecondName: 'SecondName',
  LastName: 'LastName',
  Email: 'Email',
  PhoneNumber: 'PhoneNumber',
  Status: 'Status',
  SignUpMainAuth: 'SignUpMainAuth',
  SignUp2FA: 'SignUp2FA',
  BranchCode: 'BranchCode',
  BranchName: 'BranchName',
  AddressLine1: 'AddressLine1',
  AddressLine2: 'AddressLine2',
  AddressLine3: 'AddressLine3',
  AddressLine4: 'AddressLine4',
  Nationality: 'Nationality',
  Channel: 'Channel',
  InsertDate: 'InsertDate',
  UpdateDate: 'UpdateDate'
};

exports.Prisma.AccountScalarFieldEnum = {
  Id: 'Id',
  CIFNumber: 'CIFNumber',
  AccountNumber: 'AccountNumber',
  FirstName: 'FirstName',
  SecondName: 'SecondName',
  LastName: 'LastName',
  AccountType: 'AccountType',
  Currency: 'Currency',
  Status: 'Status',
  BranchName: 'BranchName',
  InsertDate: 'InsertDate',
  UpdateDate: 'UpdateDate'
};

exports.Prisma.SecurityQuestionScalarFieldEnum = {
  Id: 'Id',
  Question: 'Question'
};

exports.Prisma.UserSecurityScalarFieldEnum = {
  Id: 'Id',
  UserId: 'UserId',
  CIFNumber: 'CIFNumber',
  Status: 'Status',
  PinHash: 'PinHash',
  PasswordHash: 'PasswordHash',
  SecurityQuestionId: 'SecurityQuestionId',
  SecurityAnswer: 'SecurityAnswer',
  InsertDate: 'InsertDate',
  UpdateDate: 'UpdateDate'
};

exports.Prisma.CorporateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  industry: 'industry',
  status: 'status',
  internet_banking_status: 'internet_banking_status',
  logo_url: 'logo_url'
};

exports.Prisma.MiniAppScalarFieldEnum = {
  id: 'id',
  name: 'name',
  url: 'url',
  logo_url: 'logo_url',
  username: 'username',
  password: 'password',
  encryption_key: 'encryption_key'
};

exports.Prisma.OtpCodeScalarFieldEnum = {
  Id: 'Id',
  Purpose: 'Purpose',
  UserId: 'UserId',
  OtpType: 'OtpType',
  Code: 'Code',
  IsUsed: 'IsUsed',
  ExpiresAt: 'ExpiresAt',
  Attempts: 'Attempts',
  InsertDate: 'InsertDate',
  UpdateDate: 'UpdateDate'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Role: 'Role',
  Branch: 'Branch',
  Department: 'Department',
  Customer: 'Customer',
  PendingApproval: 'PendingApproval',
  Transaction: 'Transaction',
  AppUser: 'AppUser',
  Account: 'Account',
  SecurityQuestion: 'SecurityQuestion',
  UserSecurity: 'UserSecurity',
  Corporate: 'Corporate',
  MiniApp: 'MiniApp',
  OtpCode: 'OtpCode'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
