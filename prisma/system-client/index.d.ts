
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Role
 * 
 */
export type Role = $Result.DefaultSelection<Prisma.$RolePayload>
/**
 * Model Branch
 * 
 */
export type Branch = $Result.DefaultSelection<Prisma.$BranchPayload>
/**
 * Model Department
 * 
 */
export type Department = $Result.DefaultSelection<Prisma.$DepartmentPayload>
/**
 * Model Customer
 * 
 */
export type Customer = $Result.DefaultSelection<Prisma.$CustomerPayload>
/**
 * Model PendingApproval
 * 
 */
export type PendingApproval = $Result.DefaultSelection<Prisma.$PendingApprovalPayload>
/**
 * Model Transaction
 * 
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>
/**
 * Model AppUser
 * 
 */
export type AppUser = $Result.DefaultSelection<Prisma.$AppUserPayload>
/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>
/**
 * Model SecurityQuestion
 * 
 */
export type SecurityQuestion = $Result.DefaultSelection<Prisma.$SecurityQuestionPayload>
/**
 * Model UserSecurity
 * 
 */
export type UserSecurity = $Result.DefaultSelection<Prisma.$UserSecurityPayload>
/**
 * Model Corporate
 * 
 */
export type Corporate = $Result.DefaultSelection<Prisma.$CorporatePayload>
/**
 * Model MiniApp
 * 
 */
export type MiniApp = $Result.DefaultSelection<Prisma.$MiniAppPayload>
/**
 * Model OtpCode
 * 
 */
export type OtpCode = $Result.DefaultSelection<Prisma.$OtpCodePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.role`: Exposes CRUD operations for the **Role** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Roles
    * const roles = await prisma.role.findMany()
    * ```
    */
  get role(): Prisma.RoleDelegate<ExtArgs>;

  /**
   * `prisma.branch`: Exposes CRUD operations for the **Branch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Branches
    * const branches = await prisma.branch.findMany()
    * ```
    */
  get branch(): Prisma.BranchDelegate<ExtArgs>;

  /**
   * `prisma.department`: Exposes CRUD operations for the **Department** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Departments
    * const departments = await prisma.department.findMany()
    * ```
    */
  get department(): Prisma.DepartmentDelegate<ExtArgs>;

  /**
   * `prisma.customer`: Exposes CRUD operations for the **Customer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Customers
    * const customers = await prisma.customer.findMany()
    * ```
    */
  get customer(): Prisma.CustomerDelegate<ExtArgs>;

  /**
   * `prisma.pendingApproval`: Exposes CRUD operations for the **PendingApproval** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PendingApprovals
    * const pendingApprovals = await prisma.pendingApproval.findMany()
    * ```
    */
  get pendingApproval(): Prisma.PendingApprovalDelegate<ExtArgs>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transactions
    * const transactions = await prisma.transaction.findMany()
    * ```
    */
  get transaction(): Prisma.TransactionDelegate<ExtArgs>;

  /**
   * `prisma.appUser`: Exposes CRUD operations for the **AppUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppUsers
    * const appUsers = await prisma.appUser.findMany()
    * ```
    */
  get appUser(): Prisma.AppUserDelegate<ExtArgs>;

  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs>;

  /**
   * `prisma.securityQuestion`: Exposes CRUD operations for the **SecurityQuestion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SecurityQuestions
    * const securityQuestions = await prisma.securityQuestion.findMany()
    * ```
    */
  get securityQuestion(): Prisma.SecurityQuestionDelegate<ExtArgs>;

  /**
   * `prisma.userSecurity`: Exposes CRUD operations for the **UserSecurity** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserSecurities
    * const userSecurities = await prisma.userSecurity.findMany()
    * ```
    */
  get userSecurity(): Prisma.UserSecurityDelegate<ExtArgs>;

  /**
   * `prisma.corporate`: Exposes CRUD operations for the **Corporate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Corporates
    * const corporates = await prisma.corporate.findMany()
    * ```
    */
  get corporate(): Prisma.CorporateDelegate<ExtArgs>;

  /**
   * `prisma.miniApp`: Exposes CRUD operations for the **MiniApp** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MiniApps
    * const miniApps = await prisma.miniApp.findMany()
    * ```
    */
  get miniApp(): Prisma.MiniAppDelegate<ExtArgs>;

  /**
   * `prisma.otpCode`: Exposes CRUD operations for the **OtpCode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OtpCodes
    * const otpCodes = await prisma.otpCode.findMany()
    * ```
    */
  get otpCode(): Prisma.OtpCodeDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "role" | "branch" | "department" | "customer" | "pendingApproval" | "transaction" | "appUser" | "account" | "securityQuestion" | "userSecurity" | "corporate" | "miniApp" | "otpCode"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Role: {
        payload: Prisma.$RolePayload<ExtArgs>
        fields: Prisma.RoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          findFirst: {
            args: Prisma.RoleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          findMany: {
            args: Prisma.RoleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>[]
          }
          create: {
            args: Prisma.RoleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          createMany: {
            args: Prisma.RoleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RoleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>[]
          }
          delete: {
            args: Prisma.RoleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          update: {
            args: Prisma.RoleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          deleteMany: {
            args: Prisma.RoleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RoleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          aggregate: {
            args: Prisma.RoleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRole>
          }
          groupBy: {
            args: Prisma.RoleGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoleCountArgs<ExtArgs>
            result: $Utils.Optional<RoleCountAggregateOutputType> | number
          }
        }
      }
      Branch: {
        payload: Prisma.$BranchPayload<ExtArgs>
        fields: Prisma.BranchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BranchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BranchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          findFirst: {
            args: Prisma.BranchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BranchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          findMany: {
            args: Prisma.BranchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>[]
          }
          create: {
            args: Prisma.BranchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          createMany: {
            args: Prisma.BranchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BranchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>[]
          }
          delete: {
            args: Prisma.BranchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          update: {
            args: Prisma.BranchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          deleteMany: {
            args: Prisma.BranchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BranchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BranchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          aggregate: {
            args: Prisma.BranchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBranch>
          }
          groupBy: {
            args: Prisma.BranchGroupByArgs<ExtArgs>
            result: $Utils.Optional<BranchGroupByOutputType>[]
          }
          count: {
            args: Prisma.BranchCountArgs<ExtArgs>
            result: $Utils.Optional<BranchCountAggregateOutputType> | number
          }
        }
      }
      Department: {
        payload: Prisma.$DepartmentPayload<ExtArgs>
        fields: Prisma.DepartmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DepartmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DepartmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findFirst: {
            args: Prisma.DepartmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DepartmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findMany: {
            args: Prisma.DepartmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          create: {
            args: Prisma.DepartmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          createMany: {
            args: Prisma.DepartmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DepartmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          delete: {
            args: Prisma.DepartmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          update: {
            args: Prisma.DepartmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          deleteMany: {
            args: Prisma.DepartmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DepartmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DepartmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          aggregate: {
            args: Prisma.DepartmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDepartment>
          }
          groupBy: {
            args: Prisma.DepartmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<DepartmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.DepartmentCountArgs<ExtArgs>
            result: $Utils.Optional<DepartmentCountAggregateOutputType> | number
          }
        }
      }
      Customer: {
        payload: Prisma.$CustomerPayload<ExtArgs>
        fields: Prisma.CustomerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findFirst: {
            args: Prisma.CustomerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findMany: {
            args: Prisma.CustomerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          create: {
            args: Prisma.CustomerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          createMany: {
            args: Prisma.CustomerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          delete: {
            args: Prisma.CustomerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          update: {
            args: Prisma.CustomerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          deleteMany: {
            args: Prisma.CustomerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CustomerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          aggregate: {
            args: Prisma.CustomerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomer>
          }
          groupBy: {
            args: Prisma.CustomerGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomerGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomerCountArgs<ExtArgs>
            result: $Utils.Optional<CustomerCountAggregateOutputType> | number
          }
        }
      }
      PendingApproval: {
        payload: Prisma.$PendingApprovalPayload<ExtArgs>
        fields: Prisma.PendingApprovalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PendingApprovalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PendingApprovalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload>
          }
          findFirst: {
            args: Prisma.PendingApprovalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PendingApprovalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload>
          }
          findMany: {
            args: Prisma.PendingApprovalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload>[]
          }
          create: {
            args: Prisma.PendingApprovalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload>
          }
          createMany: {
            args: Prisma.PendingApprovalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PendingApprovalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload>[]
          }
          delete: {
            args: Prisma.PendingApprovalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload>
          }
          update: {
            args: Prisma.PendingApprovalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload>
          }
          deleteMany: {
            args: Prisma.PendingApprovalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PendingApprovalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PendingApprovalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingApprovalPayload>
          }
          aggregate: {
            args: Prisma.PendingApprovalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePendingApproval>
          }
          groupBy: {
            args: Prisma.PendingApprovalGroupByArgs<ExtArgs>
            result: $Utils.Optional<PendingApprovalGroupByOutputType>[]
          }
          count: {
            args: Prisma.PendingApprovalCountArgs<ExtArgs>
            result: $Utils.Optional<PendingApprovalCountAggregateOutputType> | number
          }
        }
      }
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>
        fields: Prisma.TransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransaction>
          }
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number
          }
        }
      }
      AppUser: {
        payload: Prisma.$AppUserPayload<ExtArgs>
        fields: Prisma.AppUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          findFirst: {
            args: Prisma.AppUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          findMany: {
            args: Prisma.AppUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>[]
          }
          create: {
            args: Prisma.AppUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          createMany: {
            args: Prisma.AppUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>[]
          }
          delete: {
            args: Prisma.AppUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          update: {
            args: Prisma.AppUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          deleteMany: {
            args: Prisma.AppUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AppUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AppUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          aggregate: {
            args: Prisma.AppUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAppUser>
          }
          groupBy: {
            args: Prisma.AppUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<AppUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppUserCountArgs<ExtArgs>
            result: $Utils.Optional<AppUserCountAggregateOutputType> | number
          }
        }
      }
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
      SecurityQuestion: {
        payload: Prisma.$SecurityQuestionPayload<ExtArgs>
        fields: Prisma.SecurityQuestionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SecurityQuestionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SecurityQuestionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload>
          }
          findFirst: {
            args: Prisma.SecurityQuestionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SecurityQuestionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload>
          }
          findMany: {
            args: Prisma.SecurityQuestionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload>[]
          }
          create: {
            args: Prisma.SecurityQuestionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload>
          }
          createMany: {
            args: Prisma.SecurityQuestionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SecurityQuestionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload>[]
          }
          delete: {
            args: Prisma.SecurityQuestionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload>
          }
          update: {
            args: Prisma.SecurityQuestionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload>
          }
          deleteMany: {
            args: Prisma.SecurityQuestionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SecurityQuestionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SecurityQuestionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityQuestionPayload>
          }
          aggregate: {
            args: Prisma.SecurityQuestionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSecurityQuestion>
          }
          groupBy: {
            args: Prisma.SecurityQuestionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SecurityQuestionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SecurityQuestionCountArgs<ExtArgs>
            result: $Utils.Optional<SecurityQuestionCountAggregateOutputType> | number
          }
        }
      }
      UserSecurity: {
        payload: Prisma.$UserSecurityPayload<ExtArgs>
        fields: Prisma.UserSecurityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserSecurityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserSecurityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload>
          }
          findFirst: {
            args: Prisma.UserSecurityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserSecurityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload>
          }
          findMany: {
            args: Prisma.UserSecurityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload>[]
          }
          create: {
            args: Prisma.UserSecurityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload>
          }
          createMany: {
            args: Prisma.UserSecurityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserSecurityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload>[]
          }
          delete: {
            args: Prisma.UserSecurityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload>
          }
          update: {
            args: Prisma.UserSecurityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload>
          }
          deleteMany: {
            args: Prisma.UserSecurityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserSecurityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserSecurityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecurityPayload>
          }
          aggregate: {
            args: Prisma.UserSecurityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserSecurity>
          }
          groupBy: {
            args: Prisma.UserSecurityGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserSecurityGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserSecurityCountArgs<ExtArgs>
            result: $Utils.Optional<UserSecurityCountAggregateOutputType> | number
          }
        }
      }
      Corporate: {
        payload: Prisma.$CorporatePayload<ExtArgs>
        fields: Prisma.CorporateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CorporateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CorporateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload>
          }
          findFirst: {
            args: Prisma.CorporateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CorporateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload>
          }
          findMany: {
            args: Prisma.CorporateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload>[]
          }
          create: {
            args: Prisma.CorporateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload>
          }
          createMany: {
            args: Prisma.CorporateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CorporateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload>[]
          }
          delete: {
            args: Prisma.CorporateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload>
          }
          update: {
            args: Prisma.CorporateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload>
          }
          deleteMany: {
            args: Prisma.CorporateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CorporateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CorporateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorporatePayload>
          }
          aggregate: {
            args: Prisma.CorporateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCorporate>
          }
          groupBy: {
            args: Prisma.CorporateGroupByArgs<ExtArgs>
            result: $Utils.Optional<CorporateGroupByOutputType>[]
          }
          count: {
            args: Prisma.CorporateCountArgs<ExtArgs>
            result: $Utils.Optional<CorporateCountAggregateOutputType> | number
          }
        }
      }
      MiniApp: {
        payload: Prisma.$MiniAppPayload<ExtArgs>
        fields: Prisma.MiniAppFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MiniAppFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MiniAppFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload>
          }
          findFirst: {
            args: Prisma.MiniAppFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MiniAppFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload>
          }
          findMany: {
            args: Prisma.MiniAppFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload>[]
          }
          create: {
            args: Prisma.MiniAppCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload>
          }
          createMany: {
            args: Prisma.MiniAppCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MiniAppCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload>[]
          }
          delete: {
            args: Prisma.MiniAppDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload>
          }
          update: {
            args: Prisma.MiniAppUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload>
          }
          deleteMany: {
            args: Prisma.MiniAppDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MiniAppUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MiniAppUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MiniAppPayload>
          }
          aggregate: {
            args: Prisma.MiniAppAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMiniApp>
          }
          groupBy: {
            args: Prisma.MiniAppGroupByArgs<ExtArgs>
            result: $Utils.Optional<MiniAppGroupByOutputType>[]
          }
          count: {
            args: Prisma.MiniAppCountArgs<ExtArgs>
            result: $Utils.Optional<MiniAppCountAggregateOutputType> | number
          }
        }
      }
      OtpCode: {
        payload: Prisma.$OtpCodePayload<ExtArgs>
        fields: Prisma.OtpCodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OtpCodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OtpCodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload>
          }
          findFirst: {
            args: Prisma.OtpCodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OtpCodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload>
          }
          findMany: {
            args: Prisma.OtpCodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload>[]
          }
          create: {
            args: Prisma.OtpCodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload>
          }
          createMany: {
            args: Prisma.OtpCodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OtpCodeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload>[]
          }
          delete: {
            args: Prisma.OtpCodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload>
          }
          update: {
            args: Prisma.OtpCodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload>
          }
          deleteMany: {
            args: Prisma.OtpCodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OtpCodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OtpCodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtpCodePayload>
          }
          aggregate: {
            args: Prisma.OtpCodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOtpCode>
          }
          groupBy: {
            args: Prisma.OtpCodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<OtpCodeGroupByOutputType>[]
          }
          count: {
            args: Prisma.OtpCodeCountArgs<ExtArgs>
            result: $Utils.Optional<OtpCodeCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type BranchCountOutputType
   */

  export type BranchCountOutputType = {
    departments: number
  }

  export type BranchCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    departments?: boolean | BranchCountOutputTypeCountDepartmentsArgs
  }

  // Custom InputTypes
  /**
   * BranchCountOutputType without action
   */
  export type BranchCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BranchCountOutputType
     */
    select?: BranchCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BranchCountOutputType without action
   */
  export type BranchCountOutputTypeCountDepartmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DepartmentWhereInput
  }


  /**
   * Count Type CustomerCountOutputType
   */

  export type CustomerCountOutputType = {
    transactions: number
    approvals: number
  }

  export type CustomerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transactions?: boolean | CustomerCountOutputTypeCountTransactionsArgs
    approvals?: boolean | CustomerCountOutputTypeCountApprovalsArgs
  }

  // Custom InputTypes
  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerCountOutputType
     */
    select?: CustomerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountApprovalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PendingApprovalWhereInput
  }


  /**
   * Count Type SecurityQuestionCountOutputType
   */

  export type SecurityQuestionCountOutputType = {
    UserSecurities: number
  }

  export type SecurityQuestionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserSecurities?: boolean | SecurityQuestionCountOutputTypeCountUserSecuritiesArgs
  }

  // Custom InputTypes
  /**
   * SecurityQuestionCountOutputType without action
   */
  export type SecurityQuestionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestionCountOutputType
     */
    select?: SecurityQuestionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SecurityQuestionCountOutputType without action
   */
  export type SecurityQuestionCountOutputTypeCountUserSecuritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSecurityWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    employeeId: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    branch: string | null
    department: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    employeeId: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    branch: string | null
    department: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    employeeId: number
    name: number
    email: number
    password: number
    role: number
    branch: number
    department: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    employeeId?: true
    name?: true
    email?: true
    password?: true
    role?: true
    branch?: true
    department?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    employeeId?: true
    name?: true
    email?: true
    password?: true
    role?: true
    branch?: true
    department?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    employeeId?: true
    name?: true
    email?: true
    password?: true
    role?: true
    branch?: true
    department?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    employeeId: string
    name: string
    email: string
    password: string
    role: string
    branch: string | null
    department: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeId?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    branch?: boolean
    department?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeId?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    branch?: boolean
    department?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    employeeId?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    branch?: boolean
    department?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      employeeId: string
      name: string
      email: string
      password: string
      role: string
      branch: string | null
      department: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly employeeId: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly branch: FieldRef<"User", 'String'>
    readonly department: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
  }


  /**
   * Model Role
   */

  export type AggregateRole = {
    _count: RoleCountAggregateOutputType | null
    _avg: RoleAvgAggregateOutputType | null
    _sum: RoleSumAggregateOutputType | null
    _min: RoleMinAggregateOutputType | null
    _max: RoleMaxAggregateOutputType | null
  }

  export type RoleAvgAggregateOutputType = {
    id: number | null
  }

  export type RoleSumAggregateOutputType = {
    id: number | null
  }

  export type RoleMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
  }

  export type RoleMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
  }

  export type RoleCountAggregateOutputType = {
    id: number
    name: number
    description: number
    _all: number
  }


  export type RoleAvgAggregateInputType = {
    id?: true
  }

  export type RoleSumAggregateInputType = {
    id?: true
  }

  export type RoleMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
  }

  export type RoleMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
  }

  export type RoleCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    _all?: true
  }

  export type RoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Role to aggregate.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Roles
    **/
    _count?: true | RoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RoleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RoleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoleMaxAggregateInputType
  }

  export type GetRoleAggregateType<T extends RoleAggregateArgs> = {
        [P in keyof T & keyof AggregateRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRole[P]>
      : GetScalarType<T[P], AggregateRole[P]>
  }




  export type RoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleWhereInput
    orderBy?: RoleOrderByWithAggregationInput | RoleOrderByWithAggregationInput[]
    by: RoleScalarFieldEnum[] | RoleScalarFieldEnum
    having?: RoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoleCountAggregateInputType | true
    _avg?: RoleAvgAggregateInputType
    _sum?: RoleSumAggregateInputType
    _min?: RoleMinAggregateInputType
    _max?: RoleMaxAggregateInputType
  }

  export type RoleGroupByOutputType = {
    id: number
    name: string
    description: string
    _count: RoleCountAggregateOutputType | null
    _avg: RoleAvgAggregateOutputType | null
    _sum: RoleSumAggregateOutputType | null
    _min: RoleMinAggregateOutputType | null
    _max: RoleMaxAggregateOutputType | null
  }

  type GetRoleGroupByPayload<T extends RoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoleGroupByOutputType[P]>
            : GetScalarType<T[P], RoleGroupByOutputType[P]>
        }
      >
    >


  export type RoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
  }, ExtArgs["result"]["role"]>

  export type RoleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
  }, ExtArgs["result"]["role"]>

  export type RoleSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
  }


  export type $RolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Role"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string
    }, ExtArgs["result"]["role"]>
    composites: {}
  }

  type RoleGetPayload<S extends boolean | null | undefined | RoleDefaultArgs> = $Result.GetResult<Prisma.$RolePayload, S>

  type RoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RoleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RoleCountAggregateInputType | true
    }

  export interface RoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Role'], meta: { name: 'Role' } }
    /**
     * Find zero or one Role that matches the filter.
     * @param {RoleFindUniqueArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoleFindUniqueArgs>(args: SelectSubset<T, RoleFindUniqueArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Role that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RoleFindUniqueOrThrowArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoleFindUniqueOrThrowArgs>(args: SelectSubset<T, RoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Role that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindFirstArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoleFindFirstArgs>(args?: SelectSubset<T, RoleFindFirstArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Role that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindFirstOrThrowArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoleFindFirstOrThrowArgs>(args?: SelectSubset<T, RoleFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Roles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Roles
     * const roles = await prisma.role.findMany()
     * 
     * // Get first 10 Roles
     * const roles = await prisma.role.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roleWithIdOnly = await prisma.role.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RoleFindManyArgs>(args?: SelectSubset<T, RoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Role.
     * @param {RoleCreateArgs} args - Arguments to create a Role.
     * @example
     * // Create one Role
     * const Role = await prisma.role.create({
     *   data: {
     *     // ... data to create a Role
     *   }
     * })
     * 
     */
    create<T extends RoleCreateArgs>(args: SelectSubset<T, RoleCreateArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Roles.
     * @param {RoleCreateManyArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const role = await prisma.role.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoleCreateManyArgs>(args?: SelectSubset<T, RoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Roles and returns the data saved in the database.
     * @param {RoleCreateManyAndReturnArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const role = await prisma.role.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Roles and only return the `id`
     * const roleWithIdOnly = await prisma.role.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RoleCreateManyAndReturnArgs>(args?: SelectSubset<T, RoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Role.
     * @param {RoleDeleteArgs} args - Arguments to delete one Role.
     * @example
     * // Delete one Role
     * const Role = await prisma.role.delete({
     *   where: {
     *     // ... filter to delete one Role
     *   }
     * })
     * 
     */
    delete<T extends RoleDeleteArgs>(args: SelectSubset<T, RoleDeleteArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Role.
     * @param {RoleUpdateArgs} args - Arguments to update one Role.
     * @example
     * // Update one Role
     * const role = await prisma.role.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoleUpdateArgs>(args: SelectSubset<T, RoleUpdateArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Roles.
     * @param {RoleDeleteManyArgs} args - Arguments to filter Roles to delete.
     * @example
     * // Delete a few Roles
     * const { count } = await prisma.role.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoleDeleteManyArgs>(args?: SelectSubset<T, RoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Roles
     * const role = await prisma.role.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoleUpdateManyArgs>(args: SelectSubset<T, RoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Role.
     * @param {RoleUpsertArgs} args - Arguments to update or create a Role.
     * @example
     * // Update or create a Role
     * const role = await prisma.role.upsert({
     *   create: {
     *     // ... data to create a Role
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Role we want to update
     *   }
     * })
     */
    upsert<T extends RoleUpsertArgs>(args: SelectSubset<T, RoleUpsertArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleCountArgs} args - Arguments to filter Roles to count.
     * @example
     * // Count the number of Roles
     * const count = await prisma.role.count({
     *   where: {
     *     // ... the filter for the Roles we want to count
     *   }
     * })
    **/
    count<T extends RoleCountArgs>(
      args?: Subset<T, RoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Role.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoleAggregateArgs>(args: Subset<T, RoleAggregateArgs>): Prisma.PrismaPromise<GetRoleAggregateType<T>>

    /**
     * Group by Role.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoleGroupByArgs['orderBy'] }
        : { orderBy?: RoleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Role model
   */
  readonly fields: RoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Role.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Role model
   */ 
  interface RoleFieldRefs {
    readonly id: FieldRef<"Role", 'Int'>
    readonly name: FieldRef<"Role", 'String'>
    readonly description: FieldRef<"Role", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Role findUnique
   */
  export type RoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role findUniqueOrThrow
   */
  export type RoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role findFirst
   */
  export type RoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role findFirstOrThrow
   */
  export type RoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role findMany
   */
  export type RoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Filter, which Roles to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role create
   */
  export type RoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * The data needed to create a Role.
     */
    data: XOR<RoleCreateInput, RoleUncheckedCreateInput>
  }

  /**
   * Role createMany
   */
  export type RoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Roles.
     */
    data: RoleCreateManyInput | RoleCreateManyInput[]
  }

  /**
   * Role createManyAndReturn
   */
  export type RoleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Roles.
     */
    data: RoleCreateManyInput | RoleCreateManyInput[]
  }

  /**
   * Role update
   */
  export type RoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * The data needed to update a Role.
     */
    data: XOR<RoleUpdateInput, RoleUncheckedUpdateInput>
    /**
     * Choose, which Role to update.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role updateMany
   */
  export type RoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Roles.
     */
    data: XOR<RoleUpdateManyMutationInput, RoleUncheckedUpdateManyInput>
    /**
     * Filter which Roles to update
     */
    where?: RoleWhereInput
  }

  /**
   * Role upsert
   */
  export type RoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * The filter to search for the Role to update in case it exists.
     */
    where: RoleWhereUniqueInput
    /**
     * In case the Role found by the `where` argument doesn't exist, create a new Role with this data.
     */
    create: XOR<RoleCreateInput, RoleUncheckedCreateInput>
    /**
     * In case the Role was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoleUpdateInput, RoleUncheckedUpdateInput>
  }

  /**
   * Role delete
   */
  export type RoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Filter which Role to delete.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role deleteMany
   */
  export type RoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Roles to delete
     */
    where?: RoleWhereInput
  }

  /**
   * Role without action
   */
  export type RoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
  }


  /**
   * Model Branch
   */

  export type AggregateBranch = {
    _count: BranchCountAggregateOutputType | null
    _min: BranchMinAggregateOutputType | null
    _max: BranchMaxAggregateOutputType | null
  }

  export type BranchMinAggregateOutputType = {
    id: string | null
    name: string | null
    location: string | null
    createdAt: Date | null
  }

  export type BranchMaxAggregateOutputType = {
    id: string | null
    name: string | null
    location: string | null
    createdAt: Date | null
  }

  export type BranchCountAggregateOutputType = {
    id: number
    name: number
    location: number
    createdAt: number
    _all: number
  }


  export type BranchMinAggregateInputType = {
    id?: true
    name?: true
    location?: true
    createdAt?: true
  }

  export type BranchMaxAggregateInputType = {
    id?: true
    name?: true
    location?: true
    createdAt?: true
  }

  export type BranchCountAggregateInputType = {
    id?: true
    name?: true
    location?: true
    createdAt?: true
    _all?: true
  }

  export type BranchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Branch to aggregate.
     */
    where?: BranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Branches to fetch.
     */
    orderBy?: BranchOrderByWithRelationInput | BranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Branches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Branches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Branches
    **/
    _count?: true | BranchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BranchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BranchMaxAggregateInputType
  }

  export type GetBranchAggregateType<T extends BranchAggregateArgs> = {
        [P in keyof T & keyof AggregateBranch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBranch[P]>
      : GetScalarType<T[P], AggregateBranch[P]>
  }




  export type BranchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BranchWhereInput
    orderBy?: BranchOrderByWithAggregationInput | BranchOrderByWithAggregationInput[]
    by: BranchScalarFieldEnum[] | BranchScalarFieldEnum
    having?: BranchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BranchCountAggregateInputType | true
    _min?: BranchMinAggregateInputType
    _max?: BranchMaxAggregateInputType
  }

  export type BranchGroupByOutputType = {
    id: string
    name: string
    location: string
    createdAt: Date
    _count: BranchCountAggregateOutputType | null
    _min: BranchMinAggregateOutputType | null
    _max: BranchMaxAggregateOutputType | null
  }

  type GetBranchGroupByPayload<T extends BranchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BranchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BranchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BranchGroupByOutputType[P]>
            : GetScalarType<T[P], BranchGroupByOutputType[P]>
        }
      >
    >


  export type BranchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    createdAt?: boolean
    departments?: boolean | Branch$departmentsArgs<ExtArgs>
    _count?: boolean | BranchCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["branch"]>

  export type BranchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    location?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["branch"]>

  export type BranchSelectScalar = {
    id?: boolean
    name?: boolean
    location?: boolean
    createdAt?: boolean
  }

  export type BranchInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    departments?: boolean | Branch$departmentsArgs<ExtArgs>
    _count?: boolean | BranchCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BranchIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $BranchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Branch"
    objects: {
      departments: Prisma.$DepartmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      location: string
      createdAt: Date
    }, ExtArgs["result"]["branch"]>
    composites: {}
  }

  type BranchGetPayload<S extends boolean | null | undefined | BranchDefaultArgs> = $Result.GetResult<Prisma.$BranchPayload, S>

  type BranchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BranchFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BranchCountAggregateInputType | true
    }

  export interface BranchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Branch'], meta: { name: 'Branch' } }
    /**
     * Find zero or one Branch that matches the filter.
     * @param {BranchFindUniqueArgs} args - Arguments to find a Branch
     * @example
     * // Get one Branch
     * const branch = await prisma.branch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BranchFindUniqueArgs>(args: SelectSubset<T, BranchFindUniqueArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Branch that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BranchFindUniqueOrThrowArgs} args - Arguments to find a Branch
     * @example
     * // Get one Branch
     * const branch = await prisma.branch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BranchFindUniqueOrThrowArgs>(args: SelectSubset<T, BranchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Branch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchFindFirstArgs} args - Arguments to find a Branch
     * @example
     * // Get one Branch
     * const branch = await prisma.branch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BranchFindFirstArgs>(args?: SelectSubset<T, BranchFindFirstArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Branch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchFindFirstOrThrowArgs} args - Arguments to find a Branch
     * @example
     * // Get one Branch
     * const branch = await prisma.branch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BranchFindFirstOrThrowArgs>(args?: SelectSubset<T, BranchFindFirstOrThrowArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Branches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Branches
     * const branches = await prisma.branch.findMany()
     * 
     * // Get first 10 Branches
     * const branches = await prisma.branch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const branchWithIdOnly = await prisma.branch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BranchFindManyArgs>(args?: SelectSubset<T, BranchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Branch.
     * @param {BranchCreateArgs} args - Arguments to create a Branch.
     * @example
     * // Create one Branch
     * const Branch = await prisma.branch.create({
     *   data: {
     *     // ... data to create a Branch
     *   }
     * })
     * 
     */
    create<T extends BranchCreateArgs>(args: SelectSubset<T, BranchCreateArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Branches.
     * @param {BranchCreateManyArgs} args - Arguments to create many Branches.
     * @example
     * // Create many Branches
     * const branch = await prisma.branch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BranchCreateManyArgs>(args?: SelectSubset<T, BranchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Branches and returns the data saved in the database.
     * @param {BranchCreateManyAndReturnArgs} args - Arguments to create many Branches.
     * @example
     * // Create many Branches
     * const branch = await prisma.branch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Branches and only return the `id`
     * const branchWithIdOnly = await prisma.branch.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BranchCreateManyAndReturnArgs>(args?: SelectSubset<T, BranchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Branch.
     * @param {BranchDeleteArgs} args - Arguments to delete one Branch.
     * @example
     * // Delete one Branch
     * const Branch = await prisma.branch.delete({
     *   where: {
     *     // ... filter to delete one Branch
     *   }
     * })
     * 
     */
    delete<T extends BranchDeleteArgs>(args: SelectSubset<T, BranchDeleteArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Branch.
     * @param {BranchUpdateArgs} args - Arguments to update one Branch.
     * @example
     * // Update one Branch
     * const branch = await prisma.branch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BranchUpdateArgs>(args: SelectSubset<T, BranchUpdateArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Branches.
     * @param {BranchDeleteManyArgs} args - Arguments to filter Branches to delete.
     * @example
     * // Delete a few Branches
     * const { count } = await prisma.branch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BranchDeleteManyArgs>(args?: SelectSubset<T, BranchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Branches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Branches
     * const branch = await prisma.branch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BranchUpdateManyArgs>(args: SelectSubset<T, BranchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Branch.
     * @param {BranchUpsertArgs} args - Arguments to update or create a Branch.
     * @example
     * // Update or create a Branch
     * const branch = await prisma.branch.upsert({
     *   create: {
     *     // ... data to create a Branch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Branch we want to update
     *   }
     * })
     */
    upsert<T extends BranchUpsertArgs>(args: SelectSubset<T, BranchUpsertArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Branches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchCountArgs} args - Arguments to filter Branches to count.
     * @example
     * // Count the number of Branches
     * const count = await prisma.branch.count({
     *   where: {
     *     // ... the filter for the Branches we want to count
     *   }
     * })
    **/
    count<T extends BranchCountArgs>(
      args?: Subset<T, BranchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BranchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Branch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BranchAggregateArgs>(args: Subset<T, BranchAggregateArgs>): Prisma.PrismaPromise<GetBranchAggregateType<T>>

    /**
     * Group by Branch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BranchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BranchGroupByArgs['orderBy'] }
        : { orderBy?: BranchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BranchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBranchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Branch model
   */
  readonly fields: BranchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Branch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BranchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    departments<T extends Branch$departmentsArgs<ExtArgs> = {}>(args?: Subset<T, Branch$departmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Branch model
   */ 
  interface BranchFieldRefs {
    readonly id: FieldRef<"Branch", 'String'>
    readonly name: FieldRef<"Branch", 'String'>
    readonly location: FieldRef<"Branch", 'String'>
    readonly createdAt: FieldRef<"Branch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Branch findUnique
   */
  export type BranchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branch to fetch.
     */
    where: BranchWhereUniqueInput
  }

  /**
   * Branch findUniqueOrThrow
   */
  export type BranchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branch to fetch.
     */
    where: BranchWhereUniqueInput
  }

  /**
   * Branch findFirst
   */
  export type BranchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branch to fetch.
     */
    where?: BranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Branches to fetch.
     */
    orderBy?: BranchOrderByWithRelationInput | BranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Branches.
     */
    cursor?: BranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Branches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Branches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Branches.
     */
    distinct?: BranchScalarFieldEnum | BranchScalarFieldEnum[]
  }

  /**
   * Branch findFirstOrThrow
   */
  export type BranchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branch to fetch.
     */
    where?: BranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Branches to fetch.
     */
    orderBy?: BranchOrderByWithRelationInput | BranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Branches.
     */
    cursor?: BranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Branches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Branches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Branches.
     */
    distinct?: BranchScalarFieldEnum | BranchScalarFieldEnum[]
  }

  /**
   * Branch findMany
   */
  export type BranchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branches to fetch.
     */
    where?: BranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Branches to fetch.
     */
    orderBy?: BranchOrderByWithRelationInput | BranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Branches.
     */
    cursor?: BranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Branches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Branches.
     */
    skip?: number
    distinct?: BranchScalarFieldEnum | BranchScalarFieldEnum[]
  }

  /**
   * Branch create
   */
  export type BranchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * The data needed to create a Branch.
     */
    data: XOR<BranchCreateInput, BranchUncheckedCreateInput>
  }

  /**
   * Branch createMany
   */
  export type BranchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Branches.
     */
    data: BranchCreateManyInput | BranchCreateManyInput[]
  }

  /**
   * Branch createManyAndReturn
   */
  export type BranchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Branches.
     */
    data: BranchCreateManyInput | BranchCreateManyInput[]
  }

  /**
   * Branch update
   */
  export type BranchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * The data needed to update a Branch.
     */
    data: XOR<BranchUpdateInput, BranchUncheckedUpdateInput>
    /**
     * Choose, which Branch to update.
     */
    where: BranchWhereUniqueInput
  }

  /**
   * Branch updateMany
   */
  export type BranchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Branches.
     */
    data: XOR<BranchUpdateManyMutationInput, BranchUncheckedUpdateManyInput>
    /**
     * Filter which Branches to update
     */
    where?: BranchWhereInput
  }

  /**
   * Branch upsert
   */
  export type BranchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * The filter to search for the Branch to update in case it exists.
     */
    where: BranchWhereUniqueInput
    /**
     * In case the Branch found by the `where` argument doesn't exist, create a new Branch with this data.
     */
    create: XOR<BranchCreateInput, BranchUncheckedCreateInput>
    /**
     * In case the Branch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BranchUpdateInput, BranchUncheckedUpdateInput>
  }

  /**
   * Branch delete
   */
  export type BranchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter which Branch to delete.
     */
    where: BranchWhereUniqueInput
  }

  /**
   * Branch deleteMany
   */
  export type BranchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Branches to delete
     */
    where?: BranchWhereInput
  }

  /**
   * Branch.departments
   */
  export type Branch$departmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    where?: DepartmentWhereInput
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    cursor?: DepartmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Branch without action
   */
  export type BranchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
  }


  /**
   * Model Department
   */

  export type AggregateDepartment = {
    _count: DepartmentCountAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  export type DepartmentMinAggregateOutputType = {
    id: string | null
    name: string | null
    branchId: string | null
    createdAt: Date | null
  }

  export type DepartmentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    branchId: string | null
    createdAt: Date | null
  }

  export type DepartmentCountAggregateOutputType = {
    id: number
    name: number
    branchId: number
    createdAt: number
    _all: number
  }


  export type DepartmentMinAggregateInputType = {
    id?: true
    name?: true
    branchId?: true
    createdAt?: true
  }

  export type DepartmentMaxAggregateInputType = {
    id?: true
    name?: true
    branchId?: true
    createdAt?: true
  }

  export type DepartmentCountAggregateInputType = {
    id?: true
    name?: true
    branchId?: true
    createdAt?: true
    _all?: true
  }

  export type DepartmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Department to aggregate.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Departments
    **/
    _count?: true | DepartmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DepartmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DepartmentMaxAggregateInputType
  }

  export type GetDepartmentAggregateType<T extends DepartmentAggregateArgs> = {
        [P in keyof T & keyof AggregateDepartment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDepartment[P]>
      : GetScalarType<T[P], AggregateDepartment[P]>
  }




  export type DepartmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DepartmentWhereInput
    orderBy?: DepartmentOrderByWithAggregationInput | DepartmentOrderByWithAggregationInput[]
    by: DepartmentScalarFieldEnum[] | DepartmentScalarFieldEnum
    having?: DepartmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DepartmentCountAggregateInputType | true
    _min?: DepartmentMinAggregateInputType
    _max?: DepartmentMaxAggregateInputType
  }

  export type DepartmentGroupByOutputType = {
    id: string
    name: string
    branchId: string
    createdAt: Date
    _count: DepartmentCountAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  type GetDepartmentGroupByPayload<T extends DepartmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DepartmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DepartmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
            : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
        }
      >
    >


  export type DepartmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    branchId?: boolean
    createdAt?: boolean
    branch?: boolean | BranchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    branchId?: boolean
    createdAt?: boolean
    branch?: boolean | BranchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectScalar = {
    id?: boolean
    name?: boolean
    branchId?: boolean
    createdAt?: boolean
  }

  export type DepartmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    branch?: boolean | BranchDefaultArgs<ExtArgs>
  }
  export type DepartmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    branch?: boolean | BranchDefaultArgs<ExtArgs>
  }

  export type $DepartmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Department"
    objects: {
      branch: Prisma.$BranchPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      branchId: string
      createdAt: Date
    }, ExtArgs["result"]["department"]>
    composites: {}
  }

  type DepartmentGetPayload<S extends boolean | null | undefined | DepartmentDefaultArgs> = $Result.GetResult<Prisma.$DepartmentPayload, S>

  type DepartmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DepartmentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DepartmentCountAggregateInputType | true
    }

  export interface DepartmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Department'], meta: { name: 'Department' } }
    /**
     * Find zero or one Department that matches the filter.
     * @param {DepartmentFindUniqueArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DepartmentFindUniqueArgs>(args: SelectSubset<T, DepartmentFindUniqueArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Department that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DepartmentFindUniqueOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DepartmentFindUniqueOrThrowArgs>(args: SelectSubset<T, DepartmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Department that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DepartmentFindFirstArgs>(args?: SelectSubset<T, DepartmentFindFirstArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Department that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DepartmentFindFirstOrThrowArgs>(args?: SelectSubset<T, DepartmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Departments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Departments
     * const departments = await prisma.department.findMany()
     * 
     * // Get first 10 Departments
     * const departments = await prisma.department.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const departmentWithIdOnly = await prisma.department.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DepartmentFindManyArgs>(args?: SelectSubset<T, DepartmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Department.
     * @param {DepartmentCreateArgs} args - Arguments to create a Department.
     * @example
     * // Create one Department
     * const Department = await prisma.department.create({
     *   data: {
     *     // ... data to create a Department
     *   }
     * })
     * 
     */
    create<T extends DepartmentCreateArgs>(args: SelectSubset<T, DepartmentCreateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Departments.
     * @param {DepartmentCreateManyArgs} args - Arguments to create many Departments.
     * @example
     * // Create many Departments
     * const department = await prisma.department.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DepartmentCreateManyArgs>(args?: SelectSubset<T, DepartmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Departments and returns the data saved in the database.
     * @param {DepartmentCreateManyAndReturnArgs} args - Arguments to create many Departments.
     * @example
     * // Create many Departments
     * const department = await prisma.department.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Departments and only return the `id`
     * const departmentWithIdOnly = await prisma.department.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DepartmentCreateManyAndReturnArgs>(args?: SelectSubset<T, DepartmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Department.
     * @param {DepartmentDeleteArgs} args - Arguments to delete one Department.
     * @example
     * // Delete one Department
     * const Department = await prisma.department.delete({
     *   where: {
     *     // ... filter to delete one Department
     *   }
     * })
     * 
     */
    delete<T extends DepartmentDeleteArgs>(args: SelectSubset<T, DepartmentDeleteArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Department.
     * @param {DepartmentUpdateArgs} args - Arguments to update one Department.
     * @example
     * // Update one Department
     * const department = await prisma.department.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DepartmentUpdateArgs>(args: SelectSubset<T, DepartmentUpdateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Departments.
     * @param {DepartmentDeleteManyArgs} args - Arguments to filter Departments to delete.
     * @example
     * // Delete a few Departments
     * const { count } = await prisma.department.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DepartmentDeleteManyArgs>(args?: SelectSubset<T, DepartmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Departments
     * const department = await prisma.department.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DepartmentUpdateManyArgs>(args: SelectSubset<T, DepartmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Department.
     * @param {DepartmentUpsertArgs} args - Arguments to update or create a Department.
     * @example
     * // Update or create a Department
     * const department = await prisma.department.upsert({
     *   create: {
     *     // ... data to create a Department
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Department we want to update
     *   }
     * })
     */
    upsert<T extends DepartmentUpsertArgs>(args: SelectSubset<T, DepartmentUpsertArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentCountArgs} args - Arguments to filter Departments to count.
     * @example
     * // Count the number of Departments
     * const count = await prisma.department.count({
     *   where: {
     *     // ... the filter for the Departments we want to count
     *   }
     * })
    **/
    count<T extends DepartmentCountArgs>(
      args?: Subset<T, DepartmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DepartmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DepartmentAggregateArgs>(args: Subset<T, DepartmentAggregateArgs>): Prisma.PrismaPromise<GetDepartmentAggregateType<T>>

    /**
     * Group by Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DepartmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DepartmentGroupByArgs['orderBy'] }
        : { orderBy?: DepartmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DepartmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDepartmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Department model
   */
  readonly fields: DepartmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Department.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DepartmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    branch<T extends BranchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BranchDefaultArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Department model
   */ 
  interface DepartmentFieldRefs {
    readonly id: FieldRef<"Department", 'String'>
    readonly name: FieldRef<"Department", 'String'>
    readonly branchId: FieldRef<"Department", 'String'>
    readonly createdAt: FieldRef<"Department", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Department findUnique
   */
  export type DepartmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department findUniqueOrThrow
   */
  export type DepartmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department findFirst
   */
  export type DepartmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department findFirstOrThrow
   */
  export type DepartmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department findMany
   */
  export type DepartmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Departments to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department create
   */
  export type DepartmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Department.
     */
    data: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
  }

  /**
   * Department createMany
   */
  export type DepartmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Departments.
     */
    data: DepartmentCreateManyInput | DepartmentCreateManyInput[]
  }

  /**
   * Department createManyAndReturn
   */
  export type DepartmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Departments.
     */
    data: DepartmentCreateManyInput | DepartmentCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Department update
   */
  export type DepartmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Department.
     */
    data: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
    /**
     * Choose, which Department to update.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department updateMany
   */
  export type DepartmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Departments.
     */
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyInput>
    /**
     * Filter which Departments to update
     */
    where?: DepartmentWhereInput
  }

  /**
   * Department upsert
   */
  export type DepartmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Department to update in case it exists.
     */
    where: DepartmentWhereUniqueInput
    /**
     * In case the Department found by the `where` argument doesn't exist, create a new Department with this data.
     */
    create: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
    /**
     * In case the Department was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
  }

  /**
   * Department delete
   */
  export type DepartmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter which Department to delete.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department deleteMany
   */
  export type DepartmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Departments to delete
     */
    where?: DepartmentWhereInput
  }

  /**
   * Department without action
   */
  export type DepartmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
  }


  /**
   * Model Customer
   */

  export type AggregateCustomer = {
    _count: CustomerCountAggregateOutputType | null
    _avg: CustomerAvgAggregateOutputType | null
    _sum: CustomerSumAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  export type CustomerAvgAggregateOutputType = {
    id: number | null
  }

  export type CustomerSumAggregateOutputType = {
    id: number | null
  }

  export type CustomerMinAggregateOutputType = {
    id: number | null
    name: string | null
    phone: string | null
    status: string | null
    registeredAt: Date | null
  }

  export type CustomerMaxAggregateOutputType = {
    id: number | null
    name: string | null
    phone: string | null
    status: string | null
    registeredAt: Date | null
  }

  export type CustomerCountAggregateOutputType = {
    id: number
    name: number
    phone: number
    status: number
    registeredAt: number
    _all: number
  }


  export type CustomerAvgAggregateInputType = {
    id?: true
  }

  export type CustomerSumAggregateInputType = {
    id?: true
  }

  export type CustomerMinAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    status?: true
    registeredAt?: true
  }

  export type CustomerMaxAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    status?: true
    registeredAt?: true
  }

  export type CustomerCountAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    status?: true
    registeredAt?: true
    _all?: true
  }

  export type CustomerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customer to aggregate.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Customers
    **/
    _count?: true | CustomerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CustomerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CustomerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomerMaxAggregateInputType
  }

  export type GetCustomerAggregateType<T extends CustomerAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomer[P]>
      : GetScalarType<T[P], AggregateCustomer[P]>
  }




  export type CustomerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerWhereInput
    orderBy?: CustomerOrderByWithAggregationInput | CustomerOrderByWithAggregationInput[]
    by: CustomerScalarFieldEnum[] | CustomerScalarFieldEnum
    having?: CustomerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomerCountAggregateInputType | true
    _avg?: CustomerAvgAggregateInputType
    _sum?: CustomerSumAggregateInputType
    _min?: CustomerMinAggregateInputType
    _max?: CustomerMaxAggregateInputType
  }

  export type CustomerGroupByOutputType = {
    id: number
    name: string
    phone: string
    status: string
    registeredAt: Date
    _count: CustomerCountAggregateOutputType | null
    _avg: CustomerAvgAggregateOutputType | null
    _sum: CustomerSumAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  type GetCustomerGroupByPayload<T extends CustomerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomerGroupByOutputType[P]>
            : GetScalarType<T[P], CustomerGroupByOutputType[P]>
        }
      >
    >


  export type CustomerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    status?: boolean
    registeredAt?: boolean
    transactions?: boolean | Customer$transactionsArgs<ExtArgs>
    approvals?: boolean | Customer$approvalsArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    status?: boolean
    registeredAt?: boolean
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectScalar = {
    id?: boolean
    name?: boolean
    phone?: boolean
    status?: boolean
    registeredAt?: boolean
  }

  export type CustomerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transactions?: boolean | Customer$transactionsArgs<ExtArgs>
    approvals?: boolean | Customer$approvalsArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CustomerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CustomerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Customer"
    objects: {
      transactions: Prisma.$TransactionPayload<ExtArgs>[]
      approvals: Prisma.$PendingApprovalPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      phone: string
      status: string
      registeredAt: Date
    }, ExtArgs["result"]["customer"]>
    composites: {}
  }

  type CustomerGetPayload<S extends boolean | null | undefined | CustomerDefaultArgs> = $Result.GetResult<Prisma.$CustomerPayload, S>

  type CustomerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CustomerFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CustomerCountAggregateInputType | true
    }

  export interface CustomerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Customer'], meta: { name: 'Customer' } }
    /**
     * Find zero or one Customer that matches the filter.
     * @param {CustomerFindUniqueArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomerFindUniqueArgs>(args: SelectSubset<T, CustomerFindUniqueArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Customer that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CustomerFindUniqueOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomerFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Customer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomerFindFirstArgs>(args?: SelectSubset<T, CustomerFindFirstArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Customer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomerFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomerFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Customers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Customers
     * const customers = await prisma.customer.findMany()
     * 
     * // Get first 10 Customers
     * const customers = await prisma.customer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customerWithIdOnly = await prisma.customer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomerFindManyArgs>(args?: SelectSubset<T, CustomerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Customer.
     * @param {CustomerCreateArgs} args - Arguments to create a Customer.
     * @example
     * // Create one Customer
     * const Customer = await prisma.customer.create({
     *   data: {
     *     // ... data to create a Customer
     *   }
     * })
     * 
     */
    create<T extends CustomerCreateArgs>(args: SelectSubset<T, CustomerCreateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Customers.
     * @param {CustomerCreateManyArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomerCreateManyArgs>(args?: SelectSubset<T, CustomerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Customers and returns the data saved in the database.
     * @param {CustomerCreateManyAndReturnArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Customers and only return the `id`
     * const customerWithIdOnly = await prisma.customer.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomerCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Customer.
     * @param {CustomerDeleteArgs} args - Arguments to delete one Customer.
     * @example
     * // Delete one Customer
     * const Customer = await prisma.customer.delete({
     *   where: {
     *     // ... filter to delete one Customer
     *   }
     * })
     * 
     */
    delete<T extends CustomerDeleteArgs>(args: SelectSubset<T, CustomerDeleteArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Customer.
     * @param {CustomerUpdateArgs} args - Arguments to update one Customer.
     * @example
     * // Update one Customer
     * const customer = await prisma.customer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomerUpdateArgs>(args: SelectSubset<T, CustomerUpdateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Customers.
     * @param {CustomerDeleteManyArgs} args - Arguments to filter Customers to delete.
     * @example
     * // Delete a few Customers
     * const { count } = await prisma.customer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomerDeleteManyArgs>(args?: SelectSubset<T, CustomerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Customers
     * const customer = await prisma.customer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomerUpdateManyArgs>(args: SelectSubset<T, CustomerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Customer.
     * @param {CustomerUpsertArgs} args - Arguments to update or create a Customer.
     * @example
     * // Update or create a Customer
     * const customer = await prisma.customer.upsert({
     *   create: {
     *     // ... data to create a Customer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Customer we want to update
     *   }
     * })
     */
    upsert<T extends CustomerUpsertArgs>(args: SelectSubset<T, CustomerUpsertArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerCountArgs} args - Arguments to filter Customers to count.
     * @example
     * // Count the number of Customers
     * const count = await prisma.customer.count({
     *   where: {
     *     // ... the filter for the Customers we want to count
     *   }
     * })
    **/
    count<T extends CustomerCountArgs>(
      args?: Subset<T, CustomerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomerAggregateArgs>(args: Subset<T, CustomerAggregateArgs>): Prisma.PrismaPromise<GetCustomerAggregateType<T>>

    /**
     * Group by Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomerGroupByArgs['orderBy'] }
        : { orderBy?: CustomerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Customer model
   */
  readonly fields: CustomerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Customer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    transactions<T extends Customer$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany"> | Null>
    approvals<T extends Customer$approvalsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$approvalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Customer model
   */ 
  interface CustomerFieldRefs {
    readonly id: FieldRef<"Customer", 'Int'>
    readonly name: FieldRef<"Customer", 'String'>
    readonly phone: FieldRef<"Customer", 'String'>
    readonly status: FieldRef<"Customer", 'String'>
    readonly registeredAt: FieldRef<"Customer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Customer findUnique
   */
  export type CustomerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findUniqueOrThrow
   */
  export type CustomerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findFirst
   */
  export type CustomerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findFirstOrThrow
   */
  export type CustomerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findMany
   */
  export type CustomerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customers to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer create
   */
  export type CustomerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to create a Customer.
     */
    data: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
  }

  /**
   * Customer createMany
   */
  export type CustomerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
  }

  /**
   * Customer createManyAndReturn
   */
  export type CustomerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
  }

  /**
   * Customer update
   */
  export type CustomerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to update a Customer.
     */
    data: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
    /**
     * Choose, which Customer to update.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer updateMany
   */
  export type CustomerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Customers.
     */
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyInput>
    /**
     * Filter which Customers to update
     */
    where?: CustomerWhereInput
  }

  /**
   * Customer upsert
   */
  export type CustomerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The filter to search for the Customer to update in case it exists.
     */
    where: CustomerWhereUniqueInput
    /**
     * In case the Customer found by the `where` argument doesn't exist, create a new Customer with this data.
     */
    create: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
    /**
     * In case the Customer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
  }

  /**
   * Customer delete
   */
  export type CustomerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter which Customer to delete.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer deleteMany
   */
  export type CustomerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customers to delete
     */
    where?: CustomerWhereInput
  }

  /**
   * Customer.transactions
   */
  export type Customer$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    cursor?: TransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Customer.approvals
   */
  export type Customer$approvalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    where?: PendingApprovalWhereInput
    orderBy?: PendingApprovalOrderByWithRelationInput | PendingApprovalOrderByWithRelationInput[]
    cursor?: PendingApprovalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PendingApprovalScalarFieldEnum | PendingApprovalScalarFieldEnum[]
  }

  /**
   * Customer without action
   */
  export type CustomerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
  }


  /**
   * Model PendingApproval
   */

  export type AggregatePendingApproval = {
    _count: PendingApprovalCountAggregateOutputType | null
    _avg: PendingApprovalAvgAggregateOutputType | null
    _sum: PendingApprovalSumAggregateOutputType | null
    _min: PendingApprovalMinAggregateOutputType | null
    _max: PendingApprovalMaxAggregateOutputType | null
  }

  export type PendingApprovalAvgAggregateOutputType = {
    id: number | null
    customerId: number | null
  }

  export type PendingApprovalSumAggregateOutputType = {
    id: number | null
    customerId: number | null
  }

  export type PendingApprovalMinAggregateOutputType = {
    id: number | null
    customerId: number | null
    type: string | null
    requestedAt: Date | null
    customerName: string | null
    customerPhone: string | null
    details: string | null
    status: string | null
  }

  export type PendingApprovalMaxAggregateOutputType = {
    id: number | null
    customerId: number | null
    type: string | null
    requestedAt: Date | null
    customerName: string | null
    customerPhone: string | null
    details: string | null
    status: string | null
  }

  export type PendingApprovalCountAggregateOutputType = {
    id: number
    customerId: number
    type: number
    requestedAt: number
    customerName: number
    customerPhone: number
    details: number
    status: number
    _all: number
  }


  export type PendingApprovalAvgAggregateInputType = {
    id?: true
    customerId?: true
  }

  export type PendingApprovalSumAggregateInputType = {
    id?: true
    customerId?: true
  }

  export type PendingApprovalMinAggregateInputType = {
    id?: true
    customerId?: true
    type?: true
    requestedAt?: true
    customerName?: true
    customerPhone?: true
    details?: true
    status?: true
  }

  export type PendingApprovalMaxAggregateInputType = {
    id?: true
    customerId?: true
    type?: true
    requestedAt?: true
    customerName?: true
    customerPhone?: true
    details?: true
    status?: true
  }

  export type PendingApprovalCountAggregateInputType = {
    id?: true
    customerId?: true
    type?: true
    requestedAt?: true
    customerName?: true
    customerPhone?: true
    details?: true
    status?: true
    _all?: true
  }

  export type PendingApprovalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PendingApproval to aggregate.
     */
    where?: PendingApprovalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingApprovals to fetch.
     */
    orderBy?: PendingApprovalOrderByWithRelationInput | PendingApprovalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PendingApprovalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingApprovals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingApprovals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PendingApprovals
    **/
    _count?: true | PendingApprovalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PendingApprovalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PendingApprovalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PendingApprovalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PendingApprovalMaxAggregateInputType
  }

  export type GetPendingApprovalAggregateType<T extends PendingApprovalAggregateArgs> = {
        [P in keyof T & keyof AggregatePendingApproval]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePendingApproval[P]>
      : GetScalarType<T[P], AggregatePendingApproval[P]>
  }




  export type PendingApprovalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PendingApprovalWhereInput
    orderBy?: PendingApprovalOrderByWithAggregationInput | PendingApprovalOrderByWithAggregationInput[]
    by: PendingApprovalScalarFieldEnum[] | PendingApprovalScalarFieldEnum
    having?: PendingApprovalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PendingApprovalCountAggregateInputType | true
    _avg?: PendingApprovalAvgAggregateInputType
    _sum?: PendingApprovalSumAggregateInputType
    _min?: PendingApprovalMinAggregateInputType
    _max?: PendingApprovalMaxAggregateInputType
  }

  export type PendingApprovalGroupByOutputType = {
    id: number
    customerId: number
    type: string
    requestedAt: Date
    customerName: string
    customerPhone: string
    details: string | null
    status: string
    _count: PendingApprovalCountAggregateOutputType | null
    _avg: PendingApprovalAvgAggregateOutputType | null
    _sum: PendingApprovalSumAggregateOutputType | null
    _min: PendingApprovalMinAggregateOutputType | null
    _max: PendingApprovalMaxAggregateOutputType | null
  }

  type GetPendingApprovalGroupByPayload<T extends PendingApprovalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PendingApprovalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PendingApprovalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PendingApprovalGroupByOutputType[P]>
            : GetScalarType<T[P], PendingApprovalGroupByOutputType[P]>
        }
      >
    >


  export type PendingApprovalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    type?: boolean
    requestedAt?: boolean
    customerName?: boolean
    customerPhone?: boolean
    details?: boolean
    status?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pendingApproval"]>

  export type PendingApprovalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    type?: boolean
    requestedAt?: boolean
    customerName?: boolean
    customerPhone?: boolean
    details?: boolean
    status?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pendingApproval"]>

  export type PendingApprovalSelectScalar = {
    id?: boolean
    customerId?: boolean
    type?: boolean
    requestedAt?: boolean
    customerName?: boolean
    customerPhone?: boolean
    details?: boolean
    status?: boolean
  }

  export type PendingApprovalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }
  export type PendingApprovalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }

  export type $PendingApprovalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PendingApproval"
    objects: {
      customer: Prisma.$CustomerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      customerId: number
      type: string
      requestedAt: Date
      customerName: string
      customerPhone: string
      details: string | null
      status: string
    }, ExtArgs["result"]["pendingApproval"]>
    composites: {}
  }

  type PendingApprovalGetPayload<S extends boolean | null | undefined | PendingApprovalDefaultArgs> = $Result.GetResult<Prisma.$PendingApprovalPayload, S>

  type PendingApprovalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PendingApprovalFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PendingApprovalCountAggregateInputType | true
    }

  export interface PendingApprovalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PendingApproval'], meta: { name: 'PendingApproval' } }
    /**
     * Find zero or one PendingApproval that matches the filter.
     * @param {PendingApprovalFindUniqueArgs} args - Arguments to find a PendingApproval
     * @example
     * // Get one PendingApproval
     * const pendingApproval = await prisma.pendingApproval.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PendingApprovalFindUniqueArgs>(args: SelectSubset<T, PendingApprovalFindUniqueArgs<ExtArgs>>): Prisma__PendingApprovalClient<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PendingApproval that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PendingApprovalFindUniqueOrThrowArgs} args - Arguments to find a PendingApproval
     * @example
     * // Get one PendingApproval
     * const pendingApproval = await prisma.pendingApproval.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PendingApprovalFindUniqueOrThrowArgs>(args: SelectSubset<T, PendingApprovalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PendingApprovalClient<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PendingApproval that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingApprovalFindFirstArgs} args - Arguments to find a PendingApproval
     * @example
     * // Get one PendingApproval
     * const pendingApproval = await prisma.pendingApproval.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PendingApprovalFindFirstArgs>(args?: SelectSubset<T, PendingApprovalFindFirstArgs<ExtArgs>>): Prisma__PendingApprovalClient<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PendingApproval that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingApprovalFindFirstOrThrowArgs} args - Arguments to find a PendingApproval
     * @example
     * // Get one PendingApproval
     * const pendingApproval = await prisma.pendingApproval.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PendingApprovalFindFirstOrThrowArgs>(args?: SelectSubset<T, PendingApprovalFindFirstOrThrowArgs<ExtArgs>>): Prisma__PendingApprovalClient<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PendingApprovals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingApprovalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PendingApprovals
     * const pendingApprovals = await prisma.pendingApproval.findMany()
     * 
     * // Get first 10 PendingApprovals
     * const pendingApprovals = await prisma.pendingApproval.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pendingApprovalWithIdOnly = await prisma.pendingApproval.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PendingApprovalFindManyArgs>(args?: SelectSubset<T, PendingApprovalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PendingApproval.
     * @param {PendingApprovalCreateArgs} args - Arguments to create a PendingApproval.
     * @example
     * // Create one PendingApproval
     * const PendingApproval = await prisma.pendingApproval.create({
     *   data: {
     *     // ... data to create a PendingApproval
     *   }
     * })
     * 
     */
    create<T extends PendingApprovalCreateArgs>(args: SelectSubset<T, PendingApprovalCreateArgs<ExtArgs>>): Prisma__PendingApprovalClient<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PendingApprovals.
     * @param {PendingApprovalCreateManyArgs} args - Arguments to create many PendingApprovals.
     * @example
     * // Create many PendingApprovals
     * const pendingApproval = await prisma.pendingApproval.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PendingApprovalCreateManyArgs>(args?: SelectSubset<T, PendingApprovalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PendingApprovals and returns the data saved in the database.
     * @param {PendingApprovalCreateManyAndReturnArgs} args - Arguments to create many PendingApprovals.
     * @example
     * // Create many PendingApprovals
     * const pendingApproval = await prisma.pendingApproval.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PendingApprovals and only return the `id`
     * const pendingApprovalWithIdOnly = await prisma.pendingApproval.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PendingApprovalCreateManyAndReturnArgs>(args?: SelectSubset<T, PendingApprovalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PendingApproval.
     * @param {PendingApprovalDeleteArgs} args - Arguments to delete one PendingApproval.
     * @example
     * // Delete one PendingApproval
     * const PendingApproval = await prisma.pendingApproval.delete({
     *   where: {
     *     // ... filter to delete one PendingApproval
     *   }
     * })
     * 
     */
    delete<T extends PendingApprovalDeleteArgs>(args: SelectSubset<T, PendingApprovalDeleteArgs<ExtArgs>>): Prisma__PendingApprovalClient<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PendingApproval.
     * @param {PendingApprovalUpdateArgs} args - Arguments to update one PendingApproval.
     * @example
     * // Update one PendingApproval
     * const pendingApproval = await prisma.pendingApproval.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PendingApprovalUpdateArgs>(args: SelectSubset<T, PendingApprovalUpdateArgs<ExtArgs>>): Prisma__PendingApprovalClient<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PendingApprovals.
     * @param {PendingApprovalDeleteManyArgs} args - Arguments to filter PendingApprovals to delete.
     * @example
     * // Delete a few PendingApprovals
     * const { count } = await prisma.pendingApproval.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PendingApprovalDeleteManyArgs>(args?: SelectSubset<T, PendingApprovalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PendingApprovals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingApprovalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PendingApprovals
     * const pendingApproval = await prisma.pendingApproval.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PendingApprovalUpdateManyArgs>(args: SelectSubset<T, PendingApprovalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PendingApproval.
     * @param {PendingApprovalUpsertArgs} args - Arguments to update or create a PendingApproval.
     * @example
     * // Update or create a PendingApproval
     * const pendingApproval = await prisma.pendingApproval.upsert({
     *   create: {
     *     // ... data to create a PendingApproval
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PendingApproval we want to update
     *   }
     * })
     */
    upsert<T extends PendingApprovalUpsertArgs>(args: SelectSubset<T, PendingApprovalUpsertArgs<ExtArgs>>): Prisma__PendingApprovalClient<$Result.GetResult<Prisma.$PendingApprovalPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PendingApprovals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingApprovalCountArgs} args - Arguments to filter PendingApprovals to count.
     * @example
     * // Count the number of PendingApprovals
     * const count = await prisma.pendingApproval.count({
     *   where: {
     *     // ... the filter for the PendingApprovals we want to count
     *   }
     * })
    **/
    count<T extends PendingApprovalCountArgs>(
      args?: Subset<T, PendingApprovalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PendingApprovalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PendingApproval.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingApprovalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PendingApprovalAggregateArgs>(args: Subset<T, PendingApprovalAggregateArgs>): Prisma.PrismaPromise<GetPendingApprovalAggregateType<T>>

    /**
     * Group by PendingApproval.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingApprovalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PendingApprovalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PendingApprovalGroupByArgs['orderBy'] }
        : { orderBy?: PendingApprovalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PendingApprovalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPendingApprovalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PendingApproval model
   */
  readonly fields: PendingApprovalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PendingApproval.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PendingApprovalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PendingApproval model
   */ 
  interface PendingApprovalFieldRefs {
    readonly id: FieldRef<"PendingApproval", 'Int'>
    readonly customerId: FieldRef<"PendingApproval", 'Int'>
    readonly type: FieldRef<"PendingApproval", 'String'>
    readonly requestedAt: FieldRef<"PendingApproval", 'DateTime'>
    readonly customerName: FieldRef<"PendingApproval", 'String'>
    readonly customerPhone: FieldRef<"PendingApproval", 'String'>
    readonly details: FieldRef<"PendingApproval", 'String'>
    readonly status: FieldRef<"PendingApproval", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PendingApproval findUnique
   */
  export type PendingApprovalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    /**
     * Filter, which PendingApproval to fetch.
     */
    where: PendingApprovalWhereUniqueInput
  }

  /**
   * PendingApproval findUniqueOrThrow
   */
  export type PendingApprovalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    /**
     * Filter, which PendingApproval to fetch.
     */
    where: PendingApprovalWhereUniqueInput
  }

  /**
   * PendingApproval findFirst
   */
  export type PendingApprovalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    /**
     * Filter, which PendingApproval to fetch.
     */
    where?: PendingApprovalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingApprovals to fetch.
     */
    orderBy?: PendingApprovalOrderByWithRelationInput | PendingApprovalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PendingApprovals.
     */
    cursor?: PendingApprovalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingApprovals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingApprovals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PendingApprovals.
     */
    distinct?: PendingApprovalScalarFieldEnum | PendingApprovalScalarFieldEnum[]
  }

  /**
   * PendingApproval findFirstOrThrow
   */
  export type PendingApprovalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    /**
     * Filter, which PendingApproval to fetch.
     */
    where?: PendingApprovalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingApprovals to fetch.
     */
    orderBy?: PendingApprovalOrderByWithRelationInput | PendingApprovalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PendingApprovals.
     */
    cursor?: PendingApprovalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingApprovals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingApprovals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PendingApprovals.
     */
    distinct?: PendingApprovalScalarFieldEnum | PendingApprovalScalarFieldEnum[]
  }

  /**
   * PendingApproval findMany
   */
  export type PendingApprovalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    /**
     * Filter, which PendingApprovals to fetch.
     */
    where?: PendingApprovalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingApprovals to fetch.
     */
    orderBy?: PendingApprovalOrderByWithRelationInput | PendingApprovalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PendingApprovals.
     */
    cursor?: PendingApprovalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingApprovals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingApprovals.
     */
    skip?: number
    distinct?: PendingApprovalScalarFieldEnum | PendingApprovalScalarFieldEnum[]
  }

  /**
   * PendingApproval create
   */
  export type PendingApprovalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    /**
     * The data needed to create a PendingApproval.
     */
    data: XOR<PendingApprovalCreateInput, PendingApprovalUncheckedCreateInput>
  }

  /**
   * PendingApproval createMany
   */
  export type PendingApprovalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PendingApprovals.
     */
    data: PendingApprovalCreateManyInput | PendingApprovalCreateManyInput[]
  }

  /**
   * PendingApproval createManyAndReturn
   */
  export type PendingApprovalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PendingApprovals.
     */
    data: PendingApprovalCreateManyInput | PendingApprovalCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PendingApproval update
   */
  export type PendingApprovalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    /**
     * The data needed to update a PendingApproval.
     */
    data: XOR<PendingApprovalUpdateInput, PendingApprovalUncheckedUpdateInput>
    /**
     * Choose, which PendingApproval to update.
     */
    where: PendingApprovalWhereUniqueInput
  }

  /**
   * PendingApproval updateMany
   */
  export type PendingApprovalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PendingApprovals.
     */
    data: XOR<PendingApprovalUpdateManyMutationInput, PendingApprovalUncheckedUpdateManyInput>
    /**
     * Filter which PendingApprovals to update
     */
    where?: PendingApprovalWhereInput
  }

  /**
   * PendingApproval upsert
   */
  export type PendingApprovalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    /**
     * The filter to search for the PendingApproval to update in case it exists.
     */
    where: PendingApprovalWhereUniqueInput
    /**
     * In case the PendingApproval found by the `where` argument doesn't exist, create a new PendingApproval with this data.
     */
    create: XOR<PendingApprovalCreateInput, PendingApprovalUncheckedCreateInput>
    /**
     * In case the PendingApproval was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PendingApprovalUpdateInput, PendingApprovalUncheckedUpdateInput>
  }

  /**
   * PendingApproval delete
   */
  export type PendingApprovalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
    /**
     * Filter which PendingApproval to delete.
     */
    where: PendingApprovalWhereUniqueInput
  }

  /**
   * PendingApproval deleteMany
   */
  export type PendingApprovalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PendingApprovals to delete
     */
    where?: PendingApprovalWhereInput
  }

  /**
   * PendingApproval without action
   */
  export type PendingApprovalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingApproval
     */
    select?: PendingApprovalSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingApprovalInclude<ExtArgs> | null
  }


  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  export type TransactionAvgAggregateOutputType = {
    customerId: number | null
    amount: number | null
    fee: number | null
  }

  export type TransactionSumAggregateOutputType = {
    customerId: number | null
    amount: number | null
    fee: number | null
  }

  export type TransactionMinAggregateOutputType = {
    id: string | null
    customerId: number | null
    amount: number | null
    fee: number | null
    status: string | null
    timestamp: Date | null
    type: string | null
    channel: string | null
    from_account: string | null
    to_account: string | null
    is_anomalous: boolean | null
    anomaly_reason: string | null
  }

  export type TransactionMaxAggregateOutputType = {
    id: string | null
    customerId: number | null
    amount: number | null
    fee: number | null
    status: string | null
    timestamp: Date | null
    type: string | null
    channel: string | null
    from_account: string | null
    to_account: string | null
    is_anomalous: boolean | null
    anomaly_reason: string | null
  }

  export type TransactionCountAggregateOutputType = {
    id: number
    customerId: number
    amount: number
    fee: number
    status: number
    timestamp: number
    type: number
    channel: number
    from_account: number
    to_account: number
    is_anomalous: number
    anomaly_reason: number
    _all: number
  }


  export type TransactionAvgAggregateInputType = {
    customerId?: true
    amount?: true
    fee?: true
  }

  export type TransactionSumAggregateInputType = {
    customerId?: true
    amount?: true
    fee?: true
  }

  export type TransactionMinAggregateInputType = {
    id?: true
    customerId?: true
    amount?: true
    fee?: true
    status?: true
    timestamp?: true
    type?: true
    channel?: true
    from_account?: true
    to_account?: true
    is_anomalous?: true
    anomaly_reason?: true
  }

  export type TransactionMaxAggregateInputType = {
    id?: true
    customerId?: true
    amount?: true
    fee?: true
    status?: true
    timestamp?: true
    type?: true
    channel?: true
    from_account?: true
    to_account?: true
    is_anomalous?: true
    anomaly_reason?: true
  }

  export type TransactionCountAggregateInputType = {
    id?: true
    customerId?: true
    amount?: true
    fee?: true
    status?: true
    timestamp?: true
    type?: true
    channel?: true
    from_account?: true
    to_account?: true
    is_anomalous?: true
    anomaly_reason?: true
    _all?: true
  }

  export type TransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transactions
    **/
    _count?: true | TransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionMaxAggregateInputType
  }

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>
  }




  export type TransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[]
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum
    having?: TransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionCountAggregateInputType | true
    _avg?: TransactionAvgAggregateInputType
    _sum?: TransactionSumAggregateInputType
    _min?: TransactionMinAggregateInputType
    _max?: TransactionMaxAggregateInputType
  }

  export type TransactionGroupByOutputType = {
    id: string
    customerId: number
    amount: number
    fee: number
    status: string
    timestamp: Date
    type: string
    channel: string
    from_account: string | null
    to_account: string | null
    is_anomalous: boolean
    anomaly_reason: string | null
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
        }
      >
    >


  export type TransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    amount?: boolean
    fee?: boolean
    status?: boolean
    timestamp?: boolean
    type?: boolean
    channel?: boolean
    from_account?: boolean
    to_account?: boolean
    is_anomalous?: boolean
    anomaly_reason?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    amount?: boolean
    fee?: boolean
    status?: boolean
    timestamp?: boolean
    type?: boolean
    channel?: boolean
    from_account?: boolean
    to_account?: boolean
    is_anomalous?: boolean
    anomaly_reason?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectScalar = {
    id?: boolean
    customerId?: boolean
    amount?: boolean
    fee?: boolean
    status?: boolean
    timestamp?: boolean
    type?: boolean
    channel?: boolean
    from_account?: boolean
    to_account?: boolean
    is_anomalous?: boolean
    anomaly_reason?: boolean
  }

  export type TransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }

  export type $TransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transaction"
    objects: {
      customer: Prisma.$CustomerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      customerId: number
      amount: number
      fee: number
      status: string
      timestamp: Date
      type: string
      channel: string
      from_account: string | null
      to_account: string | null
      is_anomalous: boolean
      anomaly_reason: string | null
    }, ExtArgs["result"]["transaction"]>
    composites: {}
  }

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> = $Result.GetResult<Prisma.$TransactionPayload, S>

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TransactionCountAggregateInputType | true
    }

  export interface TransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transaction'], meta: { name: 'Transaction' } }
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     * 
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionFindManyArgs>(args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     * 
     */
    create<T extends TransactionCreateArgs>(args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionCreateManyArgs>(args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     * 
     */
    delete<T extends TransactionDeleteArgs>(args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionUpdateArgs>(args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionDeleteManyArgs>(args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionUpdateManyArgs>(args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
    **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransactionAggregateArgs>(args: Subset<T, TransactionAggregateArgs>): Prisma.PrismaPromise<GetTransactionAggregateType<T>>

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transaction model
   */
  readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Transaction model
   */ 
  interface TransactionFieldRefs {
    readonly id: FieldRef<"Transaction", 'String'>
    readonly customerId: FieldRef<"Transaction", 'Int'>
    readonly amount: FieldRef<"Transaction", 'Float'>
    readonly fee: FieldRef<"Transaction", 'Float'>
    readonly status: FieldRef<"Transaction", 'String'>
    readonly timestamp: FieldRef<"Transaction", 'DateTime'>
    readonly type: FieldRef<"Transaction", 'String'>
    readonly channel: FieldRef<"Transaction", 'String'>
    readonly from_account: FieldRef<"Transaction", 'String'>
    readonly to_account: FieldRef<"Transaction", 'String'>
    readonly is_anomalous: FieldRef<"Transaction", 'Boolean'>
    readonly anomaly_reason: FieldRef<"Transaction", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
  }

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
  }

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
  }

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
  }

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput
  }

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
  }


  /**
   * Model AppUser
   */

  export type AggregateAppUser = {
    _count: AppUserCountAggregateOutputType | null
    _min: AppUserMinAggregateOutputType | null
    _max: AppUserMaxAggregateOutputType | null
  }

  export type AppUserMinAggregateOutputType = {
    Id: string | null
    CIFNumber: string | null
    FirstName: string | null
    SecondName: string | null
    LastName: string | null
    Email: string | null
    PhoneNumber: string | null
    Status: string | null
    SignUpMainAuth: string | null
    SignUp2FA: string | null
    BranchCode: string | null
    BranchName: string | null
    AddressLine1: string | null
    AddressLine2: string | null
    AddressLine3: string | null
    AddressLine4: string | null
    Nationality: string | null
    Channel: string | null
    InsertDate: Date | null
    UpdateDate: Date | null
  }

  export type AppUserMaxAggregateOutputType = {
    Id: string | null
    CIFNumber: string | null
    FirstName: string | null
    SecondName: string | null
    LastName: string | null
    Email: string | null
    PhoneNumber: string | null
    Status: string | null
    SignUpMainAuth: string | null
    SignUp2FA: string | null
    BranchCode: string | null
    BranchName: string | null
    AddressLine1: string | null
    AddressLine2: string | null
    AddressLine3: string | null
    AddressLine4: string | null
    Nationality: string | null
    Channel: string | null
    InsertDate: Date | null
    UpdateDate: Date | null
  }

  export type AppUserCountAggregateOutputType = {
    Id: number
    CIFNumber: number
    FirstName: number
    SecondName: number
    LastName: number
    Email: number
    PhoneNumber: number
    Status: number
    SignUpMainAuth: number
    SignUp2FA: number
    BranchCode: number
    BranchName: number
    AddressLine1: number
    AddressLine2: number
    AddressLine3: number
    AddressLine4: number
    Nationality: number
    Channel: number
    InsertDate: number
    UpdateDate: number
    _all: number
  }


  export type AppUserMinAggregateInputType = {
    Id?: true
    CIFNumber?: true
    FirstName?: true
    SecondName?: true
    LastName?: true
    Email?: true
    PhoneNumber?: true
    Status?: true
    SignUpMainAuth?: true
    SignUp2FA?: true
    BranchCode?: true
    BranchName?: true
    AddressLine1?: true
    AddressLine2?: true
    AddressLine3?: true
    AddressLine4?: true
    Nationality?: true
    Channel?: true
    InsertDate?: true
    UpdateDate?: true
  }

  export type AppUserMaxAggregateInputType = {
    Id?: true
    CIFNumber?: true
    FirstName?: true
    SecondName?: true
    LastName?: true
    Email?: true
    PhoneNumber?: true
    Status?: true
    SignUpMainAuth?: true
    SignUp2FA?: true
    BranchCode?: true
    BranchName?: true
    AddressLine1?: true
    AddressLine2?: true
    AddressLine3?: true
    AddressLine4?: true
    Nationality?: true
    Channel?: true
    InsertDate?: true
    UpdateDate?: true
  }

  export type AppUserCountAggregateInputType = {
    Id?: true
    CIFNumber?: true
    FirstName?: true
    SecondName?: true
    LastName?: true
    Email?: true
    PhoneNumber?: true
    Status?: true
    SignUpMainAuth?: true
    SignUp2FA?: true
    BranchCode?: true
    BranchName?: true
    AddressLine1?: true
    AddressLine2?: true
    AddressLine3?: true
    AddressLine4?: true
    Nationality?: true
    Channel?: true
    InsertDate?: true
    UpdateDate?: true
    _all?: true
  }

  export type AppUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppUser to aggregate.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppUsers
    **/
    _count?: true | AppUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppUserMaxAggregateInputType
  }

  export type GetAppUserAggregateType<T extends AppUserAggregateArgs> = {
        [P in keyof T & keyof AggregateAppUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppUser[P]>
      : GetScalarType<T[P], AggregateAppUser[P]>
  }




  export type AppUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppUserWhereInput
    orderBy?: AppUserOrderByWithAggregationInput | AppUserOrderByWithAggregationInput[]
    by: AppUserScalarFieldEnum[] | AppUserScalarFieldEnum
    having?: AppUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppUserCountAggregateInputType | true
    _min?: AppUserMinAggregateInputType
    _max?: AppUserMaxAggregateInputType
  }

  export type AppUserGroupByOutputType = {
    Id: string
    CIFNumber: string
    FirstName: string
    SecondName: string | null
    LastName: string
    Email: string
    PhoneNumber: string
    Status: string
    SignUpMainAuth: string
    SignUp2FA: string
    BranchCode: string | null
    BranchName: string | null
    AddressLine1: string | null
    AddressLine2: string | null
    AddressLine3: string | null
    AddressLine4: string | null
    Nationality: string | null
    Channel: string | null
    InsertDate: Date
    UpdateDate: Date
    _count: AppUserCountAggregateOutputType | null
    _min: AppUserMinAggregateOutputType | null
    _max: AppUserMaxAggregateOutputType | null
  }

  type GetAppUserGroupByPayload<T extends AppUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppUserGroupByOutputType[P]>
            : GetScalarType<T[P], AppUserGroupByOutputType[P]>
        }
      >
    >


  export type AppUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    CIFNumber?: boolean
    FirstName?: boolean
    SecondName?: boolean
    LastName?: boolean
    Email?: boolean
    PhoneNumber?: boolean
    Status?: boolean
    SignUpMainAuth?: boolean
    SignUp2FA?: boolean
    BranchCode?: boolean
    BranchName?: boolean
    AddressLine1?: boolean
    AddressLine2?: boolean
    AddressLine3?: boolean
    AddressLine4?: boolean
    Nationality?: boolean
    Channel?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }, ExtArgs["result"]["appUser"]>

  export type AppUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    CIFNumber?: boolean
    FirstName?: boolean
    SecondName?: boolean
    LastName?: boolean
    Email?: boolean
    PhoneNumber?: boolean
    Status?: boolean
    SignUpMainAuth?: boolean
    SignUp2FA?: boolean
    BranchCode?: boolean
    BranchName?: boolean
    AddressLine1?: boolean
    AddressLine2?: boolean
    AddressLine3?: boolean
    AddressLine4?: boolean
    Nationality?: boolean
    Channel?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }, ExtArgs["result"]["appUser"]>

  export type AppUserSelectScalar = {
    Id?: boolean
    CIFNumber?: boolean
    FirstName?: boolean
    SecondName?: boolean
    LastName?: boolean
    Email?: boolean
    PhoneNumber?: boolean
    Status?: boolean
    SignUpMainAuth?: boolean
    SignUp2FA?: boolean
    BranchCode?: boolean
    BranchName?: boolean
    AddressLine1?: boolean
    AddressLine2?: boolean
    AddressLine3?: boolean
    AddressLine4?: boolean
    Nationality?: boolean
    Channel?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }


  export type $AppUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AppUser"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id: string
      CIFNumber: string
      FirstName: string
      SecondName: string | null
      LastName: string
      Email: string
      PhoneNumber: string
      Status: string
      SignUpMainAuth: string
      SignUp2FA: string
      BranchCode: string | null
      BranchName: string | null
      AddressLine1: string | null
      AddressLine2: string | null
      AddressLine3: string | null
      AddressLine4: string | null
      Nationality: string | null
      Channel: string | null
      InsertDate: Date
      UpdateDate: Date
    }, ExtArgs["result"]["appUser"]>
    composites: {}
  }

  type AppUserGetPayload<S extends boolean | null | undefined | AppUserDefaultArgs> = $Result.GetResult<Prisma.$AppUserPayload, S>

  type AppUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AppUserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AppUserCountAggregateInputType | true
    }

  export interface AppUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AppUser'], meta: { name: 'AppUser' } }
    /**
     * Find zero or one AppUser that matches the filter.
     * @param {AppUserFindUniqueArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AppUserFindUniqueArgs>(args: SelectSubset<T, AppUserFindUniqueArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AppUser that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AppUserFindUniqueOrThrowArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AppUserFindUniqueOrThrowArgs>(args: SelectSubset<T, AppUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AppUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserFindFirstArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AppUserFindFirstArgs>(args?: SelectSubset<T, AppUserFindFirstArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AppUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserFindFirstOrThrowArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AppUserFindFirstOrThrowArgs>(args?: SelectSubset<T, AppUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AppUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppUsers
     * const appUsers = await prisma.appUser.findMany()
     * 
     * // Get first 10 AppUsers
     * const appUsers = await prisma.appUser.findMany({ take: 10 })
     * 
     * // Only select the `Id`
     * const appUserWithIdOnly = await prisma.appUser.findMany({ select: { Id: true } })
     * 
     */
    findMany<T extends AppUserFindManyArgs>(args?: SelectSubset<T, AppUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AppUser.
     * @param {AppUserCreateArgs} args - Arguments to create a AppUser.
     * @example
     * // Create one AppUser
     * const AppUser = await prisma.appUser.create({
     *   data: {
     *     // ... data to create a AppUser
     *   }
     * })
     * 
     */
    create<T extends AppUserCreateArgs>(args: SelectSubset<T, AppUserCreateArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AppUsers.
     * @param {AppUserCreateManyArgs} args - Arguments to create many AppUsers.
     * @example
     * // Create many AppUsers
     * const appUser = await prisma.appUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AppUserCreateManyArgs>(args?: SelectSubset<T, AppUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AppUsers and returns the data saved in the database.
     * @param {AppUserCreateManyAndReturnArgs} args - Arguments to create many AppUsers.
     * @example
     * // Create many AppUsers
     * const appUser = await prisma.appUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AppUsers and only return the `Id`
     * const appUserWithIdOnly = await prisma.appUser.createManyAndReturn({ 
     *   select: { Id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AppUserCreateManyAndReturnArgs>(args?: SelectSubset<T, AppUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AppUser.
     * @param {AppUserDeleteArgs} args - Arguments to delete one AppUser.
     * @example
     * // Delete one AppUser
     * const AppUser = await prisma.appUser.delete({
     *   where: {
     *     // ... filter to delete one AppUser
     *   }
     * })
     * 
     */
    delete<T extends AppUserDeleteArgs>(args: SelectSubset<T, AppUserDeleteArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AppUser.
     * @param {AppUserUpdateArgs} args - Arguments to update one AppUser.
     * @example
     * // Update one AppUser
     * const appUser = await prisma.appUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AppUserUpdateArgs>(args: SelectSubset<T, AppUserUpdateArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AppUsers.
     * @param {AppUserDeleteManyArgs} args - Arguments to filter AppUsers to delete.
     * @example
     * // Delete a few AppUsers
     * const { count } = await prisma.appUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AppUserDeleteManyArgs>(args?: SelectSubset<T, AppUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppUsers
     * const appUser = await prisma.appUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AppUserUpdateManyArgs>(args: SelectSubset<T, AppUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AppUser.
     * @param {AppUserUpsertArgs} args - Arguments to update or create a AppUser.
     * @example
     * // Update or create a AppUser
     * const appUser = await prisma.appUser.upsert({
     *   create: {
     *     // ... data to create a AppUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppUser we want to update
     *   }
     * })
     */
    upsert<T extends AppUserUpsertArgs>(args: SelectSubset<T, AppUserUpsertArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AppUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserCountArgs} args - Arguments to filter AppUsers to count.
     * @example
     * // Count the number of AppUsers
     * const count = await prisma.appUser.count({
     *   where: {
     *     // ... the filter for the AppUsers we want to count
     *   }
     * })
    **/
    count<T extends AppUserCountArgs>(
      args?: Subset<T, AppUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppUserAggregateArgs>(args: Subset<T, AppUserAggregateArgs>): Prisma.PrismaPromise<GetAppUserAggregateType<T>>

    /**
     * Group by AppUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppUserGroupByArgs['orderBy'] }
        : { orderBy?: AppUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AppUser model
   */
  readonly fields: AppUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AppUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AppUser model
   */ 
  interface AppUserFieldRefs {
    readonly Id: FieldRef<"AppUser", 'String'>
    readonly CIFNumber: FieldRef<"AppUser", 'String'>
    readonly FirstName: FieldRef<"AppUser", 'String'>
    readonly SecondName: FieldRef<"AppUser", 'String'>
    readonly LastName: FieldRef<"AppUser", 'String'>
    readonly Email: FieldRef<"AppUser", 'String'>
    readonly PhoneNumber: FieldRef<"AppUser", 'String'>
    readonly Status: FieldRef<"AppUser", 'String'>
    readonly SignUpMainAuth: FieldRef<"AppUser", 'String'>
    readonly SignUp2FA: FieldRef<"AppUser", 'String'>
    readonly BranchCode: FieldRef<"AppUser", 'String'>
    readonly BranchName: FieldRef<"AppUser", 'String'>
    readonly AddressLine1: FieldRef<"AppUser", 'String'>
    readonly AddressLine2: FieldRef<"AppUser", 'String'>
    readonly AddressLine3: FieldRef<"AppUser", 'String'>
    readonly AddressLine4: FieldRef<"AppUser", 'String'>
    readonly Nationality: FieldRef<"AppUser", 'String'>
    readonly Channel: FieldRef<"AppUser", 'String'>
    readonly InsertDate: FieldRef<"AppUser", 'DateTime'>
    readonly UpdateDate: FieldRef<"AppUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AppUser findUnique
   */
  export type AppUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser findUniqueOrThrow
   */
  export type AppUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser findFirst
   */
  export type AppUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppUsers.
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppUsers.
     */
    distinct?: AppUserScalarFieldEnum | AppUserScalarFieldEnum[]
  }

  /**
   * AppUser findFirstOrThrow
   */
  export type AppUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppUsers.
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppUsers.
     */
    distinct?: AppUserScalarFieldEnum | AppUserScalarFieldEnum[]
  }

  /**
   * AppUser findMany
   */
  export type AppUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUsers to fetch.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppUsers.
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    distinct?: AppUserScalarFieldEnum | AppUserScalarFieldEnum[]
  }

  /**
   * AppUser create
   */
  export type AppUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * The data needed to create a AppUser.
     */
    data: XOR<AppUserCreateInput, AppUserUncheckedCreateInput>
  }

  /**
   * AppUser createMany
   */
  export type AppUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AppUsers.
     */
    data: AppUserCreateManyInput | AppUserCreateManyInput[]
  }

  /**
   * AppUser createManyAndReturn
   */
  export type AppUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AppUsers.
     */
    data: AppUserCreateManyInput | AppUserCreateManyInput[]
  }

  /**
   * AppUser update
   */
  export type AppUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * The data needed to update a AppUser.
     */
    data: XOR<AppUserUpdateInput, AppUserUncheckedUpdateInput>
    /**
     * Choose, which AppUser to update.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser updateMany
   */
  export type AppUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AppUsers.
     */
    data: XOR<AppUserUpdateManyMutationInput, AppUserUncheckedUpdateManyInput>
    /**
     * Filter which AppUsers to update
     */
    where?: AppUserWhereInput
  }

  /**
   * AppUser upsert
   */
  export type AppUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * The filter to search for the AppUser to update in case it exists.
     */
    where: AppUserWhereUniqueInput
    /**
     * In case the AppUser found by the `where` argument doesn't exist, create a new AppUser with this data.
     */
    create: XOR<AppUserCreateInput, AppUserUncheckedCreateInput>
    /**
     * In case the AppUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppUserUpdateInput, AppUserUncheckedUpdateInput>
  }

  /**
   * AppUser delete
   */
  export type AppUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter which AppUser to delete.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser deleteMany
   */
  export type AppUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppUsers to delete
     */
    where?: AppUserWhereInput
  }

  /**
   * AppUser without action
   */
  export type AppUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
  }


  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountMinAggregateOutputType = {
    Id: string | null
    CIFNumber: string | null
    AccountNumber: string | null
    FirstName: string | null
    SecondName: string | null
    LastName: string | null
    AccountType: string | null
    Currency: string | null
    Status: string | null
    BranchName: string | null
    InsertDate: Date | null
    UpdateDate: Date | null
  }

  export type AccountMaxAggregateOutputType = {
    Id: string | null
    CIFNumber: string | null
    AccountNumber: string | null
    FirstName: string | null
    SecondName: string | null
    LastName: string | null
    AccountType: string | null
    Currency: string | null
    Status: string | null
    BranchName: string | null
    InsertDate: Date | null
    UpdateDate: Date | null
  }

  export type AccountCountAggregateOutputType = {
    Id: number
    CIFNumber: number
    AccountNumber: number
    FirstName: number
    SecondName: number
    LastName: number
    AccountType: number
    Currency: number
    Status: number
    BranchName: number
    InsertDate: number
    UpdateDate: number
    _all: number
  }


  export type AccountMinAggregateInputType = {
    Id?: true
    CIFNumber?: true
    AccountNumber?: true
    FirstName?: true
    SecondName?: true
    LastName?: true
    AccountType?: true
    Currency?: true
    Status?: true
    BranchName?: true
    InsertDate?: true
    UpdateDate?: true
  }

  export type AccountMaxAggregateInputType = {
    Id?: true
    CIFNumber?: true
    AccountNumber?: true
    FirstName?: true
    SecondName?: true
    LastName?: true
    AccountType?: true
    Currency?: true
    Status?: true
    BranchName?: true
    InsertDate?: true
    UpdateDate?: true
  }

  export type AccountCountAggregateInputType = {
    Id?: true
    CIFNumber?: true
    AccountNumber?: true
    FirstName?: true
    SecondName?: true
    LastName?: true
    AccountType?: true
    Currency?: true
    Status?: true
    BranchName?: true
    InsertDate?: true
    UpdateDate?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    Id: string
    CIFNumber: string
    AccountNumber: string
    FirstName: string
    SecondName: string | null
    LastName: string
    AccountType: string
    Currency: string
    Status: string
    BranchName: string | null
    InsertDate: Date
    UpdateDate: Date
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    CIFNumber?: boolean
    AccountNumber?: boolean
    FirstName?: boolean
    SecondName?: boolean
    LastName?: boolean
    AccountType?: boolean
    Currency?: boolean
    Status?: boolean
    BranchName?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    CIFNumber?: boolean
    AccountNumber?: boolean
    FirstName?: boolean
    SecondName?: boolean
    LastName?: boolean
    AccountType?: boolean
    Currency?: boolean
    Status?: boolean
    BranchName?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    Id?: boolean
    CIFNumber?: boolean
    AccountNumber?: boolean
    FirstName?: boolean
    SecondName?: boolean
    LastName?: boolean
    AccountType?: boolean
    Currency?: boolean
    Status?: boolean
    BranchName?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }


  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id: string
      CIFNumber: string
      AccountNumber: string
      FirstName: string
      SecondName: string | null
      LastName: string
      AccountType: string
      Currency: string
      Status: string
      BranchName: string | null
      InsertDate: Date
      UpdateDate: Date
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `Id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { Id: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `Id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({ 
     *   select: { Id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */ 
  interface AccountFieldRefs {
    readonly Id: FieldRef<"Account", 'String'>
    readonly CIFNumber: FieldRef<"Account", 'String'>
    readonly AccountNumber: FieldRef<"Account", 'String'>
    readonly FirstName: FieldRef<"Account", 'String'>
    readonly SecondName: FieldRef<"Account", 'String'>
    readonly LastName: FieldRef<"Account", 'String'>
    readonly AccountType: FieldRef<"Account", 'String'>
    readonly Currency: FieldRef<"Account", 'String'>
    readonly Status: FieldRef<"Account", 'String'>
    readonly BranchName: FieldRef<"Account", 'String'>
    readonly InsertDate: FieldRef<"Account", 'DateTime'>
    readonly UpdateDate: FieldRef<"Account", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
  }


  /**
   * Model SecurityQuestion
   */

  export type AggregateSecurityQuestion = {
    _count: SecurityQuestionCountAggregateOutputType | null
    _min: SecurityQuestionMinAggregateOutputType | null
    _max: SecurityQuestionMaxAggregateOutputType | null
  }

  export type SecurityQuestionMinAggregateOutputType = {
    Id: string | null
    Question: string | null
  }

  export type SecurityQuestionMaxAggregateOutputType = {
    Id: string | null
    Question: string | null
  }

  export type SecurityQuestionCountAggregateOutputType = {
    Id: number
    Question: number
    _all: number
  }


  export type SecurityQuestionMinAggregateInputType = {
    Id?: true
    Question?: true
  }

  export type SecurityQuestionMaxAggregateInputType = {
    Id?: true
    Question?: true
  }

  export type SecurityQuestionCountAggregateInputType = {
    Id?: true
    Question?: true
    _all?: true
  }

  export type SecurityQuestionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SecurityQuestion to aggregate.
     */
    where?: SecurityQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SecurityQuestions to fetch.
     */
    orderBy?: SecurityQuestionOrderByWithRelationInput | SecurityQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SecurityQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SecurityQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SecurityQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SecurityQuestions
    **/
    _count?: true | SecurityQuestionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SecurityQuestionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SecurityQuestionMaxAggregateInputType
  }

  export type GetSecurityQuestionAggregateType<T extends SecurityQuestionAggregateArgs> = {
        [P in keyof T & keyof AggregateSecurityQuestion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSecurityQuestion[P]>
      : GetScalarType<T[P], AggregateSecurityQuestion[P]>
  }




  export type SecurityQuestionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SecurityQuestionWhereInput
    orderBy?: SecurityQuestionOrderByWithAggregationInput | SecurityQuestionOrderByWithAggregationInput[]
    by: SecurityQuestionScalarFieldEnum[] | SecurityQuestionScalarFieldEnum
    having?: SecurityQuestionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SecurityQuestionCountAggregateInputType | true
    _min?: SecurityQuestionMinAggregateInputType
    _max?: SecurityQuestionMaxAggregateInputType
  }

  export type SecurityQuestionGroupByOutputType = {
    Id: string
    Question: string
    _count: SecurityQuestionCountAggregateOutputType | null
    _min: SecurityQuestionMinAggregateOutputType | null
    _max: SecurityQuestionMaxAggregateOutputType | null
  }

  type GetSecurityQuestionGroupByPayload<T extends SecurityQuestionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SecurityQuestionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SecurityQuestionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SecurityQuestionGroupByOutputType[P]>
            : GetScalarType<T[P], SecurityQuestionGroupByOutputType[P]>
        }
      >
    >


  export type SecurityQuestionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    Question?: boolean
    UserSecurities?: boolean | SecurityQuestion$UserSecuritiesArgs<ExtArgs>
    _count?: boolean | SecurityQuestionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["securityQuestion"]>

  export type SecurityQuestionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    Question?: boolean
  }, ExtArgs["result"]["securityQuestion"]>

  export type SecurityQuestionSelectScalar = {
    Id?: boolean
    Question?: boolean
  }

  export type SecurityQuestionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserSecurities?: boolean | SecurityQuestion$UserSecuritiesArgs<ExtArgs>
    _count?: boolean | SecurityQuestionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SecurityQuestionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SecurityQuestionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SecurityQuestion"
    objects: {
      UserSecurities: Prisma.$UserSecurityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      Id: string
      Question: string
    }, ExtArgs["result"]["securityQuestion"]>
    composites: {}
  }

  type SecurityQuestionGetPayload<S extends boolean | null | undefined | SecurityQuestionDefaultArgs> = $Result.GetResult<Prisma.$SecurityQuestionPayload, S>

  type SecurityQuestionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SecurityQuestionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SecurityQuestionCountAggregateInputType | true
    }

  export interface SecurityQuestionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SecurityQuestion'], meta: { name: 'SecurityQuestion' } }
    /**
     * Find zero or one SecurityQuestion that matches the filter.
     * @param {SecurityQuestionFindUniqueArgs} args - Arguments to find a SecurityQuestion
     * @example
     * // Get one SecurityQuestion
     * const securityQuestion = await prisma.securityQuestion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SecurityQuestionFindUniqueArgs>(args: SelectSubset<T, SecurityQuestionFindUniqueArgs<ExtArgs>>): Prisma__SecurityQuestionClient<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SecurityQuestion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SecurityQuestionFindUniqueOrThrowArgs} args - Arguments to find a SecurityQuestion
     * @example
     * // Get one SecurityQuestion
     * const securityQuestion = await prisma.securityQuestion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SecurityQuestionFindUniqueOrThrowArgs>(args: SelectSubset<T, SecurityQuestionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SecurityQuestionClient<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SecurityQuestion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityQuestionFindFirstArgs} args - Arguments to find a SecurityQuestion
     * @example
     * // Get one SecurityQuestion
     * const securityQuestion = await prisma.securityQuestion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SecurityQuestionFindFirstArgs>(args?: SelectSubset<T, SecurityQuestionFindFirstArgs<ExtArgs>>): Prisma__SecurityQuestionClient<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SecurityQuestion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityQuestionFindFirstOrThrowArgs} args - Arguments to find a SecurityQuestion
     * @example
     * // Get one SecurityQuestion
     * const securityQuestion = await prisma.securityQuestion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SecurityQuestionFindFirstOrThrowArgs>(args?: SelectSubset<T, SecurityQuestionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SecurityQuestionClient<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SecurityQuestions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityQuestionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SecurityQuestions
     * const securityQuestions = await prisma.securityQuestion.findMany()
     * 
     * // Get first 10 SecurityQuestions
     * const securityQuestions = await prisma.securityQuestion.findMany({ take: 10 })
     * 
     * // Only select the `Id`
     * const securityQuestionWithIdOnly = await prisma.securityQuestion.findMany({ select: { Id: true } })
     * 
     */
    findMany<T extends SecurityQuestionFindManyArgs>(args?: SelectSubset<T, SecurityQuestionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SecurityQuestion.
     * @param {SecurityQuestionCreateArgs} args - Arguments to create a SecurityQuestion.
     * @example
     * // Create one SecurityQuestion
     * const SecurityQuestion = await prisma.securityQuestion.create({
     *   data: {
     *     // ... data to create a SecurityQuestion
     *   }
     * })
     * 
     */
    create<T extends SecurityQuestionCreateArgs>(args: SelectSubset<T, SecurityQuestionCreateArgs<ExtArgs>>): Prisma__SecurityQuestionClient<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SecurityQuestions.
     * @param {SecurityQuestionCreateManyArgs} args - Arguments to create many SecurityQuestions.
     * @example
     * // Create many SecurityQuestions
     * const securityQuestion = await prisma.securityQuestion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SecurityQuestionCreateManyArgs>(args?: SelectSubset<T, SecurityQuestionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SecurityQuestions and returns the data saved in the database.
     * @param {SecurityQuestionCreateManyAndReturnArgs} args - Arguments to create many SecurityQuestions.
     * @example
     * // Create many SecurityQuestions
     * const securityQuestion = await prisma.securityQuestion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SecurityQuestions and only return the `Id`
     * const securityQuestionWithIdOnly = await prisma.securityQuestion.createManyAndReturn({ 
     *   select: { Id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SecurityQuestionCreateManyAndReturnArgs>(args?: SelectSubset<T, SecurityQuestionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SecurityQuestion.
     * @param {SecurityQuestionDeleteArgs} args - Arguments to delete one SecurityQuestion.
     * @example
     * // Delete one SecurityQuestion
     * const SecurityQuestion = await prisma.securityQuestion.delete({
     *   where: {
     *     // ... filter to delete one SecurityQuestion
     *   }
     * })
     * 
     */
    delete<T extends SecurityQuestionDeleteArgs>(args: SelectSubset<T, SecurityQuestionDeleteArgs<ExtArgs>>): Prisma__SecurityQuestionClient<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SecurityQuestion.
     * @param {SecurityQuestionUpdateArgs} args - Arguments to update one SecurityQuestion.
     * @example
     * // Update one SecurityQuestion
     * const securityQuestion = await prisma.securityQuestion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SecurityQuestionUpdateArgs>(args: SelectSubset<T, SecurityQuestionUpdateArgs<ExtArgs>>): Prisma__SecurityQuestionClient<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SecurityQuestions.
     * @param {SecurityQuestionDeleteManyArgs} args - Arguments to filter SecurityQuestions to delete.
     * @example
     * // Delete a few SecurityQuestions
     * const { count } = await prisma.securityQuestion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SecurityQuestionDeleteManyArgs>(args?: SelectSubset<T, SecurityQuestionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SecurityQuestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityQuestionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SecurityQuestions
     * const securityQuestion = await prisma.securityQuestion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SecurityQuestionUpdateManyArgs>(args: SelectSubset<T, SecurityQuestionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SecurityQuestion.
     * @param {SecurityQuestionUpsertArgs} args - Arguments to update or create a SecurityQuestion.
     * @example
     * // Update or create a SecurityQuestion
     * const securityQuestion = await prisma.securityQuestion.upsert({
     *   create: {
     *     // ... data to create a SecurityQuestion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SecurityQuestion we want to update
     *   }
     * })
     */
    upsert<T extends SecurityQuestionUpsertArgs>(args: SelectSubset<T, SecurityQuestionUpsertArgs<ExtArgs>>): Prisma__SecurityQuestionClient<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SecurityQuestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityQuestionCountArgs} args - Arguments to filter SecurityQuestions to count.
     * @example
     * // Count the number of SecurityQuestions
     * const count = await prisma.securityQuestion.count({
     *   where: {
     *     // ... the filter for the SecurityQuestions we want to count
     *   }
     * })
    **/
    count<T extends SecurityQuestionCountArgs>(
      args?: Subset<T, SecurityQuestionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SecurityQuestionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SecurityQuestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityQuestionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SecurityQuestionAggregateArgs>(args: Subset<T, SecurityQuestionAggregateArgs>): Prisma.PrismaPromise<GetSecurityQuestionAggregateType<T>>

    /**
     * Group by SecurityQuestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityQuestionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SecurityQuestionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SecurityQuestionGroupByArgs['orderBy'] }
        : { orderBy?: SecurityQuestionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SecurityQuestionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSecurityQuestionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SecurityQuestion model
   */
  readonly fields: SecurityQuestionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SecurityQuestion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SecurityQuestionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    UserSecurities<T extends SecurityQuestion$UserSecuritiesArgs<ExtArgs> = {}>(args?: Subset<T, SecurityQuestion$UserSecuritiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SecurityQuestion model
   */ 
  interface SecurityQuestionFieldRefs {
    readonly Id: FieldRef<"SecurityQuestion", 'String'>
    readonly Question: FieldRef<"SecurityQuestion", 'String'>
  }
    

  // Custom InputTypes
  /**
   * SecurityQuestion findUnique
   */
  export type SecurityQuestionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    /**
     * Filter, which SecurityQuestion to fetch.
     */
    where: SecurityQuestionWhereUniqueInput
  }

  /**
   * SecurityQuestion findUniqueOrThrow
   */
  export type SecurityQuestionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    /**
     * Filter, which SecurityQuestion to fetch.
     */
    where: SecurityQuestionWhereUniqueInput
  }

  /**
   * SecurityQuestion findFirst
   */
  export type SecurityQuestionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    /**
     * Filter, which SecurityQuestion to fetch.
     */
    where?: SecurityQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SecurityQuestions to fetch.
     */
    orderBy?: SecurityQuestionOrderByWithRelationInput | SecurityQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SecurityQuestions.
     */
    cursor?: SecurityQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SecurityQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SecurityQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SecurityQuestions.
     */
    distinct?: SecurityQuestionScalarFieldEnum | SecurityQuestionScalarFieldEnum[]
  }

  /**
   * SecurityQuestion findFirstOrThrow
   */
  export type SecurityQuestionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    /**
     * Filter, which SecurityQuestion to fetch.
     */
    where?: SecurityQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SecurityQuestions to fetch.
     */
    orderBy?: SecurityQuestionOrderByWithRelationInput | SecurityQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SecurityQuestions.
     */
    cursor?: SecurityQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SecurityQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SecurityQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SecurityQuestions.
     */
    distinct?: SecurityQuestionScalarFieldEnum | SecurityQuestionScalarFieldEnum[]
  }

  /**
   * SecurityQuestion findMany
   */
  export type SecurityQuestionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    /**
     * Filter, which SecurityQuestions to fetch.
     */
    where?: SecurityQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SecurityQuestions to fetch.
     */
    orderBy?: SecurityQuestionOrderByWithRelationInput | SecurityQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SecurityQuestions.
     */
    cursor?: SecurityQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SecurityQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SecurityQuestions.
     */
    skip?: number
    distinct?: SecurityQuestionScalarFieldEnum | SecurityQuestionScalarFieldEnum[]
  }

  /**
   * SecurityQuestion create
   */
  export type SecurityQuestionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    /**
     * The data needed to create a SecurityQuestion.
     */
    data: XOR<SecurityQuestionCreateInput, SecurityQuestionUncheckedCreateInput>
  }

  /**
   * SecurityQuestion createMany
   */
  export type SecurityQuestionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SecurityQuestions.
     */
    data: SecurityQuestionCreateManyInput | SecurityQuestionCreateManyInput[]
  }

  /**
   * SecurityQuestion createManyAndReturn
   */
  export type SecurityQuestionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SecurityQuestions.
     */
    data: SecurityQuestionCreateManyInput | SecurityQuestionCreateManyInput[]
  }

  /**
   * SecurityQuestion update
   */
  export type SecurityQuestionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    /**
     * The data needed to update a SecurityQuestion.
     */
    data: XOR<SecurityQuestionUpdateInput, SecurityQuestionUncheckedUpdateInput>
    /**
     * Choose, which SecurityQuestion to update.
     */
    where: SecurityQuestionWhereUniqueInput
  }

  /**
   * SecurityQuestion updateMany
   */
  export type SecurityQuestionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SecurityQuestions.
     */
    data: XOR<SecurityQuestionUpdateManyMutationInput, SecurityQuestionUncheckedUpdateManyInput>
    /**
     * Filter which SecurityQuestions to update
     */
    where?: SecurityQuestionWhereInput
  }

  /**
   * SecurityQuestion upsert
   */
  export type SecurityQuestionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    /**
     * The filter to search for the SecurityQuestion to update in case it exists.
     */
    where: SecurityQuestionWhereUniqueInput
    /**
     * In case the SecurityQuestion found by the `where` argument doesn't exist, create a new SecurityQuestion with this data.
     */
    create: XOR<SecurityQuestionCreateInput, SecurityQuestionUncheckedCreateInput>
    /**
     * In case the SecurityQuestion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SecurityQuestionUpdateInput, SecurityQuestionUncheckedUpdateInput>
  }

  /**
   * SecurityQuestion delete
   */
  export type SecurityQuestionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    /**
     * Filter which SecurityQuestion to delete.
     */
    where: SecurityQuestionWhereUniqueInput
  }

  /**
   * SecurityQuestion deleteMany
   */
  export type SecurityQuestionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SecurityQuestions to delete
     */
    where?: SecurityQuestionWhereInput
  }

  /**
   * SecurityQuestion.UserSecurities
   */
  export type SecurityQuestion$UserSecuritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    where?: UserSecurityWhereInput
    orderBy?: UserSecurityOrderByWithRelationInput | UserSecurityOrderByWithRelationInput[]
    cursor?: UserSecurityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserSecurityScalarFieldEnum | UserSecurityScalarFieldEnum[]
  }

  /**
   * SecurityQuestion without action
   */
  export type SecurityQuestionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
  }


  /**
   * Model UserSecurity
   */

  export type AggregateUserSecurity = {
    _count: UserSecurityCountAggregateOutputType | null
    _min: UserSecurityMinAggregateOutputType | null
    _max: UserSecurityMaxAggregateOutputType | null
  }

  export type UserSecurityMinAggregateOutputType = {
    Id: string | null
    UserId: string | null
    CIFNumber: string | null
    Status: string | null
    PinHash: string | null
    PasswordHash: string | null
    SecurityQuestionId: string | null
    SecurityAnswer: string | null
    InsertDate: Date | null
    UpdateDate: Date | null
  }

  export type UserSecurityMaxAggregateOutputType = {
    Id: string | null
    UserId: string | null
    CIFNumber: string | null
    Status: string | null
    PinHash: string | null
    PasswordHash: string | null
    SecurityQuestionId: string | null
    SecurityAnswer: string | null
    InsertDate: Date | null
    UpdateDate: Date | null
  }

  export type UserSecurityCountAggregateOutputType = {
    Id: number
    UserId: number
    CIFNumber: number
    Status: number
    PinHash: number
    PasswordHash: number
    SecurityQuestionId: number
    SecurityAnswer: number
    InsertDate: number
    UpdateDate: number
    _all: number
  }


  export type UserSecurityMinAggregateInputType = {
    Id?: true
    UserId?: true
    CIFNumber?: true
    Status?: true
    PinHash?: true
    PasswordHash?: true
    SecurityQuestionId?: true
    SecurityAnswer?: true
    InsertDate?: true
    UpdateDate?: true
  }

  export type UserSecurityMaxAggregateInputType = {
    Id?: true
    UserId?: true
    CIFNumber?: true
    Status?: true
    PinHash?: true
    PasswordHash?: true
    SecurityQuestionId?: true
    SecurityAnswer?: true
    InsertDate?: true
    UpdateDate?: true
  }

  export type UserSecurityCountAggregateInputType = {
    Id?: true
    UserId?: true
    CIFNumber?: true
    Status?: true
    PinHash?: true
    PasswordHash?: true
    SecurityQuestionId?: true
    SecurityAnswer?: true
    InsertDate?: true
    UpdateDate?: true
    _all?: true
  }

  export type UserSecurityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSecurity to aggregate.
     */
    where?: UserSecurityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSecurities to fetch.
     */
    orderBy?: UserSecurityOrderByWithRelationInput | UserSecurityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserSecurityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSecurities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSecurities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserSecurities
    **/
    _count?: true | UserSecurityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserSecurityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserSecurityMaxAggregateInputType
  }

  export type GetUserSecurityAggregateType<T extends UserSecurityAggregateArgs> = {
        [P in keyof T & keyof AggregateUserSecurity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserSecurity[P]>
      : GetScalarType<T[P], AggregateUserSecurity[P]>
  }




  export type UserSecurityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSecurityWhereInput
    orderBy?: UserSecurityOrderByWithAggregationInput | UserSecurityOrderByWithAggregationInput[]
    by: UserSecurityScalarFieldEnum[] | UserSecurityScalarFieldEnum
    having?: UserSecurityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserSecurityCountAggregateInputType | true
    _min?: UserSecurityMinAggregateInputType
    _max?: UserSecurityMaxAggregateInputType
  }

  export type UserSecurityGroupByOutputType = {
    Id: string
    UserId: string
    CIFNumber: string
    Status: string
    PinHash: string | null
    PasswordHash: string | null
    SecurityQuestionId: string | null
    SecurityAnswer: string | null
    InsertDate: Date
    UpdateDate: Date
    _count: UserSecurityCountAggregateOutputType | null
    _min: UserSecurityMinAggregateOutputType | null
    _max: UserSecurityMaxAggregateOutputType | null
  }

  type GetUserSecurityGroupByPayload<T extends UserSecurityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserSecurityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserSecurityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserSecurityGroupByOutputType[P]>
            : GetScalarType<T[P], UserSecurityGroupByOutputType[P]>
        }
      >
    >


  export type UserSecuritySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    UserId?: boolean
    CIFNumber?: boolean
    Status?: boolean
    PinHash?: boolean
    PasswordHash?: boolean
    SecurityQuestionId?: boolean
    SecurityAnswer?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
    SecurityQuestion?: boolean | UserSecurity$SecurityQuestionArgs<ExtArgs>
  }, ExtArgs["result"]["userSecurity"]>

  export type UserSecuritySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    UserId?: boolean
    CIFNumber?: boolean
    Status?: boolean
    PinHash?: boolean
    PasswordHash?: boolean
    SecurityQuestionId?: boolean
    SecurityAnswer?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
    SecurityQuestion?: boolean | UserSecurity$SecurityQuestionArgs<ExtArgs>
  }, ExtArgs["result"]["userSecurity"]>

  export type UserSecuritySelectScalar = {
    Id?: boolean
    UserId?: boolean
    CIFNumber?: boolean
    Status?: boolean
    PinHash?: boolean
    PasswordHash?: boolean
    SecurityQuestionId?: boolean
    SecurityAnswer?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }

  export type UserSecurityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    SecurityQuestion?: boolean | UserSecurity$SecurityQuestionArgs<ExtArgs>
  }
  export type UserSecurityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    SecurityQuestion?: boolean | UserSecurity$SecurityQuestionArgs<ExtArgs>
  }

  export type $UserSecurityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserSecurity"
    objects: {
      SecurityQuestion: Prisma.$SecurityQuestionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      Id: string
      UserId: string
      CIFNumber: string
      Status: string
      PinHash: string | null
      PasswordHash: string | null
      SecurityQuestionId: string | null
      SecurityAnswer: string | null
      InsertDate: Date
      UpdateDate: Date
    }, ExtArgs["result"]["userSecurity"]>
    composites: {}
  }

  type UserSecurityGetPayload<S extends boolean | null | undefined | UserSecurityDefaultArgs> = $Result.GetResult<Prisma.$UserSecurityPayload, S>

  type UserSecurityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserSecurityFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserSecurityCountAggregateInputType | true
    }

  export interface UserSecurityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserSecurity'], meta: { name: 'UserSecurity' } }
    /**
     * Find zero or one UserSecurity that matches the filter.
     * @param {UserSecurityFindUniqueArgs} args - Arguments to find a UserSecurity
     * @example
     * // Get one UserSecurity
     * const userSecurity = await prisma.userSecurity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserSecurityFindUniqueArgs>(args: SelectSubset<T, UserSecurityFindUniqueArgs<ExtArgs>>): Prisma__UserSecurityClient<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserSecurity that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserSecurityFindUniqueOrThrowArgs} args - Arguments to find a UserSecurity
     * @example
     * // Get one UserSecurity
     * const userSecurity = await prisma.userSecurity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserSecurityFindUniqueOrThrowArgs>(args: SelectSubset<T, UserSecurityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserSecurityClient<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserSecurity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecurityFindFirstArgs} args - Arguments to find a UserSecurity
     * @example
     * // Get one UserSecurity
     * const userSecurity = await prisma.userSecurity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserSecurityFindFirstArgs>(args?: SelectSubset<T, UserSecurityFindFirstArgs<ExtArgs>>): Prisma__UserSecurityClient<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserSecurity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecurityFindFirstOrThrowArgs} args - Arguments to find a UserSecurity
     * @example
     * // Get one UserSecurity
     * const userSecurity = await prisma.userSecurity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserSecurityFindFirstOrThrowArgs>(args?: SelectSubset<T, UserSecurityFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserSecurityClient<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserSecurities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecurityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserSecurities
     * const userSecurities = await prisma.userSecurity.findMany()
     * 
     * // Get first 10 UserSecurities
     * const userSecurities = await prisma.userSecurity.findMany({ take: 10 })
     * 
     * // Only select the `Id`
     * const userSecurityWithIdOnly = await prisma.userSecurity.findMany({ select: { Id: true } })
     * 
     */
    findMany<T extends UserSecurityFindManyArgs>(args?: SelectSubset<T, UserSecurityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserSecurity.
     * @param {UserSecurityCreateArgs} args - Arguments to create a UserSecurity.
     * @example
     * // Create one UserSecurity
     * const UserSecurity = await prisma.userSecurity.create({
     *   data: {
     *     // ... data to create a UserSecurity
     *   }
     * })
     * 
     */
    create<T extends UserSecurityCreateArgs>(args: SelectSubset<T, UserSecurityCreateArgs<ExtArgs>>): Prisma__UserSecurityClient<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserSecurities.
     * @param {UserSecurityCreateManyArgs} args - Arguments to create many UserSecurities.
     * @example
     * // Create many UserSecurities
     * const userSecurity = await prisma.userSecurity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserSecurityCreateManyArgs>(args?: SelectSubset<T, UserSecurityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserSecurities and returns the data saved in the database.
     * @param {UserSecurityCreateManyAndReturnArgs} args - Arguments to create many UserSecurities.
     * @example
     * // Create many UserSecurities
     * const userSecurity = await prisma.userSecurity.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserSecurities and only return the `Id`
     * const userSecurityWithIdOnly = await prisma.userSecurity.createManyAndReturn({ 
     *   select: { Id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserSecurityCreateManyAndReturnArgs>(args?: SelectSubset<T, UserSecurityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserSecurity.
     * @param {UserSecurityDeleteArgs} args - Arguments to delete one UserSecurity.
     * @example
     * // Delete one UserSecurity
     * const UserSecurity = await prisma.userSecurity.delete({
     *   where: {
     *     // ... filter to delete one UserSecurity
     *   }
     * })
     * 
     */
    delete<T extends UserSecurityDeleteArgs>(args: SelectSubset<T, UserSecurityDeleteArgs<ExtArgs>>): Prisma__UserSecurityClient<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserSecurity.
     * @param {UserSecurityUpdateArgs} args - Arguments to update one UserSecurity.
     * @example
     * // Update one UserSecurity
     * const userSecurity = await prisma.userSecurity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserSecurityUpdateArgs>(args: SelectSubset<T, UserSecurityUpdateArgs<ExtArgs>>): Prisma__UserSecurityClient<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserSecurities.
     * @param {UserSecurityDeleteManyArgs} args - Arguments to filter UserSecurities to delete.
     * @example
     * // Delete a few UserSecurities
     * const { count } = await prisma.userSecurity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserSecurityDeleteManyArgs>(args?: SelectSubset<T, UserSecurityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserSecurities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecurityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserSecurities
     * const userSecurity = await prisma.userSecurity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserSecurityUpdateManyArgs>(args: SelectSubset<T, UserSecurityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserSecurity.
     * @param {UserSecurityUpsertArgs} args - Arguments to update or create a UserSecurity.
     * @example
     * // Update or create a UserSecurity
     * const userSecurity = await prisma.userSecurity.upsert({
     *   create: {
     *     // ... data to create a UserSecurity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserSecurity we want to update
     *   }
     * })
     */
    upsert<T extends UserSecurityUpsertArgs>(args: SelectSubset<T, UserSecurityUpsertArgs<ExtArgs>>): Prisma__UserSecurityClient<$Result.GetResult<Prisma.$UserSecurityPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserSecurities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecurityCountArgs} args - Arguments to filter UserSecurities to count.
     * @example
     * // Count the number of UserSecurities
     * const count = await prisma.userSecurity.count({
     *   where: {
     *     // ... the filter for the UserSecurities we want to count
     *   }
     * })
    **/
    count<T extends UserSecurityCountArgs>(
      args?: Subset<T, UserSecurityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserSecurityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserSecurity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecurityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserSecurityAggregateArgs>(args: Subset<T, UserSecurityAggregateArgs>): Prisma.PrismaPromise<GetUserSecurityAggregateType<T>>

    /**
     * Group by UserSecurity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecurityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserSecurityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserSecurityGroupByArgs['orderBy'] }
        : { orderBy?: UserSecurityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserSecurityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserSecurityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserSecurity model
   */
  readonly fields: UserSecurityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserSecurity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserSecurityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    SecurityQuestion<T extends UserSecurity$SecurityQuestionArgs<ExtArgs> = {}>(args?: Subset<T, UserSecurity$SecurityQuestionArgs<ExtArgs>>): Prisma__SecurityQuestionClient<$Result.GetResult<Prisma.$SecurityQuestionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserSecurity model
   */ 
  interface UserSecurityFieldRefs {
    readonly Id: FieldRef<"UserSecurity", 'String'>
    readonly UserId: FieldRef<"UserSecurity", 'String'>
    readonly CIFNumber: FieldRef<"UserSecurity", 'String'>
    readonly Status: FieldRef<"UserSecurity", 'String'>
    readonly PinHash: FieldRef<"UserSecurity", 'String'>
    readonly PasswordHash: FieldRef<"UserSecurity", 'String'>
    readonly SecurityQuestionId: FieldRef<"UserSecurity", 'String'>
    readonly SecurityAnswer: FieldRef<"UserSecurity", 'String'>
    readonly InsertDate: FieldRef<"UserSecurity", 'DateTime'>
    readonly UpdateDate: FieldRef<"UserSecurity", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserSecurity findUnique
   */
  export type UserSecurityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    /**
     * Filter, which UserSecurity to fetch.
     */
    where: UserSecurityWhereUniqueInput
  }

  /**
   * UserSecurity findUniqueOrThrow
   */
  export type UserSecurityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    /**
     * Filter, which UserSecurity to fetch.
     */
    where: UserSecurityWhereUniqueInput
  }

  /**
   * UserSecurity findFirst
   */
  export type UserSecurityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    /**
     * Filter, which UserSecurity to fetch.
     */
    where?: UserSecurityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSecurities to fetch.
     */
    orderBy?: UserSecurityOrderByWithRelationInput | UserSecurityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSecurities.
     */
    cursor?: UserSecurityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSecurities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSecurities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSecurities.
     */
    distinct?: UserSecurityScalarFieldEnum | UserSecurityScalarFieldEnum[]
  }

  /**
   * UserSecurity findFirstOrThrow
   */
  export type UserSecurityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    /**
     * Filter, which UserSecurity to fetch.
     */
    where?: UserSecurityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSecurities to fetch.
     */
    orderBy?: UserSecurityOrderByWithRelationInput | UserSecurityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSecurities.
     */
    cursor?: UserSecurityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSecurities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSecurities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSecurities.
     */
    distinct?: UserSecurityScalarFieldEnum | UserSecurityScalarFieldEnum[]
  }

  /**
   * UserSecurity findMany
   */
  export type UserSecurityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    /**
     * Filter, which UserSecurities to fetch.
     */
    where?: UserSecurityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSecurities to fetch.
     */
    orderBy?: UserSecurityOrderByWithRelationInput | UserSecurityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserSecurities.
     */
    cursor?: UserSecurityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSecurities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSecurities.
     */
    skip?: number
    distinct?: UserSecurityScalarFieldEnum | UserSecurityScalarFieldEnum[]
  }

  /**
   * UserSecurity create
   */
  export type UserSecurityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    /**
     * The data needed to create a UserSecurity.
     */
    data: XOR<UserSecurityCreateInput, UserSecurityUncheckedCreateInput>
  }

  /**
   * UserSecurity createMany
   */
  export type UserSecurityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserSecurities.
     */
    data: UserSecurityCreateManyInput | UserSecurityCreateManyInput[]
  }

  /**
   * UserSecurity createManyAndReturn
   */
  export type UserSecurityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserSecurities.
     */
    data: UserSecurityCreateManyInput | UserSecurityCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserSecurity update
   */
  export type UserSecurityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    /**
     * The data needed to update a UserSecurity.
     */
    data: XOR<UserSecurityUpdateInput, UserSecurityUncheckedUpdateInput>
    /**
     * Choose, which UserSecurity to update.
     */
    where: UserSecurityWhereUniqueInput
  }

  /**
   * UserSecurity updateMany
   */
  export type UserSecurityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserSecurities.
     */
    data: XOR<UserSecurityUpdateManyMutationInput, UserSecurityUncheckedUpdateManyInput>
    /**
     * Filter which UserSecurities to update
     */
    where?: UserSecurityWhereInput
  }

  /**
   * UserSecurity upsert
   */
  export type UserSecurityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    /**
     * The filter to search for the UserSecurity to update in case it exists.
     */
    where: UserSecurityWhereUniqueInput
    /**
     * In case the UserSecurity found by the `where` argument doesn't exist, create a new UserSecurity with this data.
     */
    create: XOR<UserSecurityCreateInput, UserSecurityUncheckedCreateInput>
    /**
     * In case the UserSecurity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserSecurityUpdateInput, UserSecurityUncheckedUpdateInput>
  }

  /**
   * UserSecurity delete
   */
  export type UserSecurityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
    /**
     * Filter which UserSecurity to delete.
     */
    where: UserSecurityWhereUniqueInput
  }

  /**
   * UserSecurity deleteMany
   */
  export type UserSecurityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSecurities to delete
     */
    where?: UserSecurityWhereInput
  }

  /**
   * UserSecurity.SecurityQuestion
   */
  export type UserSecurity$SecurityQuestionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityQuestion
     */
    select?: SecurityQuestionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityQuestionInclude<ExtArgs> | null
    where?: SecurityQuestionWhereInput
  }

  /**
   * UserSecurity without action
   */
  export type UserSecurityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecurity
     */
    select?: UserSecuritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecurityInclude<ExtArgs> | null
  }


  /**
   * Model Corporate
   */

  export type AggregateCorporate = {
    _count: CorporateCountAggregateOutputType | null
    _min: CorporateMinAggregateOutputType | null
    _max: CorporateMaxAggregateOutputType | null
  }

  export type CorporateMinAggregateOutputType = {
    id: string | null
    name: string | null
    industry: string | null
    status: string | null
    internet_banking_status: string | null
    logo_url: string | null
  }

  export type CorporateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    industry: string | null
    status: string | null
    internet_banking_status: string | null
    logo_url: string | null
  }

  export type CorporateCountAggregateOutputType = {
    id: number
    name: number
    industry: number
    status: number
    internet_banking_status: number
    logo_url: number
    _all: number
  }


  export type CorporateMinAggregateInputType = {
    id?: true
    name?: true
    industry?: true
    status?: true
    internet_banking_status?: true
    logo_url?: true
  }

  export type CorporateMaxAggregateInputType = {
    id?: true
    name?: true
    industry?: true
    status?: true
    internet_banking_status?: true
    logo_url?: true
  }

  export type CorporateCountAggregateInputType = {
    id?: true
    name?: true
    industry?: true
    status?: true
    internet_banking_status?: true
    logo_url?: true
    _all?: true
  }

  export type CorporateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Corporate to aggregate.
     */
    where?: CorporateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Corporates to fetch.
     */
    orderBy?: CorporateOrderByWithRelationInput | CorporateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CorporateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Corporates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Corporates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Corporates
    **/
    _count?: true | CorporateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CorporateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CorporateMaxAggregateInputType
  }

  export type GetCorporateAggregateType<T extends CorporateAggregateArgs> = {
        [P in keyof T & keyof AggregateCorporate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCorporate[P]>
      : GetScalarType<T[P], AggregateCorporate[P]>
  }




  export type CorporateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CorporateWhereInput
    orderBy?: CorporateOrderByWithAggregationInput | CorporateOrderByWithAggregationInput[]
    by: CorporateScalarFieldEnum[] | CorporateScalarFieldEnum
    having?: CorporateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CorporateCountAggregateInputType | true
    _min?: CorporateMinAggregateInputType
    _max?: CorporateMaxAggregateInputType
  }

  export type CorporateGroupByOutputType = {
    id: string
    name: string
    industry: string
    status: string
    internet_banking_status: string
    logo_url: string
    _count: CorporateCountAggregateOutputType | null
    _min: CorporateMinAggregateOutputType | null
    _max: CorporateMaxAggregateOutputType | null
  }

  type GetCorporateGroupByPayload<T extends CorporateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CorporateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CorporateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CorporateGroupByOutputType[P]>
            : GetScalarType<T[P], CorporateGroupByOutputType[P]>
        }
      >
    >


  export type CorporateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    industry?: boolean
    status?: boolean
    internet_banking_status?: boolean
    logo_url?: boolean
  }, ExtArgs["result"]["corporate"]>

  export type CorporateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    industry?: boolean
    status?: boolean
    internet_banking_status?: boolean
    logo_url?: boolean
  }, ExtArgs["result"]["corporate"]>

  export type CorporateSelectScalar = {
    id?: boolean
    name?: boolean
    industry?: boolean
    status?: boolean
    internet_banking_status?: boolean
    logo_url?: boolean
  }


  export type $CorporatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Corporate"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      industry: string
      status: string
      internet_banking_status: string
      logo_url: string
    }, ExtArgs["result"]["corporate"]>
    composites: {}
  }

  type CorporateGetPayload<S extends boolean | null | undefined | CorporateDefaultArgs> = $Result.GetResult<Prisma.$CorporatePayload, S>

  type CorporateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CorporateFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CorporateCountAggregateInputType | true
    }

  export interface CorporateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Corporate'], meta: { name: 'Corporate' } }
    /**
     * Find zero or one Corporate that matches the filter.
     * @param {CorporateFindUniqueArgs} args - Arguments to find a Corporate
     * @example
     * // Get one Corporate
     * const corporate = await prisma.corporate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CorporateFindUniqueArgs>(args: SelectSubset<T, CorporateFindUniqueArgs<ExtArgs>>): Prisma__CorporateClient<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Corporate that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CorporateFindUniqueOrThrowArgs} args - Arguments to find a Corporate
     * @example
     * // Get one Corporate
     * const corporate = await prisma.corporate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CorporateFindUniqueOrThrowArgs>(args: SelectSubset<T, CorporateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CorporateClient<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Corporate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorporateFindFirstArgs} args - Arguments to find a Corporate
     * @example
     * // Get one Corporate
     * const corporate = await prisma.corporate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CorporateFindFirstArgs>(args?: SelectSubset<T, CorporateFindFirstArgs<ExtArgs>>): Prisma__CorporateClient<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Corporate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorporateFindFirstOrThrowArgs} args - Arguments to find a Corporate
     * @example
     * // Get one Corporate
     * const corporate = await prisma.corporate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CorporateFindFirstOrThrowArgs>(args?: SelectSubset<T, CorporateFindFirstOrThrowArgs<ExtArgs>>): Prisma__CorporateClient<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Corporates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorporateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Corporates
     * const corporates = await prisma.corporate.findMany()
     * 
     * // Get first 10 Corporates
     * const corporates = await prisma.corporate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const corporateWithIdOnly = await prisma.corporate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CorporateFindManyArgs>(args?: SelectSubset<T, CorporateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Corporate.
     * @param {CorporateCreateArgs} args - Arguments to create a Corporate.
     * @example
     * // Create one Corporate
     * const Corporate = await prisma.corporate.create({
     *   data: {
     *     // ... data to create a Corporate
     *   }
     * })
     * 
     */
    create<T extends CorporateCreateArgs>(args: SelectSubset<T, CorporateCreateArgs<ExtArgs>>): Prisma__CorporateClient<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Corporates.
     * @param {CorporateCreateManyArgs} args - Arguments to create many Corporates.
     * @example
     * // Create many Corporates
     * const corporate = await prisma.corporate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CorporateCreateManyArgs>(args?: SelectSubset<T, CorporateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Corporates and returns the data saved in the database.
     * @param {CorporateCreateManyAndReturnArgs} args - Arguments to create many Corporates.
     * @example
     * // Create many Corporates
     * const corporate = await prisma.corporate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Corporates and only return the `id`
     * const corporateWithIdOnly = await prisma.corporate.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CorporateCreateManyAndReturnArgs>(args?: SelectSubset<T, CorporateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Corporate.
     * @param {CorporateDeleteArgs} args - Arguments to delete one Corporate.
     * @example
     * // Delete one Corporate
     * const Corporate = await prisma.corporate.delete({
     *   where: {
     *     // ... filter to delete one Corporate
     *   }
     * })
     * 
     */
    delete<T extends CorporateDeleteArgs>(args: SelectSubset<T, CorporateDeleteArgs<ExtArgs>>): Prisma__CorporateClient<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Corporate.
     * @param {CorporateUpdateArgs} args - Arguments to update one Corporate.
     * @example
     * // Update one Corporate
     * const corporate = await prisma.corporate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CorporateUpdateArgs>(args: SelectSubset<T, CorporateUpdateArgs<ExtArgs>>): Prisma__CorporateClient<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Corporates.
     * @param {CorporateDeleteManyArgs} args - Arguments to filter Corporates to delete.
     * @example
     * // Delete a few Corporates
     * const { count } = await prisma.corporate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CorporateDeleteManyArgs>(args?: SelectSubset<T, CorporateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Corporates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorporateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Corporates
     * const corporate = await prisma.corporate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CorporateUpdateManyArgs>(args: SelectSubset<T, CorporateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Corporate.
     * @param {CorporateUpsertArgs} args - Arguments to update or create a Corporate.
     * @example
     * // Update or create a Corporate
     * const corporate = await prisma.corporate.upsert({
     *   create: {
     *     // ... data to create a Corporate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Corporate we want to update
     *   }
     * })
     */
    upsert<T extends CorporateUpsertArgs>(args: SelectSubset<T, CorporateUpsertArgs<ExtArgs>>): Prisma__CorporateClient<$Result.GetResult<Prisma.$CorporatePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Corporates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorporateCountArgs} args - Arguments to filter Corporates to count.
     * @example
     * // Count the number of Corporates
     * const count = await prisma.corporate.count({
     *   where: {
     *     // ... the filter for the Corporates we want to count
     *   }
     * })
    **/
    count<T extends CorporateCountArgs>(
      args?: Subset<T, CorporateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CorporateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Corporate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorporateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CorporateAggregateArgs>(args: Subset<T, CorporateAggregateArgs>): Prisma.PrismaPromise<GetCorporateAggregateType<T>>

    /**
     * Group by Corporate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorporateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CorporateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CorporateGroupByArgs['orderBy'] }
        : { orderBy?: CorporateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CorporateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCorporateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Corporate model
   */
  readonly fields: CorporateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Corporate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CorporateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Corporate model
   */ 
  interface CorporateFieldRefs {
    readonly id: FieldRef<"Corporate", 'String'>
    readonly name: FieldRef<"Corporate", 'String'>
    readonly industry: FieldRef<"Corporate", 'String'>
    readonly status: FieldRef<"Corporate", 'String'>
    readonly internet_banking_status: FieldRef<"Corporate", 'String'>
    readonly logo_url: FieldRef<"Corporate", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Corporate findUnique
   */
  export type CorporateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
    /**
     * Filter, which Corporate to fetch.
     */
    where: CorporateWhereUniqueInput
  }

  /**
   * Corporate findUniqueOrThrow
   */
  export type CorporateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
    /**
     * Filter, which Corporate to fetch.
     */
    where: CorporateWhereUniqueInput
  }

  /**
   * Corporate findFirst
   */
  export type CorporateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
    /**
     * Filter, which Corporate to fetch.
     */
    where?: CorporateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Corporates to fetch.
     */
    orderBy?: CorporateOrderByWithRelationInput | CorporateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Corporates.
     */
    cursor?: CorporateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Corporates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Corporates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Corporates.
     */
    distinct?: CorporateScalarFieldEnum | CorporateScalarFieldEnum[]
  }

  /**
   * Corporate findFirstOrThrow
   */
  export type CorporateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
    /**
     * Filter, which Corporate to fetch.
     */
    where?: CorporateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Corporates to fetch.
     */
    orderBy?: CorporateOrderByWithRelationInput | CorporateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Corporates.
     */
    cursor?: CorporateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Corporates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Corporates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Corporates.
     */
    distinct?: CorporateScalarFieldEnum | CorporateScalarFieldEnum[]
  }

  /**
   * Corporate findMany
   */
  export type CorporateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
    /**
     * Filter, which Corporates to fetch.
     */
    where?: CorporateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Corporates to fetch.
     */
    orderBy?: CorporateOrderByWithRelationInput | CorporateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Corporates.
     */
    cursor?: CorporateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Corporates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Corporates.
     */
    skip?: number
    distinct?: CorporateScalarFieldEnum | CorporateScalarFieldEnum[]
  }

  /**
   * Corporate create
   */
  export type CorporateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
    /**
     * The data needed to create a Corporate.
     */
    data: XOR<CorporateCreateInput, CorporateUncheckedCreateInput>
  }

  /**
   * Corporate createMany
   */
  export type CorporateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Corporates.
     */
    data: CorporateCreateManyInput | CorporateCreateManyInput[]
  }

  /**
   * Corporate createManyAndReturn
   */
  export type CorporateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Corporates.
     */
    data: CorporateCreateManyInput | CorporateCreateManyInput[]
  }

  /**
   * Corporate update
   */
  export type CorporateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
    /**
     * The data needed to update a Corporate.
     */
    data: XOR<CorporateUpdateInput, CorporateUncheckedUpdateInput>
    /**
     * Choose, which Corporate to update.
     */
    where: CorporateWhereUniqueInput
  }

  /**
   * Corporate updateMany
   */
  export type CorporateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Corporates.
     */
    data: XOR<CorporateUpdateManyMutationInput, CorporateUncheckedUpdateManyInput>
    /**
     * Filter which Corporates to update
     */
    where?: CorporateWhereInput
  }

  /**
   * Corporate upsert
   */
  export type CorporateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
    /**
     * The filter to search for the Corporate to update in case it exists.
     */
    where: CorporateWhereUniqueInput
    /**
     * In case the Corporate found by the `where` argument doesn't exist, create a new Corporate with this data.
     */
    create: XOR<CorporateCreateInput, CorporateUncheckedCreateInput>
    /**
     * In case the Corporate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CorporateUpdateInput, CorporateUncheckedUpdateInput>
  }

  /**
   * Corporate delete
   */
  export type CorporateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
    /**
     * Filter which Corporate to delete.
     */
    where: CorporateWhereUniqueInput
  }

  /**
   * Corporate deleteMany
   */
  export type CorporateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Corporates to delete
     */
    where?: CorporateWhereInput
  }

  /**
   * Corporate without action
   */
  export type CorporateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Corporate
     */
    select?: CorporateSelect<ExtArgs> | null
  }


  /**
   * Model MiniApp
   */

  export type AggregateMiniApp = {
    _count: MiniAppCountAggregateOutputType | null
    _min: MiniAppMinAggregateOutputType | null
    _max: MiniAppMaxAggregateOutputType | null
  }

  export type MiniAppMinAggregateOutputType = {
    id: string | null
    name: string | null
    url: string | null
    logo_url: string | null
    username: string | null
    password: string | null
    encryption_key: string | null
  }

  export type MiniAppMaxAggregateOutputType = {
    id: string | null
    name: string | null
    url: string | null
    logo_url: string | null
    username: string | null
    password: string | null
    encryption_key: string | null
  }

  export type MiniAppCountAggregateOutputType = {
    id: number
    name: number
    url: number
    logo_url: number
    username: number
    password: number
    encryption_key: number
    _all: number
  }


  export type MiniAppMinAggregateInputType = {
    id?: true
    name?: true
    url?: true
    logo_url?: true
    username?: true
    password?: true
    encryption_key?: true
  }

  export type MiniAppMaxAggregateInputType = {
    id?: true
    name?: true
    url?: true
    logo_url?: true
    username?: true
    password?: true
    encryption_key?: true
  }

  export type MiniAppCountAggregateInputType = {
    id?: true
    name?: true
    url?: true
    logo_url?: true
    username?: true
    password?: true
    encryption_key?: true
    _all?: true
  }

  export type MiniAppAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MiniApp to aggregate.
     */
    where?: MiniAppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MiniApps to fetch.
     */
    orderBy?: MiniAppOrderByWithRelationInput | MiniAppOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MiniAppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MiniApps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MiniApps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MiniApps
    **/
    _count?: true | MiniAppCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MiniAppMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MiniAppMaxAggregateInputType
  }

  export type GetMiniAppAggregateType<T extends MiniAppAggregateArgs> = {
        [P in keyof T & keyof AggregateMiniApp]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMiniApp[P]>
      : GetScalarType<T[P], AggregateMiniApp[P]>
  }




  export type MiniAppGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MiniAppWhereInput
    orderBy?: MiniAppOrderByWithAggregationInput | MiniAppOrderByWithAggregationInput[]
    by: MiniAppScalarFieldEnum[] | MiniAppScalarFieldEnum
    having?: MiniAppScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MiniAppCountAggregateInputType | true
    _min?: MiniAppMinAggregateInputType
    _max?: MiniAppMaxAggregateInputType
  }

  export type MiniAppGroupByOutputType = {
    id: string
    name: string
    url: string
    logo_url: string
    username: string
    password: string
    encryption_key: string
    _count: MiniAppCountAggregateOutputType | null
    _min: MiniAppMinAggregateOutputType | null
    _max: MiniAppMaxAggregateOutputType | null
  }

  type GetMiniAppGroupByPayload<T extends MiniAppGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MiniAppGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MiniAppGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MiniAppGroupByOutputType[P]>
            : GetScalarType<T[P], MiniAppGroupByOutputType[P]>
        }
      >
    >


  export type MiniAppSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    url?: boolean
    logo_url?: boolean
    username?: boolean
    password?: boolean
    encryption_key?: boolean
  }, ExtArgs["result"]["miniApp"]>

  export type MiniAppSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    url?: boolean
    logo_url?: boolean
    username?: boolean
    password?: boolean
    encryption_key?: boolean
  }, ExtArgs["result"]["miniApp"]>

  export type MiniAppSelectScalar = {
    id?: boolean
    name?: boolean
    url?: boolean
    logo_url?: boolean
    username?: boolean
    password?: boolean
    encryption_key?: boolean
  }


  export type $MiniAppPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MiniApp"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      url: string
      logo_url: string
      username: string
      password: string
      encryption_key: string
    }, ExtArgs["result"]["miniApp"]>
    composites: {}
  }

  type MiniAppGetPayload<S extends boolean | null | undefined | MiniAppDefaultArgs> = $Result.GetResult<Prisma.$MiniAppPayload, S>

  type MiniAppCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MiniAppFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MiniAppCountAggregateInputType | true
    }

  export interface MiniAppDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MiniApp'], meta: { name: 'MiniApp' } }
    /**
     * Find zero or one MiniApp that matches the filter.
     * @param {MiniAppFindUniqueArgs} args - Arguments to find a MiniApp
     * @example
     * // Get one MiniApp
     * const miniApp = await prisma.miniApp.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MiniAppFindUniqueArgs>(args: SelectSubset<T, MiniAppFindUniqueArgs<ExtArgs>>): Prisma__MiniAppClient<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MiniApp that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MiniAppFindUniqueOrThrowArgs} args - Arguments to find a MiniApp
     * @example
     * // Get one MiniApp
     * const miniApp = await prisma.miniApp.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MiniAppFindUniqueOrThrowArgs>(args: SelectSubset<T, MiniAppFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MiniAppClient<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MiniApp that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MiniAppFindFirstArgs} args - Arguments to find a MiniApp
     * @example
     * // Get one MiniApp
     * const miniApp = await prisma.miniApp.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MiniAppFindFirstArgs>(args?: SelectSubset<T, MiniAppFindFirstArgs<ExtArgs>>): Prisma__MiniAppClient<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MiniApp that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MiniAppFindFirstOrThrowArgs} args - Arguments to find a MiniApp
     * @example
     * // Get one MiniApp
     * const miniApp = await prisma.miniApp.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MiniAppFindFirstOrThrowArgs>(args?: SelectSubset<T, MiniAppFindFirstOrThrowArgs<ExtArgs>>): Prisma__MiniAppClient<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MiniApps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MiniAppFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MiniApps
     * const miniApps = await prisma.miniApp.findMany()
     * 
     * // Get first 10 MiniApps
     * const miniApps = await prisma.miniApp.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const miniAppWithIdOnly = await prisma.miniApp.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MiniAppFindManyArgs>(args?: SelectSubset<T, MiniAppFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MiniApp.
     * @param {MiniAppCreateArgs} args - Arguments to create a MiniApp.
     * @example
     * // Create one MiniApp
     * const MiniApp = await prisma.miniApp.create({
     *   data: {
     *     // ... data to create a MiniApp
     *   }
     * })
     * 
     */
    create<T extends MiniAppCreateArgs>(args: SelectSubset<T, MiniAppCreateArgs<ExtArgs>>): Prisma__MiniAppClient<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MiniApps.
     * @param {MiniAppCreateManyArgs} args - Arguments to create many MiniApps.
     * @example
     * // Create many MiniApps
     * const miniApp = await prisma.miniApp.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MiniAppCreateManyArgs>(args?: SelectSubset<T, MiniAppCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MiniApps and returns the data saved in the database.
     * @param {MiniAppCreateManyAndReturnArgs} args - Arguments to create many MiniApps.
     * @example
     * // Create many MiniApps
     * const miniApp = await prisma.miniApp.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MiniApps and only return the `id`
     * const miniAppWithIdOnly = await prisma.miniApp.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MiniAppCreateManyAndReturnArgs>(args?: SelectSubset<T, MiniAppCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MiniApp.
     * @param {MiniAppDeleteArgs} args - Arguments to delete one MiniApp.
     * @example
     * // Delete one MiniApp
     * const MiniApp = await prisma.miniApp.delete({
     *   where: {
     *     // ... filter to delete one MiniApp
     *   }
     * })
     * 
     */
    delete<T extends MiniAppDeleteArgs>(args: SelectSubset<T, MiniAppDeleteArgs<ExtArgs>>): Prisma__MiniAppClient<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MiniApp.
     * @param {MiniAppUpdateArgs} args - Arguments to update one MiniApp.
     * @example
     * // Update one MiniApp
     * const miniApp = await prisma.miniApp.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MiniAppUpdateArgs>(args: SelectSubset<T, MiniAppUpdateArgs<ExtArgs>>): Prisma__MiniAppClient<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MiniApps.
     * @param {MiniAppDeleteManyArgs} args - Arguments to filter MiniApps to delete.
     * @example
     * // Delete a few MiniApps
     * const { count } = await prisma.miniApp.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MiniAppDeleteManyArgs>(args?: SelectSubset<T, MiniAppDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MiniApps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MiniAppUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MiniApps
     * const miniApp = await prisma.miniApp.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MiniAppUpdateManyArgs>(args: SelectSubset<T, MiniAppUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MiniApp.
     * @param {MiniAppUpsertArgs} args - Arguments to update or create a MiniApp.
     * @example
     * // Update or create a MiniApp
     * const miniApp = await prisma.miniApp.upsert({
     *   create: {
     *     // ... data to create a MiniApp
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MiniApp we want to update
     *   }
     * })
     */
    upsert<T extends MiniAppUpsertArgs>(args: SelectSubset<T, MiniAppUpsertArgs<ExtArgs>>): Prisma__MiniAppClient<$Result.GetResult<Prisma.$MiniAppPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MiniApps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MiniAppCountArgs} args - Arguments to filter MiniApps to count.
     * @example
     * // Count the number of MiniApps
     * const count = await prisma.miniApp.count({
     *   where: {
     *     // ... the filter for the MiniApps we want to count
     *   }
     * })
    **/
    count<T extends MiniAppCountArgs>(
      args?: Subset<T, MiniAppCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MiniAppCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MiniApp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MiniAppAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MiniAppAggregateArgs>(args: Subset<T, MiniAppAggregateArgs>): Prisma.PrismaPromise<GetMiniAppAggregateType<T>>

    /**
     * Group by MiniApp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MiniAppGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MiniAppGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MiniAppGroupByArgs['orderBy'] }
        : { orderBy?: MiniAppGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MiniAppGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMiniAppGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MiniApp model
   */
  readonly fields: MiniAppFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MiniApp.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MiniAppClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MiniApp model
   */ 
  interface MiniAppFieldRefs {
    readonly id: FieldRef<"MiniApp", 'String'>
    readonly name: FieldRef<"MiniApp", 'String'>
    readonly url: FieldRef<"MiniApp", 'String'>
    readonly logo_url: FieldRef<"MiniApp", 'String'>
    readonly username: FieldRef<"MiniApp", 'String'>
    readonly password: FieldRef<"MiniApp", 'String'>
    readonly encryption_key: FieldRef<"MiniApp", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MiniApp findUnique
   */
  export type MiniAppFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
    /**
     * Filter, which MiniApp to fetch.
     */
    where: MiniAppWhereUniqueInput
  }

  /**
   * MiniApp findUniqueOrThrow
   */
  export type MiniAppFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
    /**
     * Filter, which MiniApp to fetch.
     */
    where: MiniAppWhereUniqueInput
  }

  /**
   * MiniApp findFirst
   */
  export type MiniAppFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
    /**
     * Filter, which MiniApp to fetch.
     */
    where?: MiniAppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MiniApps to fetch.
     */
    orderBy?: MiniAppOrderByWithRelationInput | MiniAppOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MiniApps.
     */
    cursor?: MiniAppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MiniApps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MiniApps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MiniApps.
     */
    distinct?: MiniAppScalarFieldEnum | MiniAppScalarFieldEnum[]
  }

  /**
   * MiniApp findFirstOrThrow
   */
  export type MiniAppFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
    /**
     * Filter, which MiniApp to fetch.
     */
    where?: MiniAppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MiniApps to fetch.
     */
    orderBy?: MiniAppOrderByWithRelationInput | MiniAppOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MiniApps.
     */
    cursor?: MiniAppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MiniApps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MiniApps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MiniApps.
     */
    distinct?: MiniAppScalarFieldEnum | MiniAppScalarFieldEnum[]
  }

  /**
   * MiniApp findMany
   */
  export type MiniAppFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
    /**
     * Filter, which MiniApps to fetch.
     */
    where?: MiniAppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MiniApps to fetch.
     */
    orderBy?: MiniAppOrderByWithRelationInput | MiniAppOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MiniApps.
     */
    cursor?: MiniAppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MiniApps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MiniApps.
     */
    skip?: number
    distinct?: MiniAppScalarFieldEnum | MiniAppScalarFieldEnum[]
  }

  /**
   * MiniApp create
   */
  export type MiniAppCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
    /**
     * The data needed to create a MiniApp.
     */
    data: XOR<MiniAppCreateInput, MiniAppUncheckedCreateInput>
  }

  /**
   * MiniApp createMany
   */
  export type MiniAppCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MiniApps.
     */
    data: MiniAppCreateManyInput | MiniAppCreateManyInput[]
  }

  /**
   * MiniApp createManyAndReturn
   */
  export type MiniAppCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MiniApps.
     */
    data: MiniAppCreateManyInput | MiniAppCreateManyInput[]
  }

  /**
   * MiniApp update
   */
  export type MiniAppUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
    /**
     * The data needed to update a MiniApp.
     */
    data: XOR<MiniAppUpdateInput, MiniAppUncheckedUpdateInput>
    /**
     * Choose, which MiniApp to update.
     */
    where: MiniAppWhereUniqueInput
  }

  /**
   * MiniApp updateMany
   */
  export type MiniAppUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MiniApps.
     */
    data: XOR<MiniAppUpdateManyMutationInput, MiniAppUncheckedUpdateManyInput>
    /**
     * Filter which MiniApps to update
     */
    where?: MiniAppWhereInput
  }

  /**
   * MiniApp upsert
   */
  export type MiniAppUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
    /**
     * The filter to search for the MiniApp to update in case it exists.
     */
    where: MiniAppWhereUniqueInput
    /**
     * In case the MiniApp found by the `where` argument doesn't exist, create a new MiniApp with this data.
     */
    create: XOR<MiniAppCreateInput, MiniAppUncheckedCreateInput>
    /**
     * In case the MiniApp was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MiniAppUpdateInput, MiniAppUncheckedUpdateInput>
  }

  /**
   * MiniApp delete
   */
  export type MiniAppDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
    /**
     * Filter which MiniApp to delete.
     */
    where: MiniAppWhereUniqueInput
  }

  /**
   * MiniApp deleteMany
   */
  export type MiniAppDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MiniApps to delete
     */
    where?: MiniAppWhereInput
  }

  /**
   * MiniApp without action
   */
  export type MiniAppDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MiniApp
     */
    select?: MiniAppSelect<ExtArgs> | null
  }


  /**
   * Model OtpCode
   */

  export type AggregateOtpCode = {
    _count: OtpCodeCountAggregateOutputType | null
    _avg: OtpCodeAvgAggregateOutputType | null
    _sum: OtpCodeSumAggregateOutputType | null
    _min: OtpCodeMinAggregateOutputType | null
    _max: OtpCodeMaxAggregateOutputType | null
  }

  export type OtpCodeAvgAggregateOutputType = {
    Id: number | null
    Attempts: number | null
  }

  export type OtpCodeSumAggregateOutputType = {
    Id: number | null
    Attempts: number | null
  }

  export type OtpCodeMinAggregateOutputType = {
    Id: number | null
    Purpose: string | null
    UserId: string | null
    OtpType: string | null
    Code: string | null
    IsUsed: boolean | null
    ExpiresAt: Date | null
    Attempts: number | null
    InsertDate: Date | null
    UpdateDate: Date | null
  }

  export type OtpCodeMaxAggregateOutputType = {
    Id: number | null
    Purpose: string | null
    UserId: string | null
    OtpType: string | null
    Code: string | null
    IsUsed: boolean | null
    ExpiresAt: Date | null
    Attempts: number | null
    InsertDate: Date | null
    UpdateDate: Date | null
  }

  export type OtpCodeCountAggregateOutputType = {
    Id: number
    Purpose: number
    UserId: number
    OtpType: number
    Code: number
    IsUsed: number
    ExpiresAt: number
    Attempts: number
    InsertDate: number
    UpdateDate: number
    _all: number
  }


  export type OtpCodeAvgAggregateInputType = {
    Id?: true
    Attempts?: true
  }

  export type OtpCodeSumAggregateInputType = {
    Id?: true
    Attempts?: true
  }

  export type OtpCodeMinAggregateInputType = {
    Id?: true
    Purpose?: true
    UserId?: true
    OtpType?: true
    Code?: true
    IsUsed?: true
    ExpiresAt?: true
    Attempts?: true
    InsertDate?: true
    UpdateDate?: true
  }

  export type OtpCodeMaxAggregateInputType = {
    Id?: true
    Purpose?: true
    UserId?: true
    OtpType?: true
    Code?: true
    IsUsed?: true
    ExpiresAt?: true
    Attempts?: true
    InsertDate?: true
    UpdateDate?: true
  }

  export type OtpCodeCountAggregateInputType = {
    Id?: true
    Purpose?: true
    UserId?: true
    OtpType?: true
    Code?: true
    IsUsed?: true
    ExpiresAt?: true
    Attempts?: true
    InsertDate?: true
    UpdateDate?: true
    _all?: true
  }

  export type OtpCodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OtpCode to aggregate.
     */
    where?: OtpCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OtpCodes to fetch.
     */
    orderBy?: OtpCodeOrderByWithRelationInput | OtpCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OtpCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OtpCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OtpCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OtpCodes
    **/
    _count?: true | OtpCodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OtpCodeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OtpCodeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OtpCodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OtpCodeMaxAggregateInputType
  }

  export type GetOtpCodeAggregateType<T extends OtpCodeAggregateArgs> = {
        [P in keyof T & keyof AggregateOtpCode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOtpCode[P]>
      : GetScalarType<T[P], AggregateOtpCode[P]>
  }




  export type OtpCodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OtpCodeWhereInput
    orderBy?: OtpCodeOrderByWithAggregationInput | OtpCodeOrderByWithAggregationInput[]
    by: OtpCodeScalarFieldEnum[] | OtpCodeScalarFieldEnum
    having?: OtpCodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OtpCodeCountAggregateInputType | true
    _avg?: OtpCodeAvgAggregateInputType
    _sum?: OtpCodeSumAggregateInputType
    _min?: OtpCodeMinAggregateInputType
    _max?: OtpCodeMaxAggregateInputType
  }

  export type OtpCodeGroupByOutputType = {
    Id: number
    Purpose: string
    UserId: string
    OtpType: string
    Code: string | null
    IsUsed: boolean
    ExpiresAt: Date
    Attempts: number
    InsertDate: Date
    UpdateDate: Date
    _count: OtpCodeCountAggregateOutputType | null
    _avg: OtpCodeAvgAggregateOutputType | null
    _sum: OtpCodeSumAggregateOutputType | null
    _min: OtpCodeMinAggregateOutputType | null
    _max: OtpCodeMaxAggregateOutputType | null
  }

  type GetOtpCodeGroupByPayload<T extends OtpCodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OtpCodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OtpCodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OtpCodeGroupByOutputType[P]>
            : GetScalarType<T[P], OtpCodeGroupByOutputType[P]>
        }
      >
    >


  export type OtpCodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    Purpose?: boolean
    UserId?: boolean
    OtpType?: boolean
    Code?: boolean
    IsUsed?: boolean
    ExpiresAt?: boolean
    Attempts?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }, ExtArgs["result"]["otpCode"]>

  export type OtpCodeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id?: boolean
    Purpose?: boolean
    UserId?: boolean
    OtpType?: boolean
    Code?: boolean
    IsUsed?: boolean
    ExpiresAt?: boolean
    Attempts?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }, ExtArgs["result"]["otpCode"]>

  export type OtpCodeSelectScalar = {
    Id?: boolean
    Purpose?: boolean
    UserId?: boolean
    OtpType?: boolean
    Code?: boolean
    IsUsed?: boolean
    ExpiresAt?: boolean
    Attempts?: boolean
    InsertDate?: boolean
    UpdateDate?: boolean
  }


  export type $OtpCodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OtpCode"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id: number
      Purpose: string
      UserId: string
      OtpType: string
      Code: string | null
      IsUsed: boolean
      ExpiresAt: Date
      Attempts: number
      InsertDate: Date
      UpdateDate: Date
    }, ExtArgs["result"]["otpCode"]>
    composites: {}
  }

  type OtpCodeGetPayload<S extends boolean | null | undefined | OtpCodeDefaultArgs> = $Result.GetResult<Prisma.$OtpCodePayload, S>

  type OtpCodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OtpCodeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OtpCodeCountAggregateInputType | true
    }

  export interface OtpCodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OtpCode'], meta: { name: 'OtpCode' } }
    /**
     * Find zero or one OtpCode that matches the filter.
     * @param {OtpCodeFindUniqueArgs} args - Arguments to find a OtpCode
     * @example
     * // Get one OtpCode
     * const otpCode = await prisma.otpCode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OtpCodeFindUniqueArgs>(args: SelectSubset<T, OtpCodeFindUniqueArgs<ExtArgs>>): Prisma__OtpCodeClient<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OtpCode that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OtpCodeFindUniqueOrThrowArgs} args - Arguments to find a OtpCode
     * @example
     * // Get one OtpCode
     * const otpCode = await prisma.otpCode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OtpCodeFindUniqueOrThrowArgs>(args: SelectSubset<T, OtpCodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OtpCodeClient<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OtpCode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpCodeFindFirstArgs} args - Arguments to find a OtpCode
     * @example
     * // Get one OtpCode
     * const otpCode = await prisma.otpCode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OtpCodeFindFirstArgs>(args?: SelectSubset<T, OtpCodeFindFirstArgs<ExtArgs>>): Prisma__OtpCodeClient<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OtpCode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpCodeFindFirstOrThrowArgs} args - Arguments to find a OtpCode
     * @example
     * // Get one OtpCode
     * const otpCode = await prisma.otpCode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OtpCodeFindFirstOrThrowArgs>(args?: SelectSubset<T, OtpCodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__OtpCodeClient<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OtpCodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpCodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OtpCodes
     * const otpCodes = await prisma.otpCode.findMany()
     * 
     * // Get first 10 OtpCodes
     * const otpCodes = await prisma.otpCode.findMany({ take: 10 })
     * 
     * // Only select the `Id`
     * const otpCodeWithIdOnly = await prisma.otpCode.findMany({ select: { Id: true } })
     * 
     */
    findMany<T extends OtpCodeFindManyArgs>(args?: SelectSubset<T, OtpCodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OtpCode.
     * @param {OtpCodeCreateArgs} args - Arguments to create a OtpCode.
     * @example
     * // Create one OtpCode
     * const OtpCode = await prisma.otpCode.create({
     *   data: {
     *     // ... data to create a OtpCode
     *   }
     * })
     * 
     */
    create<T extends OtpCodeCreateArgs>(args: SelectSubset<T, OtpCodeCreateArgs<ExtArgs>>): Prisma__OtpCodeClient<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OtpCodes.
     * @param {OtpCodeCreateManyArgs} args - Arguments to create many OtpCodes.
     * @example
     * // Create many OtpCodes
     * const otpCode = await prisma.otpCode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OtpCodeCreateManyArgs>(args?: SelectSubset<T, OtpCodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OtpCodes and returns the data saved in the database.
     * @param {OtpCodeCreateManyAndReturnArgs} args - Arguments to create many OtpCodes.
     * @example
     * // Create many OtpCodes
     * const otpCode = await prisma.otpCode.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OtpCodes and only return the `Id`
     * const otpCodeWithIdOnly = await prisma.otpCode.createManyAndReturn({ 
     *   select: { Id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OtpCodeCreateManyAndReturnArgs>(args?: SelectSubset<T, OtpCodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OtpCode.
     * @param {OtpCodeDeleteArgs} args - Arguments to delete one OtpCode.
     * @example
     * // Delete one OtpCode
     * const OtpCode = await prisma.otpCode.delete({
     *   where: {
     *     // ... filter to delete one OtpCode
     *   }
     * })
     * 
     */
    delete<T extends OtpCodeDeleteArgs>(args: SelectSubset<T, OtpCodeDeleteArgs<ExtArgs>>): Prisma__OtpCodeClient<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OtpCode.
     * @param {OtpCodeUpdateArgs} args - Arguments to update one OtpCode.
     * @example
     * // Update one OtpCode
     * const otpCode = await prisma.otpCode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OtpCodeUpdateArgs>(args: SelectSubset<T, OtpCodeUpdateArgs<ExtArgs>>): Prisma__OtpCodeClient<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OtpCodes.
     * @param {OtpCodeDeleteManyArgs} args - Arguments to filter OtpCodes to delete.
     * @example
     * // Delete a few OtpCodes
     * const { count } = await prisma.otpCode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OtpCodeDeleteManyArgs>(args?: SelectSubset<T, OtpCodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OtpCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpCodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OtpCodes
     * const otpCode = await prisma.otpCode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OtpCodeUpdateManyArgs>(args: SelectSubset<T, OtpCodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OtpCode.
     * @param {OtpCodeUpsertArgs} args - Arguments to update or create a OtpCode.
     * @example
     * // Update or create a OtpCode
     * const otpCode = await prisma.otpCode.upsert({
     *   create: {
     *     // ... data to create a OtpCode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OtpCode we want to update
     *   }
     * })
     */
    upsert<T extends OtpCodeUpsertArgs>(args: SelectSubset<T, OtpCodeUpsertArgs<ExtArgs>>): Prisma__OtpCodeClient<$Result.GetResult<Prisma.$OtpCodePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OtpCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpCodeCountArgs} args - Arguments to filter OtpCodes to count.
     * @example
     * // Count the number of OtpCodes
     * const count = await prisma.otpCode.count({
     *   where: {
     *     // ... the filter for the OtpCodes we want to count
     *   }
     * })
    **/
    count<T extends OtpCodeCountArgs>(
      args?: Subset<T, OtpCodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OtpCodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OtpCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpCodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OtpCodeAggregateArgs>(args: Subset<T, OtpCodeAggregateArgs>): Prisma.PrismaPromise<GetOtpCodeAggregateType<T>>

    /**
     * Group by OtpCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpCodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OtpCodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OtpCodeGroupByArgs['orderBy'] }
        : { orderBy?: OtpCodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OtpCodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOtpCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OtpCode model
   */
  readonly fields: OtpCodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OtpCode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OtpCodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OtpCode model
   */ 
  interface OtpCodeFieldRefs {
    readonly Id: FieldRef<"OtpCode", 'Int'>
    readonly Purpose: FieldRef<"OtpCode", 'String'>
    readonly UserId: FieldRef<"OtpCode", 'String'>
    readonly OtpType: FieldRef<"OtpCode", 'String'>
    readonly Code: FieldRef<"OtpCode", 'String'>
    readonly IsUsed: FieldRef<"OtpCode", 'Boolean'>
    readonly ExpiresAt: FieldRef<"OtpCode", 'DateTime'>
    readonly Attempts: FieldRef<"OtpCode", 'Int'>
    readonly InsertDate: FieldRef<"OtpCode", 'DateTime'>
    readonly UpdateDate: FieldRef<"OtpCode", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OtpCode findUnique
   */
  export type OtpCodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
    /**
     * Filter, which OtpCode to fetch.
     */
    where: OtpCodeWhereUniqueInput
  }

  /**
   * OtpCode findUniqueOrThrow
   */
  export type OtpCodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
    /**
     * Filter, which OtpCode to fetch.
     */
    where: OtpCodeWhereUniqueInput
  }

  /**
   * OtpCode findFirst
   */
  export type OtpCodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
    /**
     * Filter, which OtpCode to fetch.
     */
    where?: OtpCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OtpCodes to fetch.
     */
    orderBy?: OtpCodeOrderByWithRelationInput | OtpCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OtpCodes.
     */
    cursor?: OtpCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OtpCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OtpCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OtpCodes.
     */
    distinct?: OtpCodeScalarFieldEnum | OtpCodeScalarFieldEnum[]
  }

  /**
   * OtpCode findFirstOrThrow
   */
  export type OtpCodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
    /**
     * Filter, which OtpCode to fetch.
     */
    where?: OtpCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OtpCodes to fetch.
     */
    orderBy?: OtpCodeOrderByWithRelationInput | OtpCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OtpCodes.
     */
    cursor?: OtpCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OtpCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OtpCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OtpCodes.
     */
    distinct?: OtpCodeScalarFieldEnum | OtpCodeScalarFieldEnum[]
  }

  /**
   * OtpCode findMany
   */
  export type OtpCodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
    /**
     * Filter, which OtpCodes to fetch.
     */
    where?: OtpCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OtpCodes to fetch.
     */
    orderBy?: OtpCodeOrderByWithRelationInput | OtpCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OtpCodes.
     */
    cursor?: OtpCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OtpCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OtpCodes.
     */
    skip?: number
    distinct?: OtpCodeScalarFieldEnum | OtpCodeScalarFieldEnum[]
  }

  /**
   * OtpCode create
   */
  export type OtpCodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
    /**
     * The data needed to create a OtpCode.
     */
    data: XOR<OtpCodeCreateInput, OtpCodeUncheckedCreateInput>
  }

  /**
   * OtpCode createMany
   */
  export type OtpCodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OtpCodes.
     */
    data: OtpCodeCreateManyInput | OtpCodeCreateManyInput[]
  }

  /**
   * OtpCode createManyAndReturn
   */
  export type OtpCodeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OtpCodes.
     */
    data: OtpCodeCreateManyInput | OtpCodeCreateManyInput[]
  }

  /**
   * OtpCode update
   */
  export type OtpCodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
    /**
     * The data needed to update a OtpCode.
     */
    data: XOR<OtpCodeUpdateInput, OtpCodeUncheckedUpdateInput>
    /**
     * Choose, which OtpCode to update.
     */
    where: OtpCodeWhereUniqueInput
  }

  /**
   * OtpCode updateMany
   */
  export type OtpCodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OtpCodes.
     */
    data: XOR<OtpCodeUpdateManyMutationInput, OtpCodeUncheckedUpdateManyInput>
    /**
     * Filter which OtpCodes to update
     */
    where?: OtpCodeWhereInput
  }

  /**
   * OtpCode upsert
   */
  export type OtpCodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
    /**
     * The filter to search for the OtpCode to update in case it exists.
     */
    where: OtpCodeWhereUniqueInput
    /**
     * In case the OtpCode found by the `where` argument doesn't exist, create a new OtpCode with this data.
     */
    create: XOR<OtpCodeCreateInput, OtpCodeUncheckedCreateInput>
    /**
     * In case the OtpCode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OtpCodeUpdateInput, OtpCodeUncheckedUpdateInput>
  }

  /**
   * OtpCode delete
   */
  export type OtpCodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
    /**
     * Filter which OtpCode to delete.
     */
    where: OtpCodeWhereUniqueInput
  }

  /**
   * OtpCode deleteMany
   */
  export type OtpCodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OtpCodes to delete
     */
    where?: OtpCodeWhereInput
  }

  /**
   * OtpCode without action
   */
  export type OtpCodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtpCode
     */
    select?: OtpCodeSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
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

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const RoleScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description'
  };

  export type RoleScalarFieldEnum = (typeof RoleScalarFieldEnum)[keyof typeof RoleScalarFieldEnum]


  export const BranchScalarFieldEnum: {
    id: 'id',
    name: 'name',
    location: 'location',
    createdAt: 'createdAt'
  };

  export type BranchScalarFieldEnum = (typeof BranchScalarFieldEnum)[keyof typeof BranchScalarFieldEnum]


  export const DepartmentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    branchId: 'branchId',
    createdAt: 'createdAt'
  };

  export type DepartmentScalarFieldEnum = (typeof DepartmentScalarFieldEnum)[keyof typeof DepartmentScalarFieldEnum]


  export const CustomerScalarFieldEnum: {
    id: 'id',
    name: 'name',
    phone: 'phone',
    status: 'status',
    registeredAt: 'registeredAt'
  };

  export type CustomerScalarFieldEnum = (typeof CustomerScalarFieldEnum)[keyof typeof CustomerScalarFieldEnum]


  export const PendingApprovalScalarFieldEnum: {
    id: 'id',
    customerId: 'customerId',
    type: 'type',
    requestedAt: 'requestedAt',
    customerName: 'customerName',
    customerPhone: 'customerPhone',
    details: 'details',
    status: 'status'
  };

  export type PendingApprovalScalarFieldEnum = (typeof PendingApprovalScalarFieldEnum)[keyof typeof PendingApprovalScalarFieldEnum]


  export const TransactionScalarFieldEnum: {
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

  export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum]


  export const AppUserScalarFieldEnum: {
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

  export type AppUserScalarFieldEnum = (typeof AppUserScalarFieldEnum)[keyof typeof AppUserScalarFieldEnum]


  export const AccountScalarFieldEnum: {
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

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const SecurityQuestionScalarFieldEnum: {
    Id: 'Id',
    Question: 'Question'
  };

  export type SecurityQuestionScalarFieldEnum = (typeof SecurityQuestionScalarFieldEnum)[keyof typeof SecurityQuestionScalarFieldEnum]


  export const UserSecurityScalarFieldEnum: {
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

  export type UserSecurityScalarFieldEnum = (typeof UserSecurityScalarFieldEnum)[keyof typeof UserSecurityScalarFieldEnum]


  export const CorporateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    industry: 'industry',
    status: 'status',
    internet_banking_status: 'internet_banking_status',
    logo_url: 'logo_url'
  };

  export type CorporateScalarFieldEnum = (typeof CorporateScalarFieldEnum)[keyof typeof CorporateScalarFieldEnum]


  export const MiniAppScalarFieldEnum: {
    id: 'id',
    name: 'name',
    url: 'url',
    logo_url: 'logo_url',
    username: 'username',
    password: 'password',
    encryption_key: 'encryption_key'
  };

  export type MiniAppScalarFieldEnum = (typeof MiniAppScalarFieldEnum)[keyof typeof MiniAppScalarFieldEnum]


  export const OtpCodeScalarFieldEnum: {
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

  export type OtpCodeScalarFieldEnum = (typeof OtpCodeScalarFieldEnum)[keyof typeof OtpCodeScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    employeeId?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    branch?: StringNullableFilter<"User"> | string | null
    department?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    employeeId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    branch?: SortOrderInput | SortOrder
    department?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    employeeId?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    branch?: StringNullableFilter<"User"> | string | null
    department?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }, "id" | "employeeId" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    employeeId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    branch?: SortOrderInput | SortOrder
    department?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    employeeId?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: StringWithAggregatesFilter<"User"> | string
    branch?: StringNullableWithAggregatesFilter<"User"> | string | null
    department?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type RoleWhereInput = {
    AND?: RoleWhereInput | RoleWhereInput[]
    OR?: RoleWhereInput[]
    NOT?: RoleWhereInput | RoleWhereInput[]
    id?: IntFilter<"Role"> | number
    name?: StringFilter<"Role"> | string
    description?: StringFilter<"Role"> | string
  }

  export type RoleOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type RoleWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: RoleWhereInput | RoleWhereInput[]
    OR?: RoleWhereInput[]
    NOT?: RoleWhereInput | RoleWhereInput[]
    description?: StringFilter<"Role"> | string
  }, "id" | "name">

  export type RoleOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    _count?: RoleCountOrderByAggregateInput
    _avg?: RoleAvgOrderByAggregateInput
    _max?: RoleMaxOrderByAggregateInput
    _min?: RoleMinOrderByAggregateInput
    _sum?: RoleSumOrderByAggregateInput
  }

  export type RoleScalarWhereWithAggregatesInput = {
    AND?: RoleScalarWhereWithAggregatesInput | RoleScalarWhereWithAggregatesInput[]
    OR?: RoleScalarWhereWithAggregatesInput[]
    NOT?: RoleScalarWhereWithAggregatesInput | RoleScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Role"> | number
    name?: StringWithAggregatesFilter<"Role"> | string
    description?: StringWithAggregatesFilter<"Role"> | string
  }

  export type BranchWhereInput = {
    AND?: BranchWhereInput | BranchWhereInput[]
    OR?: BranchWhereInput[]
    NOT?: BranchWhereInput | BranchWhereInput[]
    id?: StringFilter<"Branch"> | string
    name?: StringFilter<"Branch"> | string
    location?: StringFilter<"Branch"> | string
    createdAt?: DateTimeFilter<"Branch"> | Date | string
    departments?: DepartmentListRelationFilter
  }

  export type BranchOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
    departments?: DepartmentOrderByRelationAggregateInput
  }

  export type BranchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: BranchWhereInput | BranchWhereInput[]
    OR?: BranchWhereInput[]
    NOT?: BranchWhereInput | BranchWhereInput[]
    location?: StringFilter<"Branch"> | string
    createdAt?: DateTimeFilter<"Branch"> | Date | string
    departments?: DepartmentListRelationFilter
  }, "id" | "id" | "name">

  export type BranchOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
    _count?: BranchCountOrderByAggregateInput
    _max?: BranchMaxOrderByAggregateInput
    _min?: BranchMinOrderByAggregateInput
  }

  export type BranchScalarWhereWithAggregatesInput = {
    AND?: BranchScalarWhereWithAggregatesInput | BranchScalarWhereWithAggregatesInput[]
    OR?: BranchScalarWhereWithAggregatesInput[]
    NOT?: BranchScalarWhereWithAggregatesInput | BranchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Branch"> | string
    name?: StringWithAggregatesFilter<"Branch"> | string
    location?: StringWithAggregatesFilter<"Branch"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Branch"> | Date | string
  }

  export type DepartmentWhereInput = {
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    id?: StringFilter<"Department"> | string
    name?: StringFilter<"Department"> | string
    branchId?: StringFilter<"Department"> | string
    createdAt?: DateTimeFilter<"Department"> | Date | string
    branch?: XOR<BranchRelationFilter, BranchWhereInput>
  }

  export type DepartmentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    branchId?: SortOrder
    createdAt?: SortOrder
    branch?: BranchOrderByWithRelationInput
  }

  export type DepartmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    branchId?: StringFilter<"Department"> | string
    createdAt?: DateTimeFilter<"Department"> | Date | string
    branch?: XOR<BranchRelationFilter, BranchWhereInput>
  }, "id" | "id" | "name">

  export type DepartmentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    branchId?: SortOrder
    createdAt?: SortOrder
    _count?: DepartmentCountOrderByAggregateInput
    _max?: DepartmentMaxOrderByAggregateInput
    _min?: DepartmentMinOrderByAggregateInput
  }

  export type DepartmentScalarWhereWithAggregatesInput = {
    AND?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    OR?: DepartmentScalarWhereWithAggregatesInput[]
    NOT?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Department"> | string
    name?: StringWithAggregatesFilter<"Department"> | string
    branchId?: StringWithAggregatesFilter<"Department"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Department"> | Date | string
  }

  export type CustomerWhereInput = {
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    id?: IntFilter<"Customer"> | number
    name?: StringFilter<"Customer"> | string
    phone?: StringFilter<"Customer"> | string
    status?: StringFilter<"Customer"> | string
    registeredAt?: DateTimeFilter<"Customer"> | Date | string
    transactions?: TransactionListRelationFilter
    approvals?: PendingApprovalListRelationFilter
  }

  export type CustomerOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
    transactions?: TransactionOrderByRelationAggregateInput
    approvals?: PendingApprovalOrderByRelationAggregateInput
  }

  export type CustomerWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    phone?: string
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    name?: StringFilter<"Customer"> | string
    status?: StringFilter<"Customer"> | string
    registeredAt?: DateTimeFilter<"Customer"> | Date | string
    transactions?: TransactionListRelationFilter
    approvals?: PendingApprovalListRelationFilter
  }, "id" | "phone">

  export type CustomerOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
    _count?: CustomerCountOrderByAggregateInput
    _avg?: CustomerAvgOrderByAggregateInput
    _max?: CustomerMaxOrderByAggregateInput
    _min?: CustomerMinOrderByAggregateInput
    _sum?: CustomerSumOrderByAggregateInput
  }

  export type CustomerScalarWhereWithAggregatesInput = {
    AND?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    OR?: CustomerScalarWhereWithAggregatesInput[]
    NOT?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Customer"> | number
    name?: StringWithAggregatesFilter<"Customer"> | string
    phone?: StringWithAggregatesFilter<"Customer"> | string
    status?: StringWithAggregatesFilter<"Customer"> | string
    registeredAt?: DateTimeWithAggregatesFilter<"Customer"> | Date | string
  }

  export type PendingApprovalWhereInput = {
    AND?: PendingApprovalWhereInput | PendingApprovalWhereInput[]
    OR?: PendingApprovalWhereInput[]
    NOT?: PendingApprovalWhereInput | PendingApprovalWhereInput[]
    id?: IntFilter<"PendingApproval"> | number
    customerId?: IntFilter<"PendingApproval"> | number
    type?: StringFilter<"PendingApproval"> | string
    requestedAt?: DateTimeFilter<"PendingApproval"> | Date | string
    customerName?: StringFilter<"PendingApproval"> | string
    customerPhone?: StringFilter<"PendingApproval"> | string
    details?: StringNullableFilter<"PendingApproval"> | string | null
    status?: StringFilter<"PendingApproval"> | string
    customer?: XOR<CustomerRelationFilter, CustomerWhereInput>
  }

  export type PendingApprovalOrderByWithRelationInput = {
    id?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    requestedAt?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    details?: SortOrderInput | SortOrder
    status?: SortOrder
    customer?: CustomerOrderByWithRelationInput
  }

  export type PendingApprovalWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: PendingApprovalWhereInput | PendingApprovalWhereInput[]
    OR?: PendingApprovalWhereInput[]
    NOT?: PendingApprovalWhereInput | PendingApprovalWhereInput[]
    customerId?: IntFilter<"PendingApproval"> | number
    type?: StringFilter<"PendingApproval"> | string
    requestedAt?: DateTimeFilter<"PendingApproval"> | Date | string
    customerName?: StringFilter<"PendingApproval"> | string
    customerPhone?: StringFilter<"PendingApproval"> | string
    details?: StringNullableFilter<"PendingApproval"> | string | null
    status?: StringFilter<"PendingApproval"> | string
    customer?: XOR<CustomerRelationFilter, CustomerWhereInput>
  }, "id">

  export type PendingApprovalOrderByWithAggregationInput = {
    id?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    requestedAt?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    details?: SortOrderInput | SortOrder
    status?: SortOrder
    _count?: PendingApprovalCountOrderByAggregateInput
    _avg?: PendingApprovalAvgOrderByAggregateInput
    _max?: PendingApprovalMaxOrderByAggregateInput
    _min?: PendingApprovalMinOrderByAggregateInput
    _sum?: PendingApprovalSumOrderByAggregateInput
  }

  export type PendingApprovalScalarWhereWithAggregatesInput = {
    AND?: PendingApprovalScalarWhereWithAggregatesInput | PendingApprovalScalarWhereWithAggregatesInput[]
    OR?: PendingApprovalScalarWhereWithAggregatesInput[]
    NOT?: PendingApprovalScalarWhereWithAggregatesInput | PendingApprovalScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"PendingApproval"> | number
    customerId?: IntWithAggregatesFilter<"PendingApproval"> | number
    type?: StringWithAggregatesFilter<"PendingApproval"> | string
    requestedAt?: DateTimeWithAggregatesFilter<"PendingApproval"> | Date | string
    customerName?: StringWithAggregatesFilter<"PendingApproval"> | string
    customerPhone?: StringWithAggregatesFilter<"PendingApproval"> | string
    details?: StringNullableWithAggregatesFilter<"PendingApproval"> | string | null
    status?: StringWithAggregatesFilter<"PendingApproval"> | string
  }

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    id?: StringFilter<"Transaction"> | string
    customerId?: IntFilter<"Transaction"> | number
    amount?: FloatFilter<"Transaction"> | number
    fee?: FloatFilter<"Transaction"> | number
    status?: StringFilter<"Transaction"> | string
    timestamp?: DateTimeFilter<"Transaction"> | Date | string
    type?: StringFilter<"Transaction"> | string
    channel?: StringFilter<"Transaction"> | string
    from_account?: StringNullableFilter<"Transaction"> | string | null
    to_account?: StringNullableFilter<"Transaction"> | string | null
    is_anomalous?: BoolFilter<"Transaction"> | boolean
    anomaly_reason?: StringNullableFilter<"Transaction"> | string | null
    customer?: XOR<CustomerRelationFilter, CustomerWhereInput>
  }

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder
    customerId?: SortOrder
    amount?: SortOrder
    fee?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
    type?: SortOrder
    channel?: SortOrder
    from_account?: SortOrderInput | SortOrder
    to_account?: SortOrderInput | SortOrder
    is_anomalous?: SortOrder
    anomaly_reason?: SortOrderInput | SortOrder
    customer?: CustomerOrderByWithRelationInput
  }

  export type TransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    customerId?: IntFilter<"Transaction"> | number
    amount?: FloatFilter<"Transaction"> | number
    fee?: FloatFilter<"Transaction"> | number
    status?: StringFilter<"Transaction"> | string
    timestamp?: DateTimeFilter<"Transaction"> | Date | string
    type?: StringFilter<"Transaction"> | string
    channel?: StringFilter<"Transaction"> | string
    from_account?: StringNullableFilter<"Transaction"> | string | null
    to_account?: StringNullableFilter<"Transaction"> | string | null
    is_anomalous?: BoolFilter<"Transaction"> | boolean
    anomaly_reason?: StringNullableFilter<"Transaction"> | string | null
    customer?: XOR<CustomerRelationFilter, CustomerWhereInput>
  }, "id">

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder
    customerId?: SortOrder
    amount?: SortOrder
    fee?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
    type?: SortOrder
    channel?: SortOrder
    from_account?: SortOrderInput | SortOrder
    to_account?: SortOrderInput | SortOrder
    is_anomalous?: SortOrder
    anomaly_reason?: SortOrderInput | SortOrder
    _count?: TransactionCountOrderByAggregateInput
    _avg?: TransactionAvgOrderByAggregateInput
    _max?: TransactionMaxOrderByAggregateInput
    _min?: TransactionMinOrderByAggregateInput
    _sum?: TransactionSumOrderByAggregateInput
  }

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    OR?: TransactionScalarWhereWithAggregatesInput[]
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Transaction"> | string
    customerId?: IntWithAggregatesFilter<"Transaction"> | number
    amount?: FloatWithAggregatesFilter<"Transaction"> | number
    fee?: FloatWithAggregatesFilter<"Transaction"> | number
    status?: StringWithAggregatesFilter<"Transaction"> | string
    timestamp?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    type?: StringWithAggregatesFilter<"Transaction"> | string
    channel?: StringWithAggregatesFilter<"Transaction"> | string
    from_account?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    to_account?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    is_anomalous?: BoolWithAggregatesFilter<"Transaction"> | boolean
    anomaly_reason?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
  }

  export type AppUserWhereInput = {
    AND?: AppUserWhereInput | AppUserWhereInput[]
    OR?: AppUserWhereInput[]
    NOT?: AppUserWhereInput | AppUserWhereInput[]
    Id?: StringFilter<"AppUser"> | string
    CIFNumber?: StringFilter<"AppUser"> | string
    FirstName?: StringFilter<"AppUser"> | string
    SecondName?: StringNullableFilter<"AppUser"> | string | null
    LastName?: StringFilter<"AppUser"> | string
    Email?: StringFilter<"AppUser"> | string
    PhoneNumber?: StringFilter<"AppUser"> | string
    Status?: StringFilter<"AppUser"> | string
    SignUpMainAuth?: StringFilter<"AppUser"> | string
    SignUp2FA?: StringFilter<"AppUser"> | string
    BranchCode?: StringNullableFilter<"AppUser"> | string | null
    BranchName?: StringNullableFilter<"AppUser"> | string | null
    AddressLine1?: StringNullableFilter<"AppUser"> | string | null
    AddressLine2?: StringNullableFilter<"AppUser"> | string | null
    AddressLine3?: StringNullableFilter<"AppUser"> | string | null
    AddressLine4?: StringNullableFilter<"AppUser"> | string | null
    Nationality?: StringNullableFilter<"AppUser"> | string | null
    Channel?: StringNullableFilter<"AppUser"> | string | null
    InsertDate?: DateTimeFilter<"AppUser"> | Date | string
    UpdateDate?: DateTimeFilter<"AppUser"> | Date | string
  }

  export type AppUserOrderByWithRelationInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrderInput | SortOrder
    LastName?: SortOrder
    Email?: SortOrder
    PhoneNumber?: SortOrder
    Status?: SortOrder
    SignUpMainAuth?: SortOrder
    SignUp2FA?: SortOrder
    BranchCode?: SortOrderInput | SortOrder
    BranchName?: SortOrderInput | SortOrder
    AddressLine1?: SortOrderInput | SortOrder
    AddressLine2?: SortOrderInput | SortOrder
    AddressLine3?: SortOrderInput | SortOrder
    AddressLine4?: SortOrderInput | SortOrder
    Nationality?: SortOrderInput | SortOrder
    Channel?: SortOrderInput | SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type AppUserWhereUniqueInput = Prisma.AtLeast<{
    Id?: string
    CIFNumber?: string
    AND?: AppUserWhereInput | AppUserWhereInput[]
    OR?: AppUserWhereInput[]
    NOT?: AppUserWhereInput | AppUserWhereInput[]
    FirstName?: StringFilter<"AppUser"> | string
    SecondName?: StringNullableFilter<"AppUser"> | string | null
    LastName?: StringFilter<"AppUser"> | string
    Email?: StringFilter<"AppUser"> | string
    PhoneNumber?: StringFilter<"AppUser"> | string
    Status?: StringFilter<"AppUser"> | string
    SignUpMainAuth?: StringFilter<"AppUser"> | string
    SignUp2FA?: StringFilter<"AppUser"> | string
    BranchCode?: StringNullableFilter<"AppUser"> | string | null
    BranchName?: StringNullableFilter<"AppUser"> | string | null
    AddressLine1?: StringNullableFilter<"AppUser"> | string | null
    AddressLine2?: StringNullableFilter<"AppUser"> | string | null
    AddressLine3?: StringNullableFilter<"AppUser"> | string | null
    AddressLine4?: StringNullableFilter<"AppUser"> | string | null
    Nationality?: StringNullableFilter<"AppUser"> | string | null
    Channel?: StringNullableFilter<"AppUser"> | string | null
    InsertDate?: DateTimeFilter<"AppUser"> | Date | string
    UpdateDate?: DateTimeFilter<"AppUser"> | Date | string
  }, "Id" | "CIFNumber">

  export type AppUserOrderByWithAggregationInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrderInput | SortOrder
    LastName?: SortOrder
    Email?: SortOrder
    PhoneNumber?: SortOrder
    Status?: SortOrder
    SignUpMainAuth?: SortOrder
    SignUp2FA?: SortOrder
    BranchCode?: SortOrderInput | SortOrder
    BranchName?: SortOrderInput | SortOrder
    AddressLine1?: SortOrderInput | SortOrder
    AddressLine2?: SortOrderInput | SortOrder
    AddressLine3?: SortOrderInput | SortOrder
    AddressLine4?: SortOrderInput | SortOrder
    Nationality?: SortOrderInput | SortOrder
    Channel?: SortOrderInput | SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
    _count?: AppUserCountOrderByAggregateInput
    _max?: AppUserMaxOrderByAggregateInput
    _min?: AppUserMinOrderByAggregateInput
  }

  export type AppUserScalarWhereWithAggregatesInput = {
    AND?: AppUserScalarWhereWithAggregatesInput | AppUserScalarWhereWithAggregatesInput[]
    OR?: AppUserScalarWhereWithAggregatesInput[]
    NOT?: AppUserScalarWhereWithAggregatesInput | AppUserScalarWhereWithAggregatesInput[]
    Id?: StringWithAggregatesFilter<"AppUser"> | string
    CIFNumber?: StringWithAggregatesFilter<"AppUser"> | string
    FirstName?: StringWithAggregatesFilter<"AppUser"> | string
    SecondName?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    LastName?: StringWithAggregatesFilter<"AppUser"> | string
    Email?: StringWithAggregatesFilter<"AppUser"> | string
    PhoneNumber?: StringWithAggregatesFilter<"AppUser"> | string
    Status?: StringWithAggregatesFilter<"AppUser"> | string
    SignUpMainAuth?: StringWithAggregatesFilter<"AppUser"> | string
    SignUp2FA?: StringWithAggregatesFilter<"AppUser"> | string
    BranchCode?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    BranchName?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    AddressLine1?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    AddressLine2?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    AddressLine3?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    AddressLine4?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    Nationality?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    Channel?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    InsertDate?: DateTimeWithAggregatesFilter<"AppUser"> | Date | string
    UpdateDate?: DateTimeWithAggregatesFilter<"AppUser"> | Date | string
  }

  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    Id?: StringFilter<"Account"> | string
    CIFNumber?: StringFilter<"Account"> | string
    AccountNumber?: StringFilter<"Account"> | string
    FirstName?: StringFilter<"Account"> | string
    SecondName?: StringNullableFilter<"Account"> | string | null
    LastName?: StringFilter<"Account"> | string
    AccountType?: StringFilter<"Account"> | string
    Currency?: StringFilter<"Account"> | string
    Status?: StringFilter<"Account"> | string
    BranchName?: StringNullableFilter<"Account"> | string | null
    InsertDate?: DateTimeFilter<"Account"> | Date | string
    UpdateDate?: DateTimeFilter<"Account"> | Date | string
  }

  export type AccountOrderByWithRelationInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    AccountNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrderInput | SortOrder
    LastName?: SortOrder
    AccountType?: SortOrder
    Currency?: SortOrder
    Status?: SortOrder
    BranchName?: SortOrderInput | SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    Id?: string
    AccountNumber?: string
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    CIFNumber?: StringFilter<"Account"> | string
    FirstName?: StringFilter<"Account"> | string
    SecondName?: StringNullableFilter<"Account"> | string | null
    LastName?: StringFilter<"Account"> | string
    AccountType?: StringFilter<"Account"> | string
    Currency?: StringFilter<"Account"> | string
    Status?: StringFilter<"Account"> | string
    BranchName?: StringNullableFilter<"Account"> | string | null
    InsertDate?: DateTimeFilter<"Account"> | Date | string
    UpdateDate?: DateTimeFilter<"Account"> | Date | string
  }, "Id" | "AccountNumber">

  export type AccountOrderByWithAggregationInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    AccountNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrderInput | SortOrder
    LastName?: SortOrder
    AccountType?: SortOrder
    Currency?: SortOrder
    Status?: SortOrder
    BranchName?: SortOrderInput | SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
    _count?: AccountCountOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    Id?: StringWithAggregatesFilter<"Account"> | string
    CIFNumber?: StringWithAggregatesFilter<"Account"> | string
    AccountNumber?: StringWithAggregatesFilter<"Account"> | string
    FirstName?: StringWithAggregatesFilter<"Account"> | string
    SecondName?: StringNullableWithAggregatesFilter<"Account"> | string | null
    LastName?: StringWithAggregatesFilter<"Account"> | string
    AccountType?: StringWithAggregatesFilter<"Account"> | string
    Currency?: StringWithAggregatesFilter<"Account"> | string
    Status?: StringWithAggregatesFilter<"Account"> | string
    BranchName?: StringNullableWithAggregatesFilter<"Account"> | string | null
    InsertDate?: DateTimeWithAggregatesFilter<"Account"> | Date | string
    UpdateDate?: DateTimeWithAggregatesFilter<"Account"> | Date | string
  }

  export type SecurityQuestionWhereInput = {
    AND?: SecurityQuestionWhereInput | SecurityQuestionWhereInput[]
    OR?: SecurityQuestionWhereInput[]
    NOT?: SecurityQuestionWhereInput | SecurityQuestionWhereInput[]
    Id?: StringFilter<"SecurityQuestion"> | string
    Question?: StringFilter<"SecurityQuestion"> | string
    UserSecurities?: UserSecurityListRelationFilter
  }

  export type SecurityQuestionOrderByWithRelationInput = {
    Id?: SortOrder
    Question?: SortOrder
    UserSecurities?: UserSecurityOrderByRelationAggregateInput
  }

  export type SecurityQuestionWhereUniqueInput = Prisma.AtLeast<{
    Id?: string
    Question?: string
    AND?: SecurityQuestionWhereInput | SecurityQuestionWhereInput[]
    OR?: SecurityQuestionWhereInput[]
    NOT?: SecurityQuestionWhereInput | SecurityQuestionWhereInput[]
    UserSecurities?: UserSecurityListRelationFilter
  }, "Id" | "Question">

  export type SecurityQuestionOrderByWithAggregationInput = {
    Id?: SortOrder
    Question?: SortOrder
    _count?: SecurityQuestionCountOrderByAggregateInput
    _max?: SecurityQuestionMaxOrderByAggregateInput
    _min?: SecurityQuestionMinOrderByAggregateInput
  }

  export type SecurityQuestionScalarWhereWithAggregatesInput = {
    AND?: SecurityQuestionScalarWhereWithAggregatesInput | SecurityQuestionScalarWhereWithAggregatesInput[]
    OR?: SecurityQuestionScalarWhereWithAggregatesInput[]
    NOT?: SecurityQuestionScalarWhereWithAggregatesInput | SecurityQuestionScalarWhereWithAggregatesInput[]
    Id?: StringWithAggregatesFilter<"SecurityQuestion"> | string
    Question?: StringWithAggregatesFilter<"SecurityQuestion"> | string
  }

  export type UserSecurityWhereInput = {
    AND?: UserSecurityWhereInput | UserSecurityWhereInput[]
    OR?: UserSecurityWhereInput[]
    NOT?: UserSecurityWhereInput | UserSecurityWhereInput[]
    Id?: StringFilter<"UserSecurity"> | string
    UserId?: StringFilter<"UserSecurity"> | string
    CIFNumber?: StringFilter<"UserSecurity"> | string
    Status?: StringFilter<"UserSecurity"> | string
    PinHash?: StringNullableFilter<"UserSecurity"> | string | null
    PasswordHash?: StringNullableFilter<"UserSecurity"> | string | null
    SecurityQuestionId?: StringNullableFilter<"UserSecurity"> | string | null
    SecurityAnswer?: StringNullableFilter<"UserSecurity"> | string | null
    InsertDate?: DateTimeFilter<"UserSecurity"> | Date | string
    UpdateDate?: DateTimeFilter<"UserSecurity"> | Date | string
    SecurityQuestion?: XOR<SecurityQuestionNullableRelationFilter, SecurityQuestionWhereInput> | null
  }

  export type UserSecurityOrderByWithRelationInput = {
    Id?: SortOrder
    UserId?: SortOrder
    CIFNumber?: SortOrder
    Status?: SortOrder
    PinHash?: SortOrderInput | SortOrder
    PasswordHash?: SortOrderInput | SortOrder
    SecurityQuestionId?: SortOrderInput | SortOrder
    SecurityAnswer?: SortOrderInput | SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
    SecurityQuestion?: SecurityQuestionOrderByWithRelationInput
  }

  export type UserSecurityWhereUniqueInput = Prisma.AtLeast<{
    Id?: string
    CIFNumber?: string
    AND?: UserSecurityWhereInput | UserSecurityWhereInput[]
    OR?: UserSecurityWhereInput[]
    NOT?: UserSecurityWhereInput | UserSecurityWhereInput[]
    UserId?: StringFilter<"UserSecurity"> | string
    Status?: StringFilter<"UserSecurity"> | string
    PinHash?: StringNullableFilter<"UserSecurity"> | string | null
    PasswordHash?: StringNullableFilter<"UserSecurity"> | string | null
    SecurityQuestionId?: StringNullableFilter<"UserSecurity"> | string | null
    SecurityAnswer?: StringNullableFilter<"UserSecurity"> | string | null
    InsertDate?: DateTimeFilter<"UserSecurity"> | Date | string
    UpdateDate?: DateTimeFilter<"UserSecurity"> | Date | string
    SecurityQuestion?: XOR<SecurityQuestionNullableRelationFilter, SecurityQuestionWhereInput> | null
  }, "Id" | "CIFNumber">

  export type UserSecurityOrderByWithAggregationInput = {
    Id?: SortOrder
    UserId?: SortOrder
    CIFNumber?: SortOrder
    Status?: SortOrder
    PinHash?: SortOrderInput | SortOrder
    PasswordHash?: SortOrderInput | SortOrder
    SecurityQuestionId?: SortOrderInput | SortOrder
    SecurityAnswer?: SortOrderInput | SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
    _count?: UserSecurityCountOrderByAggregateInput
    _max?: UserSecurityMaxOrderByAggregateInput
    _min?: UserSecurityMinOrderByAggregateInput
  }

  export type UserSecurityScalarWhereWithAggregatesInput = {
    AND?: UserSecurityScalarWhereWithAggregatesInput | UserSecurityScalarWhereWithAggregatesInput[]
    OR?: UserSecurityScalarWhereWithAggregatesInput[]
    NOT?: UserSecurityScalarWhereWithAggregatesInput | UserSecurityScalarWhereWithAggregatesInput[]
    Id?: StringWithAggregatesFilter<"UserSecurity"> | string
    UserId?: StringWithAggregatesFilter<"UserSecurity"> | string
    CIFNumber?: StringWithAggregatesFilter<"UserSecurity"> | string
    Status?: StringWithAggregatesFilter<"UserSecurity"> | string
    PinHash?: StringNullableWithAggregatesFilter<"UserSecurity"> | string | null
    PasswordHash?: StringNullableWithAggregatesFilter<"UserSecurity"> | string | null
    SecurityQuestionId?: StringNullableWithAggregatesFilter<"UserSecurity"> | string | null
    SecurityAnswer?: StringNullableWithAggregatesFilter<"UserSecurity"> | string | null
    InsertDate?: DateTimeWithAggregatesFilter<"UserSecurity"> | Date | string
    UpdateDate?: DateTimeWithAggregatesFilter<"UserSecurity"> | Date | string
  }

  export type CorporateWhereInput = {
    AND?: CorporateWhereInput | CorporateWhereInput[]
    OR?: CorporateWhereInput[]
    NOT?: CorporateWhereInput | CorporateWhereInput[]
    id?: StringFilter<"Corporate"> | string
    name?: StringFilter<"Corporate"> | string
    industry?: StringFilter<"Corporate"> | string
    status?: StringFilter<"Corporate"> | string
    internet_banking_status?: StringFilter<"Corporate"> | string
    logo_url?: StringFilter<"Corporate"> | string
  }

  export type CorporateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    industry?: SortOrder
    status?: SortOrder
    internet_banking_status?: SortOrder
    logo_url?: SortOrder
  }

  export type CorporateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CorporateWhereInput | CorporateWhereInput[]
    OR?: CorporateWhereInput[]
    NOT?: CorporateWhereInput | CorporateWhereInput[]
    name?: StringFilter<"Corporate"> | string
    industry?: StringFilter<"Corporate"> | string
    status?: StringFilter<"Corporate"> | string
    internet_banking_status?: StringFilter<"Corporate"> | string
    logo_url?: StringFilter<"Corporate"> | string
  }, "id" | "id">

  export type CorporateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    industry?: SortOrder
    status?: SortOrder
    internet_banking_status?: SortOrder
    logo_url?: SortOrder
    _count?: CorporateCountOrderByAggregateInput
    _max?: CorporateMaxOrderByAggregateInput
    _min?: CorporateMinOrderByAggregateInput
  }

  export type CorporateScalarWhereWithAggregatesInput = {
    AND?: CorporateScalarWhereWithAggregatesInput | CorporateScalarWhereWithAggregatesInput[]
    OR?: CorporateScalarWhereWithAggregatesInput[]
    NOT?: CorporateScalarWhereWithAggregatesInput | CorporateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Corporate"> | string
    name?: StringWithAggregatesFilter<"Corporate"> | string
    industry?: StringWithAggregatesFilter<"Corporate"> | string
    status?: StringWithAggregatesFilter<"Corporate"> | string
    internet_banking_status?: StringWithAggregatesFilter<"Corporate"> | string
    logo_url?: StringWithAggregatesFilter<"Corporate"> | string
  }

  export type MiniAppWhereInput = {
    AND?: MiniAppWhereInput | MiniAppWhereInput[]
    OR?: MiniAppWhereInput[]
    NOT?: MiniAppWhereInput | MiniAppWhereInput[]
    id?: StringFilter<"MiniApp"> | string
    name?: StringFilter<"MiniApp"> | string
    url?: StringFilter<"MiniApp"> | string
    logo_url?: StringFilter<"MiniApp"> | string
    username?: StringFilter<"MiniApp"> | string
    password?: StringFilter<"MiniApp"> | string
    encryption_key?: StringFilter<"MiniApp"> | string
  }

  export type MiniAppOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    logo_url?: SortOrder
    username?: SortOrder
    password?: SortOrder
    encryption_key?: SortOrder
  }

  export type MiniAppWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MiniAppWhereInput | MiniAppWhereInput[]
    OR?: MiniAppWhereInput[]
    NOT?: MiniAppWhereInput | MiniAppWhereInput[]
    name?: StringFilter<"MiniApp"> | string
    url?: StringFilter<"MiniApp"> | string
    logo_url?: StringFilter<"MiniApp"> | string
    username?: StringFilter<"MiniApp"> | string
    password?: StringFilter<"MiniApp"> | string
    encryption_key?: StringFilter<"MiniApp"> | string
  }, "id">

  export type MiniAppOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    logo_url?: SortOrder
    username?: SortOrder
    password?: SortOrder
    encryption_key?: SortOrder
    _count?: MiniAppCountOrderByAggregateInput
    _max?: MiniAppMaxOrderByAggregateInput
    _min?: MiniAppMinOrderByAggregateInput
  }

  export type MiniAppScalarWhereWithAggregatesInput = {
    AND?: MiniAppScalarWhereWithAggregatesInput | MiniAppScalarWhereWithAggregatesInput[]
    OR?: MiniAppScalarWhereWithAggregatesInput[]
    NOT?: MiniAppScalarWhereWithAggregatesInput | MiniAppScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MiniApp"> | string
    name?: StringWithAggregatesFilter<"MiniApp"> | string
    url?: StringWithAggregatesFilter<"MiniApp"> | string
    logo_url?: StringWithAggregatesFilter<"MiniApp"> | string
    username?: StringWithAggregatesFilter<"MiniApp"> | string
    password?: StringWithAggregatesFilter<"MiniApp"> | string
    encryption_key?: StringWithAggregatesFilter<"MiniApp"> | string
  }

  export type OtpCodeWhereInput = {
    AND?: OtpCodeWhereInput | OtpCodeWhereInput[]
    OR?: OtpCodeWhereInput[]
    NOT?: OtpCodeWhereInput | OtpCodeWhereInput[]
    Id?: IntFilter<"OtpCode"> | number
    Purpose?: StringFilter<"OtpCode"> | string
    UserId?: StringFilter<"OtpCode"> | string
    OtpType?: StringFilter<"OtpCode"> | string
    Code?: StringNullableFilter<"OtpCode"> | string | null
    IsUsed?: BoolFilter<"OtpCode"> | boolean
    ExpiresAt?: DateTimeFilter<"OtpCode"> | Date | string
    Attempts?: IntFilter<"OtpCode"> | number
    InsertDate?: DateTimeFilter<"OtpCode"> | Date | string
    UpdateDate?: DateTimeFilter<"OtpCode"> | Date | string
  }

  export type OtpCodeOrderByWithRelationInput = {
    Id?: SortOrder
    Purpose?: SortOrder
    UserId?: SortOrder
    OtpType?: SortOrder
    Code?: SortOrderInput | SortOrder
    IsUsed?: SortOrder
    ExpiresAt?: SortOrder
    Attempts?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type OtpCodeWhereUniqueInput = Prisma.AtLeast<{
    Id?: number
    AND?: OtpCodeWhereInput | OtpCodeWhereInput[]
    OR?: OtpCodeWhereInput[]
    NOT?: OtpCodeWhereInput | OtpCodeWhereInput[]
    Purpose?: StringFilter<"OtpCode"> | string
    UserId?: StringFilter<"OtpCode"> | string
    OtpType?: StringFilter<"OtpCode"> | string
    Code?: StringNullableFilter<"OtpCode"> | string | null
    IsUsed?: BoolFilter<"OtpCode"> | boolean
    ExpiresAt?: DateTimeFilter<"OtpCode"> | Date | string
    Attempts?: IntFilter<"OtpCode"> | number
    InsertDate?: DateTimeFilter<"OtpCode"> | Date | string
    UpdateDate?: DateTimeFilter<"OtpCode"> | Date | string
  }, "Id">

  export type OtpCodeOrderByWithAggregationInput = {
    Id?: SortOrder
    Purpose?: SortOrder
    UserId?: SortOrder
    OtpType?: SortOrder
    Code?: SortOrderInput | SortOrder
    IsUsed?: SortOrder
    ExpiresAt?: SortOrder
    Attempts?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
    _count?: OtpCodeCountOrderByAggregateInput
    _avg?: OtpCodeAvgOrderByAggregateInput
    _max?: OtpCodeMaxOrderByAggregateInput
    _min?: OtpCodeMinOrderByAggregateInput
    _sum?: OtpCodeSumOrderByAggregateInput
  }

  export type OtpCodeScalarWhereWithAggregatesInput = {
    AND?: OtpCodeScalarWhereWithAggregatesInput | OtpCodeScalarWhereWithAggregatesInput[]
    OR?: OtpCodeScalarWhereWithAggregatesInput[]
    NOT?: OtpCodeScalarWhereWithAggregatesInput | OtpCodeScalarWhereWithAggregatesInput[]
    Id?: IntWithAggregatesFilter<"OtpCode"> | number
    Purpose?: StringWithAggregatesFilter<"OtpCode"> | string
    UserId?: StringWithAggregatesFilter<"OtpCode"> | string
    OtpType?: StringWithAggregatesFilter<"OtpCode"> | string
    Code?: StringNullableWithAggregatesFilter<"OtpCode"> | string | null
    IsUsed?: BoolWithAggregatesFilter<"OtpCode"> | boolean
    ExpiresAt?: DateTimeWithAggregatesFilter<"OtpCode"> | Date | string
    Attempts?: IntWithAggregatesFilter<"OtpCode"> | number
    InsertDate?: DateTimeWithAggregatesFilter<"OtpCode"> | Date | string
    UpdateDate?: DateTimeWithAggregatesFilter<"OtpCode"> | Date | string
  }

  export type UserCreateInput = {
    employeeId: string
    name: string
    email: string
    password: string
    role: string
    branch?: string | null
    department: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateInput = {
    id?: number
    employeeId: string
    name: string
    email: string
    password: string
    role: string
    branch?: string | null
    department: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateInput = {
    employeeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyInput = {
    id?: number
    employeeId: string
    name: string
    email: string
    password: string
    role: string
    branch?: string | null
    department: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    employeeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoleCreateInput = {
    name: string
    description: string
  }

  export type RoleUncheckedCreateInput = {
    id?: number
    name: string
    description: string
  }

  export type RoleUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
  }

  export type RoleUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
  }

  export type RoleCreateManyInput = {
    id?: number
    name: string
    description: string
  }

  export type RoleUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
  }

  export type RoleUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
  }

  export type BranchCreateInput = {
    id: string
    name: string
    location: string
    createdAt?: Date | string
    departments?: DepartmentCreateNestedManyWithoutBranchInput
  }

  export type BranchUncheckedCreateInput = {
    id: string
    name: string
    location: string
    createdAt?: Date | string
    departments?: DepartmentUncheckedCreateNestedManyWithoutBranchInput
  }

  export type BranchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    departments?: DepartmentUpdateManyWithoutBranchNestedInput
  }

  export type BranchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    departments?: DepartmentUncheckedUpdateManyWithoutBranchNestedInput
  }

  export type BranchCreateManyInput = {
    id: string
    name: string
    location: string
    createdAt?: Date | string
  }

  export type BranchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BranchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DepartmentCreateInput = {
    id: string
    name: string
    createdAt?: Date | string
    branch: BranchCreateNestedOneWithoutDepartmentsInput
  }

  export type DepartmentUncheckedCreateInput = {
    id: string
    name: string
    branchId: string
    createdAt?: Date | string
  }

  export type DepartmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branch?: BranchUpdateOneRequiredWithoutDepartmentsNestedInput
  }

  export type DepartmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DepartmentCreateManyInput = {
    id: string
    name: string
    branchId: string
    createdAt?: Date | string
  }

  export type DepartmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DepartmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    branchId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerCreateInput = {
    name: string
    phone: string
    status: string
    registeredAt?: Date | string
    transactions?: TransactionCreateNestedManyWithoutCustomerInput
    approvals?: PendingApprovalCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateInput = {
    id?: number
    name: string
    phone: string
    status: string
    registeredAt?: Date | string
    transactions?: TransactionUncheckedCreateNestedManyWithoutCustomerInput
    approvals?: PendingApprovalUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: TransactionUpdateManyWithoutCustomerNestedInput
    approvals?: PendingApprovalUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: TransactionUncheckedUpdateManyWithoutCustomerNestedInput
    approvals?: PendingApprovalUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerCreateManyInput = {
    id?: number
    name: string
    phone: string
    status: string
    registeredAt?: Date | string
  }

  export type CustomerUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PendingApprovalCreateInput = {
    type: string
    requestedAt?: Date | string
    customerName: string
    customerPhone: string
    details?: string | null
    status?: string
    customer: CustomerCreateNestedOneWithoutApprovalsInput
  }

  export type PendingApprovalUncheckedCreateInput = {
    id?: number
    customerId: number
    type: string
    requestedAt?: Date | string
    customerName: string
    customerPhone: string
    details?: string | null
    status?: string
  }

  export type PendingApprovalUpdateInput = {
    type?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    customer?: CustomerUpdateOneRequiredWithoutApprovalsNestedInput
  }

  export type PendingApprovalUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    customerId?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
  }

  export type PendingApprovalCreateManyInput = {
    id?: number
    customerId: number
    type: string
    requestedAt?: Date | string
    customerName: string
    customerPhone: string
    details?: string | null
    status?: string
  }

  export type PendingApprovalUpdateManyMutationInput = {
    type?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
  }

  export type PendingApprovalUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    customerId?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
  }

  export type TransactionCreateInput = {
    id?: string
    amount: number
    fee: number
    status: string
    timestamp?: Date | string
    type: string
    channel: string
    from_account?: string | null
    to_account?: string | null
    is_anomalous?: boolean
    anomaly_reason?: string | null
    customer: CustomerCreateNestedOneWithoutTransactionsInput
  }

  export type TransactionUncheckedCreateInput = {
    id?: string
    customerId: number
    amount: number
    fee: number
    status: string
    timestamp?: Date | string
    type: string
    channel: string
    from_account?: string | null
    to_account?: string | null
    is_anomalous?: boolean
    anomaly_reason?: string | null
  }

  export type TransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    fee?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    from_account?: NullableStringFieldUpdateOperationsInput | string | null
    to_account?: NullableStringFieldUpdateOperationsInput | string | null
    is_anomalous?: BoolFieldUpdateOperationsInput | boolean
    anomaly_reason?: NullableStringFieldUpdateOperationsInput | string | null
    customer?: CustomerUpdateOneRequiredWithoutTransactionsNestedInput
  }

  export type TransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    fee?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    from_account?: NullableStringFieldUpdateOperationsInput | string | null
    to_account?: NullableStringFieldUpdateOperationsInput | string | null
    is_anomalous?: BoolFieldUpdateOperationsInput | boolean
    anomaly_reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionCreateManyInput = {
    id?: string
    customerId: number
    amount: number
    fee: number
    status: string
    timestamp?: Date | string
    type: string
    channel: string
    from_account?: string | null
    to_account?: string | null
    is_anomalous?: boolean
    anomaly_reason?: string | null
  }

  export type TransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    fee?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    from_account?: NullableStringFieldUpdateOperationsInput | string | null
    to_account?: NullableStringFieldUpdateOperationsInput | string | null
    is_anomalous?: BoolFieldUpdateOperationsInput | boolean
    anomaly_reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: IntFieldUpdateOperationsInput | number
    amount?: FloatFieldUpdateOperationsInput | number
    fee?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    from_account?: NullableStringFieldUpdateOperationsInput | string | null
    to_account?: NullableStringFieldUpdateOperationsInput | string | null
    is_anomalous?: BoolFieldUpdateOperationsInput | boolean
    anomaly_reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AppUserCreateInput = {
    Id: string
    CIFNumber: string
    FirstName: string
    SecondName?: string | null
    LastName: string
    Email: string
    PhoneNumber: string
    Status: string
    SignUpMainAuth: string
    SignUp2FA: string
    BranchCode?: string | null
    BranchName?: string | null
    AddressLine1?: string | null
    AddressLine2?: string | null
    AddressLine3?: string | null
    AddressLine4?: string | null
    Nationality?: string | null
    Channel?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type AppUserUncheckedCreateInput = {
    Id: string
    CIFNumber: string
    FirstName: string
    SecondName?: string | null
    LastName: string
    Email: string
    PhoneNumber: string
    Status: string
    SignUpMainAuth: string
    SignUp2FA: string
    BranchCode?: string | null
    BranchName?: string | null
    AddressLine1?: string | null
    AddressLine2?: string | null
    AddressLine3?: string | null
    AddressLine4?: string | null
    Nationality?: string | null
    Channel?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type AppUserUpdateInput = {
    Id?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    FirstName?: StringFieldUpdateOperationsInput | string
    SecondName?: NullableStringFieldUpdateOperationsInput | string | null
    LastName?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    PhoneNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    SignUpMainAuth?: StringFieldUpdateOperationsInput | string
    SignUp2FA?: StringFieldUpdateOperationsInput | string
    BranchCode?: NullableStringFieldUpdateOperationsInput | string | null
    BranchName?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine1?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine2?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine3?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine4?: NullableStringFieldUpdateOperationsInput | string | null
    Nationality?: NullableStringFieldUpdateOperationsInput | string | null
    Channel?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppUserUncheckedUpdateInput = {
    Id?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    FirstName?: StringFieldUpdateOperationsInput | string
    SecondName?: NullableStringFieldUpdateOperationsInput | string | null
    LastName?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    PhoneNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    SignUpMainAuth?: StringFieldUpdateOperationsInput | string
    SignUp2FA?: StringFieldUpdateOperationsInput | string
    BranchCode?: NullableStringFieldUpdateOperationsInput | string | null
    BranchName?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine1?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine2?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine3?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine4?: NullableStringFieldUpdateOperationsInput | string | null
    Nationality?: NullableStringFieldUpdateOperationsInput | string | null
    Channel?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppUserCreateManyInput = {
    Id: string
    CIFNumber: string
    FirstName: string
    SecondName?: string | null
    LastName: string
    Email: string
    PhoneNumber: string
    Status: string
    SignUpMainAuth: string
    SignUp2FA: string
    BranchCode?: string | null
    BranchName?: string | null
    AddressLine1?: string | null
    AddressLine2?: string | null
    AddressLine3?: string | null
    AddressLine4?: string | null
    Nationality?: string | null
    Channel?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type AppUserUpdateManyMutationInput = {
    Id?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    FirstName?: StringFieldUpdateOperationsInput | string
    SecondName?: NullableStringFieldUpdateOperationsInput | string | null
    LastName?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    PhoneNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    SignUpMainAuth?: StringFieldUpdateOperationsInput | string
    SignUp2FA?: StringFieldUpdateOperationsInput | string
    BranchCode?: NullableStringFieldUpdateOperationsInput | string | null
    BranchName?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine1?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine2?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine3?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine4?: NullableStringFieldUpdateOperationsInput | string | null
    Nationality?: NullableStringFieldUpdateOperationsInput | string | null
    Channel?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppUserUncheckedUpdateManyInput = {
    Id?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    FirstName?: StringFieldUpdateOperationsInput | string
    SecondName?: NullableStringFieldUpdateOperationsInput | string | null
    LastName?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    PhoneNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    SignUpMainAuth?: StringFieldUpdateOperationsInput | string
    SignUp2FA?: StringFieldUpdateOperationsInput | string
    BranchCode?: NullableStringFieldUpdateOperationsInput | string | null
    BranchName?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine1?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine2?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine3?: NullableStringFieldUpdateOperationsInput | string | null
    AddressLine4?: NullableStringFieldUpdateOperationsInput | string | null
    Nationality?: NullableStringFieldUpdateOperationsInput | string | null
    Channel?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountCreateInput = {
    Id: string
    CIFNumber: string
    AccountNumber: string
    FirstName: string
    SecondName?: string | null
    LastName: string
    AccountType: string
    Currency: string
    Status: string
    BranchName?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type AccountUncheckedCreateInput = {
    Id: string
    CIFNumber: string
    AccountNumber: string
    FirstName: string
    SecondName?: string | null
    LastName: string
    AccountType: string
    Currency: string
    Status: string
    BranchName?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type AccountUpdateInput = {
    Id?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    AccountNumber?: StringFieldUpdateOperationsInput | string
    FirstName?: StringFieldUpdateOperationsInput | string
    SecondName?: NullableStringFieldUpdateOperationsInput | string | null
    LastName?: StringFieldUpdateOperationsInput | string
    AccountType?: StringFieldUpdateOperationsInput | string
    Currency?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    BranchName?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUncheckedUpdateInput = {
    Id?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    AccountNumber?: StringFieldUpdateOperationsInput | string
    FirstName?: StringFieldUpdateOperationsInput | string
    SecondName?: NullableStringFieldUpdateOperationsInput | string | null
    LastName?: StringFieldUpdateOperationsInput | string
    AccountType?: StringFieldUpdateOperationsInput | string
    Currency?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    BranchName?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountCreateManyInput = {
    Id: string
    CIFNumber: string
    AccountNumber: string
    FirstName: string
    SecondName?: string | null
    LastName: string
    AccountType: string
    Currency: string
    Status: string
    BranchName?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type AccountUpdateManyMutationInput = {
    Id?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    AccountNumber?: StringFieldUpdateOperationsInput | string
    FirstName?: StringFieldUpdateOperationsInput | string
    SecondName?: NullableStringFieldUpdateOperationsInput | string | null
    LastName?: StringFieldUpdateOperationsInput | string
    AccountType?: StringFieldUpdateOperationsInput | string
    Currency?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    BranchName?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUncheckedUpdateManyInput = {
    Id?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    AccountNumber?: StringFieldUpdateOperationsInput | string
    FirstName?: StringFieldUpdateOperationsInput | string
    SecondName?: NullableStringFieldUpdateOperationsInput | string | null
    LastName?: StringFieldUpdateOperationsInput | string
    AccountType?: StringFieldUpdateOperationsInput | string
    Currency?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    BranchName?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SecurityQuestionCreateInput = {
    Id?: string
    Question: string
    UserSecurities?: UserSecurityCreateNestedManyWithoutSecurityQuestionInput
  }

  export type SecurityQuestionUncheckedCreateInput = {
    Id?: string
    Question: string
    UserSecurities?: UserSecurityUncheckedCreateNestedManyWithoutSecurityQuestionInput
  }

  export type SecurityQuestionUpdateInput = {
    Id?: StringFieldUpdateOperationsInput | string
    Question?: StringFieldUpdateOperationsInput | string
    UserSecurities?: UserSecurityUpdateManyWithoutSecurityQuestionNestedInput
  }

  export type SecurityQuestionUncheckedUpdateInput = {
    Id?: StringFieldUpdateOperationsInput | string
    Question?: StringFieldUpdateOperationsInput | string
    UserSecurities?: UserSecurityUncheckedUpdateManyWithoutSecurityQuestionNestedInput
  }

  export type SecurityQuestionCreateManyInput = {
    Id?: string
    Question: string
  }

  export type SecurityQuestionUpdateManyMutationInput = {
    Id?: StringFieldUpdateOperationsInput | string
    Question?: StringFieldUpdateOperationsInput | string
  }

  export type SecurityQuestionUncheckedUpdateManyInput = {
    Id?: StringFieldUpdateOperationsInput | string
    Question?: StringFieldUpdateOperationsInput | string
  }

  export type UserSecurityCreateInput = {
    Id?: string
    UserId: string
    CIFNumber: string
    Status: string
    PinHash?: string | null
    PasswordHash?: string | null
    SecurityAnswer?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
    SecurityQuestion?: SecurityQuestionCreateNestedOneWithoutUserSecuritiesInput
  }

  export type UserSecurityUncheckedCreateInput = {
    Id?: string
    UserId: string
    CIFNumber: string
    Status: string
    PinHash?: string | null
    PasswordHash?: string | null
    SecurityQuestionId?: string | null
    SecurityAnswer?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type UserSecurityUpdateInput = {
    Id?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    PinHash?: NullableStringFieldUpdateOperationsInput | string | null
    PasswordHash?: NullableStringFieldUpdateOperationsInput | string | null
    SecurityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
    SecurityQuestion?: SecurityQuestionUpdateOneWithoutUserSecuritiesNestedInput
  }

  export type UserSecurityUncheckedUpdateInput = {
    Id?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    PinHash?: NullableStringFieldUpdateOperationsInput | string | null
    PasswordHash?: NullableStringFieldUpdateOperationsInput | string | null
    SecurityQuestionId?: NullableStringFieldUpdateOperationsInput | string | null
    SecurityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecurityCreateManyInput = {
    Id?: string
    UserId: string
    CIFNumber: string
    Status: string
    PinHash?: string | null
    PasswordHash?: string | null
    SecurityQuestionId?: string | null
    SecurityAnswer?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type UserSecurityUpdateManyMutationInput = {
    Id?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    PinHash?: NullableStringFieldUpdateOperationsInput | string | null
    PasswordHash?: NullableStringFieldUpdateOperationsInput | string | null
    SecurityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecurityUncheckedUpdateManyInput = {
    Id?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    PinHash?: NullableStringFieldUpdateOperationsInput | string | null
    PasswordHash?: NullableStringFieldUpdateOperationsInput | string | null
    SecurityQuestionId?: NullableStringFieldUpdateOperationsInput | string | null
    SecurityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CorporateCreateInput = {
    id: string
    name: string
    industry: string
    status: string
    internet_banking_status: string
    logo_url: string
  }

  export type CorporateUncheckedCreateInput = {
    id: string
    name: string
    industry: string
    status: string
    internet_banking_status: string
    logo_url: string
  }

  export type CorporateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    industry?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    internet_banking_status?: StringFieldUpdateOperationsInput | string
    logo_url?: StringFieldUpdateOperationsInput | string
  }

  export type CorporateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    industry?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    internet_banking_status?: StringFieldUpdateOperationsInput | string
    logo_url?: StringFieldUpdateOperationsInput | string
  }

  export type CorporateCreateManyInput = {
    id: string
    name: string
    industry: string
    status: string
    internet_banking_status: string
    logo_url: string
  }

  export type CorporateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    industry?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    internet_banking_status?: StringFieldUpdateOperationsInput | string
    logo_url?: StringFieldUpdateOperationsInput | string
  }

  export type CorporateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    industry?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    internet_banking_status?: StringFieldUpdateOperationsInput | string
    logo_url?: StringFieldUpdateOperationsInput | string
  }

  export type MiniAppCreateInput = {
    id?: string
    name: string
    url: string
    logo_url: string
    username: string
    password: string
    encryption_key: string
  }

  export type MiniAppUncheckedCreateInput = {
    id?: string
    name: string
    url: string
    logo_url: string
    username: string
    password: string
    encryption_key: string
  }

  export type MiniAppUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    logo_url?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    encryption_key?: StringFieldUpdateOperationsInput | string
  }

  export type MiniAppUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    logo_url?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    encryption_key?: StringFieldUpdateOperationsInput | string
  }

  export type MiniAppCreateManyInput = {
    id?: string
    name: string
    url: string
    logo_url: string
    username: string
    password: string
    encryption_key: string
  }

  export type MiniAppUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    logo_url?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    encryption_key?: StringFieldUpdateOperationsInput | string
  }

  export type MiniAppUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    logo_url?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    encryption_key?: StringFieldUpdateOperationsInput | string
  }

  export type OtpCodeCreateInput = {
    Purpose: string
    UserId: string
    OtpType: string
    Code?: string | null
    IsUsed?: boolean
    ExpiresAt: Date | string
    Attempts?: number
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type OtpCodeUncheckedCreateInput = {
    Id?: number
    Purpose: string
    UserId: string
    OtpType: string
    Code?: string | null
    IsUsed?: boolean
    ExpiresAt: Date | string
    Attempts?: number
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type OtpCodeUpdateInput = {
    Purpose?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    OtpType?: StringFieldUpdateOperationsInput | string
    Code?: NullableStringFieldUpdateOperationsInput | string | null
    IsUsed?: BoolFieldUpdateOperationsInput | boolean
    ExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Attempts?: IntFieldUpdateOperationsInput | number
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OtpCodeUncheckedUpdateInput = {
    Id?: IntFieldUpdateOperationsInput | number
    Purpose?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    OtpType?: StringFieldUpdateOperationsInput | string
    Code?: NullableStringFieldUpdateOperationsInput | string | null
    IsUsed?: BoolFieldUpdateOperationsInput | boolean
    ExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Attempts?: IntFieldUpdateOperationsInput | number
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OtpCodeCreateManyInput = {
    Id?: number
    Purpose: string
    UserId: string
    OtpType: string
    Code?: string | null
    IsUsed?: boolean
    ExpiresAt: Date | string
    Attempts?: number
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type OtpCodeUpdateManyMutationInput = {
    Purpose?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    OtpType?: StringFieldUpdateOperationsInput | string
    Code?: NullableStringFieldUpdateOperationsInput | string | null
    IsUsed?: BoolFieldUpdateOperationsInput | boolean
    ExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Attempts?: IntFieldUpdateOperationsInput | number
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OtpCodeUncheckedUpdateManyInput = {
    Id?: IntFieldUpdateOperationsInput | number
    Purpose?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    OtpType?: StringFieldUpdateOperationsInput | string
    Code?: NullableStringFieldUpdateOperationsInput | string | null
    IsUsed?: BoolFieldUpdateOperationsInput | boolean
    ExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Attempts?: IntFieldUpdateOperationsInput | number
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    branch?: SortOrder
    department?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    branch?: SortOrder
    department?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    branch?: SortOrder
    department?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type RoleCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type RoleAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RoleMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type RoleMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type RoleSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DepartmentListRelationFilter = {
    every?: DepartmentWhereInput
    some?: DepartmentWhereInput
    none?: DepartmentWhereInput
  }

  export type DepartmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BranchCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
  }

  export type BranchMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
  }

  export type BranchMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    location?: SortOrder
    createdAt?: SortOrder
  }

  export type BranchRelationFilter = {
    is?: BranchWhereInput
    isNot?: BranchWhereInput
  }

  export type DepartmentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    branchId?: SortOrder
    createdAt?: SortOrder
  }

  export type DepartmentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    branchId?: SortOrder
    createdAt?: SortOrder
  }

  export type DepartmentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    branchId?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput
    some?: TransactionWhereInput
    none?: TransactionWhereInput
  }

  export type PendingApprovalListRelationFilter = {
    every?: PendingApprovalWhereInput
    some?: PendingApprovalWhereInput
    none?: PendingApprovalWhereInput
  }

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PendingApprovalOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomerCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
  }

  export type CustomerAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CustomerMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
  }

  export type CustomerMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
  }

  export type CustomerSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CustomerRelationFilter = {
    is?: CustomerWhereInput
    isNot?: CustomerWhereInput
  }

  export type PendingApprovalCountOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    requestedAt?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    details?: SortOrder
    status?: SortOrder
  }

  export type PendingApprovalAvgOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
  }

  export type PendingApprovalMaxOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    requestedAt?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    details?: SortOrder
    status?: SortOrder
  }

  export type PendingApprovalMinOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    type?: SortOrder
    requestedAt?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    details?: SortOrder
    status?: SortOrder
  }

  export type PendingApprovalSumOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    amount?: SortOrder
    fee?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
    type?: SortOrder
    channel?: SortOrder
    from_account?: SortOrder
    to_account?: SortOrder
    is_anomalous?: SortOrder
    anomaly_reason?: SortOrder
  }

  export type TransactionAvgOrderByAggregateInput = {
    customerId?: SortOrder
    amount?: SortOrder
    fee?: SortOrder
  }

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    amount?: SortOrder
    fee?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
    type?: SortOrder
    channel?: SortOrder
    from_account?: SortOrder
    to_account?: SortOrder
    is_anomalous?: SortOrder
    anomaly_reason?: SortOrder
  }

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    amount?: SortOrder
    fee?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
    type?: SortOrder
    channel?: SortOrder
    from_account?: SortOrder
    to_account?: SortOrder
    is_anomalous?: SortOrder
    anomaly_reason?: SortOrder
  }

  export type TransactionSumOrderByAggregateInput = {
    customerId?: SortOrder
    amount?: SortOrder
    fee?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type AppUserCountOrderByAggregateInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrder
    LastName?: SortOrder
    Email?: SortOrder
    PhoneNumber?: SortOrder
    Status?: SortOrder
    SignUpMainAuth?: SortOrder
    SignUp2FA?: SortOrder
    BranchCode?: SortOrder
    BranchName?: SortOrder
    AddressLine1?: SortOrder
    AddressLine2?: SortOrder
    AddressLine3?: SortOrder
    AddressLine4?: SortOrder
    Nationality?: SortOrder
    Channel?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type AppUserMaxOrderByAggregateInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrder
    LastName?: SortOrder
    Email?: SortOrder
    PhoneNumber?: SortOrder
    Status?: SortOrder
    SignUpMainAuth?: SortOrder
    SignUp2FA?: SortOrder
    BranchCode?: SortOrder
    BranchName?: SortOrder
    AddressLine1?: SortOrder
    AddressLine2?: SortOrder
    AddressLine3?: SortOrder
    AddressLine4?: SortOrder
    Nationality?: SortOrder
    Channel?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type AppUserMinOrderByAggregateInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrder
    LastName?: SortOrder
    Email?: SortOrder
    PhoneNumber?: SortOrder
    Status?: SortOrder
    SignUpMainAuth?: SortOrder
    SignUp2FA?: SortOrder
    BranchCode?: SortOrder
    BranchName?: SortOrder
    AddressLine1?: SortOrder
    AddressLine2?: SortOrder
    AddressLine3?: SortOrder
    AddressLine4?: SortOrder
    Nationality?: SortOrder
    Channel?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type AccountCountOrderByAggregateInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    AccountNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrder
    LastName?: SortOrder
    AccountType?: SortOrder
    Currency?: SortOrder
    Status?: SortOrder
    BranchName?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    AccountNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrder
    LastName?: SortOrder
    AccountType?: SortOrder
    Currency?: SortOrder
    Status?: SortOrder
    BranchName?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    Id?: SortOrder
    CIFNumber?: SortOrder
    AccountNumber?: SortOrder
    FirstName?: SortOrder
    SecondName?: SortOrder
    LastName?: SortOrder
    AccountType?: SortOrder
    Currency?: SortOrder
    Status?: SortOrder
    BranchName?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type UserSecurityListRelationFilter = {
    every?: UserSecurityWhereInput
    some?: UserSecurityWhereInput
    none?: UserSecurityWhereInput
  }

  export type UserSecurityOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SecurityQuestionCountOrderByAggregateInput = {
    Id?: SortOrder
    Question?: SortOrder
  }

  export type SecurityQuestionMaxOrderByAggregateInput = {
    Id?: SortOrder
    Question?: SortOrder
  }

  export type SecurityQuestionMinOrderByAggregateInput = {
    Id?: SortOrder
    Question?: SortOrder
  }

  export type SecurityQuestionNullableRelationFilter = {
    is?: SecurityQuestionWhereInput | null
    isNot?: SecurityQuestionWhereInput | null
  }

  export type UserSecurityCountOrderByAggregateInput = {
    Id?: SortOrder
    UserId?: SortOrder
    CIFNumber?: SortOrder
    Status?: SortOrder
    PinHash?: SortOrder
    PasswordHash?: SortOrder
    SecurityQuestionId?: SortOrder
    SecurityAnswer?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type UserSecurityMaxOrderByAggregateInput = {
    Id?: SortOrder
    UserId?: SortOrder
    CIFNumber?: SortOrder
    Status?: SortOrder
    PinHash?: SortOrder
    PasswordHash?: SortOrder
    SecurityQuestionId?: SortOrder
    SecurityAnswer?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type UserSecurityMinOrderByAggregateInput = {
    Id?: SortOrder
    UserId?: SortOrder
    CIFNumber?: SortOrder
    Status?: SortOrder
    PinHash?: SortOrder
    PasswordHash?: SortOrder
    SecurityQuestionId?: SortOrder
    SecurityAnswer?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type CorporateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    industry?: SortOrder
    status?: SortOrder
    internet_banking_status?: SortOrder
    logo_url?: SortOrder
  }

  export type CorporateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    industry?: SortOrder
    status?: SortOrder
    internet_banking_status?: SortOrder
    logo_url?: SortOrder
  }

  export type CorporateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    industry?: SortOrder
    status?: SortOrder
    internet_banking_status?: SortOrder
    logo_url?: SortOrder
  }

  export type MiniAppCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    logo_url?: SortOrder
    username?: SortOrder
    password?: SortOrder
    encryption_key?: SortOrder
  }

  export type MiniAppMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    logo_url?: SortOrder
    username?: SortOrder
    password?: SortOrder
    encryption_key?: SortOrder
  }

  export type MiniAppMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    url?: SortOrder
    logo_url?: SortOrder
    username?: SortOrder
    password?: SortOrder
    encryption_key?: SortOrder
  }

  export type OtpCodeCountOrderByAggregateInput = {
    Id?: SortOrder
    Purpose?: SortOrder
    UserId?: SortOrder
    OtpType?: SortOrder
    Code?: SortOrder
    IsUsed?: SortOrder
    ExpiresAt?: SortOrder
    Attempts?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type OtpCodeAvgOrderByAggregateInput = {
    Id?: SortOrder
    Attempts?: SortOrder
  }

  export type OtpCodeMaxOrderByAggregateInput = {
    Id?: SortOrder
    Purpose?: SortOrder
    UserId?: SortOrder
    OtpType?: SortOrder
    Code?: SortOrder
    IsUsed?: SortOrder
    ExpiresAt?: SortOrder
    Attempts?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type OtpCodeMinOrderByAggregateInput = {
    Id?: SortOrder
    Purpose?: SortOrder
    UserId?: SortOrder
    OtpType?: SortOrder
    Code?: SortOrder
    IsUsed?: SortOrder
    ExpiresAt?: SortOrder
    Attempts?: SortOrder
    InsertDate?: SortOrder
    UpdateDate?: SortOrder
  }

  export type OtpCodeSumOrderByAggregateInput = {
    Id?: SortOrder
    Attempts?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DepartmentCreateNestedManyWithoutBranchInput = {
    create?: XOR<DepartmentCreateWithoutBranchInput, DepartmentUncheckedCreateWithoutBranchInput> | DepartmentCreateWithoutBranchInput[] | DepartmentUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutBranchInput | DepartmentCreateOrConnectWithoutBranchInput[]
    createMany?: DepartmentCreateManyBranchInputEnvelope
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
  }

  export type DepartmentUncheckedCreateNestedManyWithoutBranchInput = {
    create?: XOR<DepartmentCreateWithoutBranchInput, DepartmentUncheckedCreateWithoutBranchInput> | DepartmentCreateWithoutBranchInput[] | DepartmentUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutBranchInput | DepartmentCreateOrConnectWithoutBranchInput[]
    createMany?: DepartmentCreateManyBranchInputEnvelope
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
  }

  export type DepartmentUpdateManyWithoutBranchNestedInput = {
    create?: XOR<DepartmentCreateWithoutBranchInput, DepartmentUncheckedCreateWithoutBranchInput> | DepartmentCreateWithoutBranchInput[] | DepartmentUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutBranchInput | DepartmentCreateOrConnectWithoutBranchInput[]
    upsert?: DepartmentUpsertWithWhereUniqueWithoutBranchInput | DepartmentUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: DepartmentCreateManyBranchInputEnvelope
    set?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    disconnect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    delete?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    update?: DepartmentUpdateWithWhereUniqueWithoutBranchInput | DepartmentUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: DepartmentUpdateManyWithWhereWithoutBranchInput | DepartmentUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
  }

  export type DepartmentUncheckedUpdateManyWithoutBranchNestedInput = {
    create?: XOR<DepartmentCreateWithoutBranchInput, DepartmentUncheckedCreateWithoutBranchInput> | DepartmentCreateWithoutBranchInput[] | DepartmentUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutBranchInput | DepartmentCreateOrConnectWithoutBranchInput[]
    upsert?: DepartmentUpsertWithWhereUniqueWithoutBranchInput | DepartmentUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: DepartmentCreateManyBranchInputEnvelope
    set?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    disconnect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    delete?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    update?: DepartmentUpdateWithWhereUniqueWithoutBranchInput | DepartmentUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: DepartmentUpdateManyWithWhereWithoutBranchInput | DepartmentUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
  }

  export type BranchCreateNestedOneWithoutDepartmentsInput = {
    create?: XOR<BranchCreateWithoutDepartmentsInput, BranchUncheckedCreateWithoutDepartmentsInput>
    connectOrCreate?: BranchCreateOrConnectWithoutDepartmentsInput
    connect?: BranchWhereUniqueInput
  }

  export type BranchUpdateOneRequiredWithoutDepartmentsNestedInput = {
    create?: XOR<BranchCreateWithoutDepartmentsInput, BranchUncheckedCreateWithoutDepartmentsInput>
    connectOrCreate?: BranchCreateOrConnectWithoutDepartmentsInput
    upsert?: BranchUpsertWithoutDepartmentsInput
    connect?: BranchWhereUniqueInput
    update?: XOR<XOR<BranchUpdateToOneWithWhereWithoutDepartmentsInput, BranchUpdateWithoutDepartmentsInput>, BranchUncheckedUpdateWithoutDepartmentsInput>
  }

  export type TransactionCreateNestedManyWithoutCustomerInput = {
    create?: XOR<TransactionCreateWithoutCustomerInput, TransactionUncheckedCreateWithoutCustomerInput> | TransactionCreateWithoutCustomerInput[] | TransactionUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutCustomerInput | TransactionCreateOrConnectWithoutCustomerInput[]
    createMany?: TransactionCreateManyCustomerInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type PendingApprovalCreateNestedManyWithoutCustomerInput = {
    create?: XOR<PendingApprovalCreateWithoutCustomerInput, PendingApprovalUncheckedCreateWithoutCustomerInput> | PendingApprovalCreateWithoutCustomerInput[] | PendingApprovalUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: PendingApprovalCreateOrConnectWithoutCustomerInput | PendingApprovalCreateOrConnectWithoutCustomerInput[]
    createMany?: PendingApprovalCreateManyCustomerInputEnvelope
    connect?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
  }

  export type TransactionUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<TransactionCreateWithoutCustomerInput, TransactionUncheckedCreateWithoutCustomerInput> | TransactionCreateWithoutCustomerInput[] | TransactionUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutCustomerInput | TransactionCreateOrConnectWithoutCustomerInput[]
    createMany?: TransactionCreateManyCustomerInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type PendingApprovalUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<PendingApprovalCreateWithoutCustomerInput, PendingApprovalUncheckedCreateWithoutCustomerInput> | PendingApprovalCreateWithoutCustomerInput[] | PendingApprovalUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: PendingApprovalCreateOrConnectWithoutCustomerInput | PendingApprovalCreateOrConnectWithoutCustomerInput[]
    createMany?: PendingApprovalCreateManyCustomerInputEnvelope
    connect?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
  }

  export type TransactionUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<TransactionCreateWithoutCustomerInput, TransactionUncheckedCreateWithoutCustomerInput> | TransactionCreateWithoutCustomerInput[] | TransactionUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutCustomerInput | TransactionCreateOrConnectWithoutCustomerInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutCustomerInput | TransactionUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: TransactionCreateManyCustomerInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutCustomerInput | TransactionUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutCustomerInput | TransactionUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type PendingApprovalUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<PendingApprovalCreateWithoutCustomerInput, PendingApprovalUncheckedCreateWithoutCustomerInput> | PendingApprovalCreateWithoutCustomerInput[] | PendingApprovalUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: PendingApprovalCreateOrConnectWithoutCustomerInput | PendingApprovalCreateOrConnectWithoutCustomerInput[]
    upsert?: PendingApprovalUpsertWithWhereUniqueWithoutCustomerInput | PendingApprovalUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: PendingApprovalCreateManyCustomerInputEnvelope
    set?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
    disconnect?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
    delete?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
    connect?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
    update?: PendingApprovalUpdateWithWhereUniqueWithoutCustomerInput | PendingApprovalUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: PendingApprovalUpdateManyWithWhereWithoutCustomerInput | PendingApprovalUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: PendingApprovalScalarWhereInput | PendingApprovalScalarWhereInput[]
  }

  export type TransactionUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<TransactionCreateWithoutCustomerInput, TransactionUncheckedCreateWithoutCustomerInput> | TransactionCreateWithoutCustomerInput[] | TransactionUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutCustomerInput | TransactionCreateOrConnectWithoutCustomerInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutCustomerInput | TransactionUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: TransactionCreateManyCustomerInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutCustomerInput | TransactionUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutCustomerInput | TransactionUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type PendingApprovalUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<PendingApprovalCreateWithoutCustomerInput, PendingApprovalUncheckedCreateWithoutCustomerInput> | PendingApprovalCreateWithoutCustomerInput[] | PendingApprovalUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: PendingApprovalCreateOrConnectWithoutCustomerInput | PendingApprovalCreateOrConnectWithoutCustomerInput[]
    upsert?: PendingApprovalUpsertWithWhereUniqueWithoutCustomerInput | PendingApprovalUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: PendingApprovalCreateManyCustomerInputEnvelope
    set?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
    disconnect?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
    delete?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
    connect?: PendingApprovalWhereUniqueInput | PendingApprovalWhereUniqueInput[]
    update?: PendingApprovalUpdateWithWhereUniqueWithoutCustomerInput | PendingApprovalUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: PendingApprovalUpdateManyWithWhereWithoutCustomerInput | PendingApprovalUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: PendingApprovalScalarWhereInput | PendingApprovalScalarWhereInput[]
  }

  export type CustomerCreateNestedOneWithoutApprovalsInput = {
    create?: XOR<CustomerCreateWithoutApprovalsInput, CustomerUncheckedCreateWithoutApprovalsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutApprovalsInput
    connect?: CustomerWhereUniqueInput
  }

  export type CustomerUpdateOneRequiredWithoutApprovalsNestedInput = {
    create?: XOR<CustomerCreateWithoutApprovalsInput, CustomerUncheckedCreateWithoutApprovalsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutApprovalsInput
    upsert?: CustomerUpsertWithoutApprovalsInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutApprovalsInput, CustomerUpdateWithoutApprovalsInput>, CustomerUncheckedUpdateWithoutApprovalsInput>
  }

  export type CustomerCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<CustomerCreateWithoutTransactionsInput, CustomerUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutTransactionsInput
    connect?: CustomerWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type CustomerUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<CustomerCreateWithoutTransactionsInput, CustomerUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutTransactionsInput
    upsert?: CustomerUpsertWithoutTransactionsInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutTransactionsInput, CustomerUpdateWithoutTransactionsInput>, CustomerUncheckedUpdateWithoutTransactionsInput>
  }

  export type UserSecurityCreateNestedManyWithoutSecurityQuestionInput = {
    create?: XOR<UserSecurityCreateWithoutSecurityQuestionInput, UserSecurityUncheckedCreateWithoutSecurityQuestionInput> | UserSecurityCreateWithoutSecurityQuestionInput[] | UserSecurityUncheckedCreateWithoutSecurityQuestionInput[]
    connectOrCreate?: UserSecurityCreateOrConnectWithoutSecurityQuestionInput | UserSecurityCreateOrConnectWithoutSecurityQuestionInput[]
    createMany?: UserSecurityCreateManySecurityQuestionInputEnvelope
    connect?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
  }

  export type UserSecurityUncheckedCreateNestedManyWithoutSecurityQuestionInput = {
    create?: XOR<UserSecurityCreateWithoutSecurityQuestionInput, UserSecurityUncheckedCreateWithoutSecurityQuestionInput> | UserSecurityCreateWithoutSecurityQuestionInput[] | UserSecurityUncheckedCreateWithoutSecurityQuestionInput[]
    connectOrCreate?: UserSecurityCreateOrConnectWithoutSecurityQuestionInput | UserSecurityCreateOrConnectWithoutSecurityQuestionInput[]
    createMany?: UserSecurityCreateManySecurityQuestionInputEnvelope
    connect?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
  }

  export type UserSecurityUpdateManyWithoutSecurityQuestionNestedInput = {
    create?: XOR<UserSecurityCreateWithoutSecurityQuestionInput, UserSecurityUncheckedCreateWithoutSecurityQuestionInput> | UserSecurityCreateWithoutSecurityQuestionInput[] | UserSecurityUncheckedCreateWithoutSecurityQuestionInput[]
    connectOrCreate?: UserSecurityCreateOrConnectWithoutSecurityQuestionInput | UserSecurityCreateOrConnectWithoutSecurityQuestionInput[]
    upsert?: UserSecurityUpsertWithWhereUniqueWithoutSecurityQuestionInput | UserSecurityUpsertWithWhereUniqueWithoutSecurityQuestionInput[]
    createMany?: UserSecurityCreateManySecurityQuestionInputEnvelope
    set?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
    disconnect?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
    delete?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
    connect?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
    update?: UserSecurityUpdateWithWhereUniqueWithoutSecurityQuestionInput | UserSecurityUpdateWithWhereUniqueWithoutSecurityQuestionInput[]
    updateMany?: UserSecurityUpdateManyWithWhereWithoutSecurityQuestionInput | UserSecurityUpdateManyWithWhereWithoutSecurityQuestionInput[]
    deleteMany?: UserSecurityScalarWhereInput | UserSecurityScalarWhereInput[]
  }

  export type UserSecurityUncheckedUpdateManyWithoutSecurityQuestionNestedInput = {
    create?: XOR<UserSecurityCreateWithoutSecurityQuestionInput, UserSecurityUncheckedCreateWithoutSecurityQuestionInput> | UserSecurityCreateWithoutSecurityQuestionInput[] | UserSecurityUncheckedCreateWithoutSecurityQuestionInput[]
    connectOrCreate?: UserSecurityCreateOrConnectWithoutSecurityQuestionInput | UserSecurityCreateOrConnectWithoutSecurityQuestionInput[]
    upsert?: UserSecurityUpsertWithWhereUniqueWithoutSecurityQuestionInput | UserSecurityUpsertWithWhereUniqueWithoutSecurityQuestionInput[]
    createMany?: UserSecurityCreateManySecurityQuestionInputEnvelope
    set?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
    disconnect?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
    delete?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
    connect?: UserSecurityWhereUniqueInput | UserSecurityWhereUniqueInput[]
    update?: UserSecurityUpdateWithWhereUniqueWithoutSecurityQuestionInput | UserSecurityUpdateWithWhereUniqueWithoutSecurityQuestionInput[]
    updateMany?: UserSecurityUpdateManyWithWhereWithoutSecurityQuestionInput | UserSecurityUpdateManyWithWhereWithoutSecurityQuestionInput[]
    deleteMany?: UserSecurityScalarWhereInput | UserSecurityScalarWhereInput[]
  }

  export type SecurityQuestionCreateNestedOneWithoutUserSecuritiesInput = {
    create?: XOR<SecurityQuestionCreateWithoutUserSecuritiesInput, SecurityQuestionUncheckedCreateWithoutUserSecuritiesInput>
    connectOrCreate?: SecurityQuestionCreateOrConnectWithoutUserSecuritiesInput
    connect?: SecurityQuestionWhereUniqueInput
  }

  export type SecurityQuestionUpdateOneWithoutUserSecuritiesNestedInput = {
    create?: XOR<SecurityQuestionCreateWithoutUserSecuritiesInput, SecurityQuestionUncheckedCreateWithoutUserSecuritiesInput>
    connectOrCreate?: SecurityQuestionCreateOrConnectWithoutUserSecuritiesInput
    upsert?: SecurityQuestionUpsertWithoutUserSecuritiesInput
    disconnect?: SecurityQuestionWhereInput | boolean
    delete?: SecurityQuestionWhereInput | boolean
    connect?: SecurityQuestionWhereUniqueInput
    update?: XOR<XOR<SecurityQuestionUpdateToOneWithWhereWithoutUserSecuritiesInput, SecurityQuestionUpdateWithoutUserSecuritiesInput>, SecurityQuestionUncheckedUpdateWithoutUserSecuritiesInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DepartmentCreateWithoutBranchInput = {
    id: string
    name: string
    createdAt?: Date | string
  }

  export type DepartmentUncheckedCreateWithoutBranchInput = {
    id: string
    name: string
    createdAt?: Date | string
  }

  export type DepartmentCreateOrConnectWithoutBranchInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutBranchInput, DepartmentUncheckedCreateWithoutBranchInput>
  }

  export type DepartmentCreateManyBranchInputEnvelope = {
    data: DepartmentCreateManyBranchInput | DepartmentCreateManyBranchInput[]
  }

  export type DepartmentUpsertWithWhereUniqueWithoutBranchInput = {
    where: DepartmentWhereUniqueInput
    update: XOR<DepartmentUpdateWithoutBranchInput, DepartmentUncheckedUpdateWithoutBranchInput>
    create: XOR<DepartmentCreateWithoutBranchInput, DepartmentUncheckedCreateWithoutBranchInput>
  }

  export type DepartmentUpdateWithWhereUniqueWithoutBranchInput = {
    where: DepartmentWhereUniqueInput
    data: XOR<DepartmentUpdateWithoutBranchInput, DepartmentUncheckedUpdateWithoutBranchInput>
  }

  export type DepartmentUpdateManyWithWhereWithoutBranchInput = {
    where: DepartmentScalarWhereInput
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyWithoutBranchInput>
  }

  export type DepartmentScalarWhereInput = {
    AND?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
    OR?: DepartmentScalarWhereInput[]
    NOT?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
    id?: StringFilter<"Department"> | string
    name?: StringFilter<"Department"> | string
    branchId?: StringFilter<"Department"> | string
    createdAt?: DateTimeFilter<"Department"> | Date | string
  }

  export type BranchCreateWithoutDepartmentsInput = {
    id: string
    name: string
    location: string
    createdAt?: Date | string
  }

  export type BranchUncheckedCreateWithoutDepartmentsInput = {
    id: string
    name: string
    location: string
    createdAt?: Date | string
  }

  export type BranchCreateOrConnectWithoutDepartmentsInput = {
    where: BranchWhereUniqueInput
    create: XOR<BranchCreateWithoutDepartmentsInput, BranchUncheckedCreateWithoutDepartmentsInput>
  }

  export type BranchUpsertWithoutDepartmentsInput = {
    update: XOR<BranchUpdateWithoutDepartmentsInput, BranchUncheckedUpdateWithoutDepartmentsInput>
    create: XOR<BranchCreateWithoutDepartmentsInput, BranchUncheckedCreateWithoutDepartmentsInput>
    where?: BranchWhereInput
  }

  export type BranchUpdateToOneWithWhereWithoutDepartmentsInput = {
    where?: BranchWhereInput
    data: XOR<BranchUpdateWithoutDepartmentsInput, BranchUncheckedUpdateWithoutDepartmentsInput>
  }

  export type BranchUpdateWithoutDepartmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BranchUncheckedUpdateWithoutDepartmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCreateWithoutCustomerInput = {
    id?: string
    amount: number
    fee: number
    status: string
    timestamp?: Date | string
    type: string
    channel: string
    from_account?: string | null
    to_account?: string | null
    is_anomalous?: boolean
    anomaly_reason?: string | null
  }

  export type TransactionUncheckedCreateWithoutCustomerInput = {
    id?: string
    amount: number
    fee: number
    status: string
    timestamp?: Date | string
    type: string
    channel: string
    from_account?: string | null
    to_account?: string | null
    is_anomalous?: boolean
    anomaly_reason?: string | null
  }

  export type TransactionCreateOrConnectWithoutCustomerInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutCustomerInput, TransactionUncheckedCreateWithoutCustomerInput>
  }

  export type TransactionCreateManyCustomerInputEnvelope = {
    data: TransactionCreateManyCustomerInput | TransactionCreateManyCustomerInput[]
  }

  export type PendingApprovalCreateWithoutCustomerInput = {
    type: string
    requestedAt?: Date | string
    customerName: string
    customerPhone: string
    details?: string | null
    status?: string
  }

  export type PendingApprovalUncheckedCreateWithoutCustomerInput = {
    id?: number
    type: string
    requestedAt?: Date | string
    customerName: string
    customerPhone: string
    details?: string | null
    status?: string
  }

  export type PendingApprovalCreateOrConnectWithoutCustomerInput = {
    where: PendingApprovalWhereUniqueInput
    create: XOR<PendingApprovalCreateWithoutCustomerInput, PendingApprovalUncheckedCreateWithoutCustomerInput>
  }

  export type PendingApprovalCreateManyCustomerInputEnvelope = {
    data: PendingApprovalCreateManyCustomerInput | PendingApprovalCreateManyCustomerInput[]
  }

  export type TransactionUpsertWithWhereUniqueWithoutCustomerInput = {
    where: TransactionWhereUniqueInput
    update: XOR<TransactionUpdateWithoutCustomerInput, TransactionUncheckedUpdateWithoutCustomerInput>
    create: XOR<TransactionCreateWithoutCustomerInput, TransactionUncheckedCreateWithoutCustomerInput>
  }

  export type TransactionUpdateWithWhereUniqueWithoutCustomerInput = {
    where: TransactionWhereUniqueInput
    data: XOR<TransactionUpdateWithoutCustomerInput, TransactionUncheckedUpdateWithoutCustomerInput>
  }

  export type TransactionUpdateManyWithWhereWithoutCustomerInput = {
    where: TransactionScalarWhereInput
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyWithoutCustomerInput>
  }

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    OR?: TransactionScalarWhereInput[]
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    id?: StringFilter<"Transaction"> | string
    customerId?: IntFilter<"Transaction"> | number
    amount?: FloatFilter<"Transaction"> | number
    fee?: FloatFilter<"Transaction"> | number
    status?: StringFilter<"Transaction"> | string
    timestamp?: DateTimeFilter<"Transaction"> | Date | string
    type?: StringFilter<"Transaction"> | string
    channel?: StringFilter<"Transaction"> | string
    from_account?: StringNullableFilter<"Transaction"> | string | null
    to_account?: StringNullableFilter<"Transaction"> | string | null
    is_anomalous?: BoolFilter<"Transaction"> | boolean
    anomaly_reason?: StringNullableFilter<"Transaction"> | string | null
  }

  export type PendingApprovalUpsertWithWhereUniqueWithoutCustomerInput = {
    where: PendingApprovalWhereUniqueInput
    update: XOR<PendingApprovalUpdateWithoutCustomerInput, PendingApprovalUncheckedUpdateWithoutCustomerInput>
    create: XOR<PendingApprovalCreateWithoutCustomerInput, PendingApprovalUncheckedCreateWithoutCustomerInput>
  }

  export type PendingApprovalUpdateWithWhereUniqueWithoutCustomerInput = {
    where: PendingApprovalWhereUniqueInput
    data: XOR<PendingApprovalUpdateWithoutCustomerInput, PendingApprovalUncheckedUpdateWithoutCustomerInput>
  }

  export type PendingApprovalUpdateManyWithWhereWithoutCustomerInput = {
    where: PendingApprovalScalarWhereInput
    data: XOR<PendingApprovalUpdateManyMutationInput, PendingApprovalUncheckedUpdateManyWithoutCustomerInput>
  }

  export type PendingApprovalScalarWhereInput = {
    AND?: PendingApprovalScalarWhereInput | PendingApprovalScalarWhereInput[]
    OR?: PendingApprovalScalarWhereInput[]
    NOT?: PendingApprovalScalarWhereInput | PendingApprovalScalarWhereInput[]
    id?: IntFilter<"PendingApproval"> | number
    customerId?: IntFilter<"PendingApproval"> | number
    type?: StringFilter<"PendingApproval"> | string
    requestedAt?: DateTimeFilter<"PendingApproval"> | Date | string
    customerName?: StringFilter<"PendingApproval"> | string
    customerPhone?: StringFilter<"PendingApproval"> | string
    details?: StringNullableFilter<"PendingApproval"> | string | null
    status?: StringFilter<"PendingApproval"> | string
  }

  export type CustomerCreateWithoutApprovalsInput = {
    name: string
    phone: string
    status: string
    registeredAt?: Date | string
    transactions?: TransactionCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutApprovalsInput = {
    id?: number
    name: string
    phone: string
    status: string
    registeredAt?: Date | string
    transactions?: TransactionUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutApprovalsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutApprovalsInput, CustomerUncheckedCreateWithoutApprovalsInput>
  }

  export type CustomerUpsertWithoutApprovalsInput = {
    update: XOR<CustomerUpdateWithoutApprovalsInput, CustomerUncheckedUpdateWithoutApprovalsInput>
    create: XOR<CustomerCreateWithoutApprovalsInput, CustomerUncheckedCreateWithoutApprovalsInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutApprovalsInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutApprovalsInput, CustomerUncheckedUpdateWithoutApprovalsInput>
  }

  export type CustomerUpdateWithoutApprovalsInput = {
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: TransactionUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutApprovalsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: TransactionUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerCreateWithoutTransactionsInput = {
    name: string
    phone: string
    status: string
    registeredAt?: Date | string
    approvals?: PendingApprovalCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutTransactionsInput = {
    id?: number
    name: string
    phone: string
    status: string
    registeredAt?: Date | string
    approvals?: PendingApprovalUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutTransactionsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutTransactionsInput, CustomerUncheckedCreateWithoutTransactionsInput>
  }

  export type CustomerUpsertWithoutTransactionsInput = {
    update: XOR<CustomerUpdateWithoutTransactionsInput, CustomerUncheckedUpdateWithoutTransactionsInput>
    create: XOR<CustomerCreateWithoutTransactionsInput, CustomerUncheckedCreateWithoutTransactionsInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutTransactionsInput, CustomerUncheckedUpdateWithoutTransactionsInput>
  }

  export type CustomerUpdateWithoutTransactionsInput = {
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    approvals?: PendingApprovalUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutTransactionsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    approvals?: PendingApprovalUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type UserSecurityCreateWithoutSecurityQuestionInput = {
    Id?: string
    UserId: string
    CIFNumber: string
    Status: string
    PinHash?: string | null
    PasswordHash?: string | null
    SecurityAnswer?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type UserSecurityUncheckedCreateWithoutSecurityQuestionInput = {
    Id?: string
    UserId: string
    CIFNumber: string
    Status: string
    PinHash?: string | null
    PasswordHash?: string | null
    SecurityAnswer?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type UserSecurityCreateOrConnectWithoutSecurityQuestionInput = {
    where: UserSecurityWhereUniqueInput
    create: XOR<UserSecurityCreateWithoutSecurityQuestionInput, UserSecurityUncheckedCreateWithoutSecurityQuestionInput>
  }

  export type UserSecurityCreateManySecurityQuestionInputEnvelope = {
    data: UserSecurityCreateManySecurityQuestionInput | UserSecurityCreateManySecurityQuestionInput[]
  }

  export type UserSecurityUpsertWithWhereUniqueWithoutSecurityQuestionInput = {
    where: UserSecurityWhereUniqueInput
    update: XOR<UserSecurityUpdateWithoutSecurityQuestionInput, UserSecurityUncheckedUpdateWithoutSecurityQuestionInput>
    create: XOR<UserSecurityCreateWithoutSecurityQuestionInput, UserSecurityUncheckedCreateWithoutSecurityQuestionInput>
  }

  export type UserSecurityUpdateWithWhereUniqueWithoutSecurityQuestionInput = {
    where: UserSecurityWhereUniqueInput
    data: XOR<UserSecurityUpdateWithoutSecurityQuestionInput, UserSecurityUncheckedUpdateWithoutSecurityQuestionInput>
  }

  export type UserSecurityUpdateManyWithWhereWithoutSecurityQuestionInput = {
    where: UserSecurityScalarWhereInput
    data: XOR<UserSecurityUpdateManyMutationInput, UserSecurityUncheckedUpdateManyWithoutSecurityQuestionInput>
  }

  export type UserSecurityScalarWhereInput = {
    AND?: UserSecurityScalarWhereInput | UserSecurityScalarWhereInput[]
    OR?: UserSecurityScalarWhereInput[]
    NOT?: UserSecurityScalarWhereInput | UserSecurityScalarWhereInput[]
    Id?: StringFilter<"UserSecurity"> | string
    UserId?: StringFilter<"UserSecurity"> | string
    CIFNumber?: StringFilter<"UserSecurity"> | string
    Status?: StringFilter<"UserSecurity"> | string
    PinHash?: StringNullableFilter<"UserSecurity"> | string | null
    PasswordHash?: StringNullableFilter<"UserSecurity"> | string | null
    SecurityQuestionId?: StringNullableFilter<"UserSecurity"> | string | null
    SecurityAnswer?: StringNullableFilter<"UserSecurity"> | string | null
    InsertDate?: DateTimeFilter<"UserSecurity"> | Date | string
    UpdateDate?: DateTimeFilter<"UserSecurity"> | Date | string
  }

  export type SecurityQuestionCreateWithoutUserSecuritiesInput = {
    Id?: string
    Question: string
  }

  export type SecurityQuestionUncheckedCreateWithoutUserSecuritiesInput = {
    Id?: string
    Question: string
  }

  export type SecurityQuestionCreateOrConnectWithoutUserSecuritiesInput = {
    where: SecurityQuestionWhereUniqueInput
    create: XOR<SecurityQuestionCreateWithoutUserSecuritiesInput, SecurityQuestionUncheckedCreateWithoutUserSecuritiesInput>
  }

  export type SecurityQuestionUpsertWithoutUserSecuritiesInput = {
    update: XOR<SecurityQuestionUpdateWithoutUserSecuritiesInput, SecurityQuestionUncheckedUpdateWithoutUserSecuritiesInput>
    create: XOR<SecurityQuestionCreateWithoutUserSecuritiesInput, SecurityQuestionUncheckedCreateWithoutUserSecuritiesInput>
    where?: SecurityQuestionWhereInput
  }

  export type SecurityQuestionUpdateToOneWithWhereWithoutUserSecuritiesInput = {
    where?: SecurityQuestionWhereInput
    data: XOR<SecurityQuestionUpdateWithoutUserSecuritiesInput, SecurityQuestionUncheckedUpdateWithoutUserSecuritiesInput>
  }

  export type SecurityQuestionUpdateWithoutUserSecuritiesInput = {
    Id?: StringFieldUpdateOperationsInput | string
    Question?: StringFieldUpdateOperationsInput | string
  }

  export type SecurityQuestionUncheckedUpdateWithoutUserSecuritiesInput = {
    Id?: StringFieldUpdateOperationsInput | string
    Question?: StringFieldUpdateOperationsInput | string
  }

  export type DepartmentCreateManyBranchInput = {
    id: string
    name: string
    createdAt?: Date | string
  }

  export type DepartmentUpdateWithoutBranchInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DepartmentUncheckedUpdateWithoutBranchInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DepartmentUncheckedUpdateManyWithoutBranchInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCreateManyCustomerInput = {
    id?: string
    amount: number
    fee: number
    status: string
    timestamp?: Date | string
    type: string
    channel: string
    from_account?: string | null
    to_account?: string | null
    is_anomalous?: boolean
    anomaly_reason?: string | null
  }

  export type PendingApprovalCreateManyCustomerInput = {
    id?: number
    type: string
    requestedAt?: Date | string
    customerName: string
    customerPhone: string
    details?: string | null
    status?: string
  }

  export type TransactionUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    fee?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    from_account?: NullableStringFieldUpdateOperationsInput | string | null
    to_account?: NullableStringFieldUpdateOperationsInput | string | null
    is_anomalous?: BoolFieldUpdateOperationsInput | boolean
    anomaly_reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionUncheckedUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    fee?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    from_account?: NullableStringFieldUpdateOperationsInput | string | null
    to_account?: NullableStringFieldUpdateOperationsInput | string | null
    is_anomalous?: BoolFieldUpdateOperationsInput | boolean
    anomaly_reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionUncheckedUpdateManyWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    fee?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    from_account?: NullableStringFieldUpdateOperationsInput | string | null
    to_account?: NullableStringFieldUpdateOperationsInput | string | null
    is_anomalous?: BoolFieldUpdateOperationsInput | boolean
    anomaly_reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PendingApprovalUpdateWithoutCustomerInput = {
    type?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
  }

  export type PendingApprovalUncheckedUpdateWithoutCustomerInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
  }

  export type PendingApprovalUncheckedUpdateManyWithoutCustomerInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
  }

  export type UserSecurityCreateManySecurityQuestionInput = {
    Id?: string
    UserId: string
    CIFNumber: string
    Status: string
    PinHash?: string | null
    PasswordHash?: string | null
    SecurityAnswer?: string | null
    InsertDate?: Date | string
    UpdateDate?: Date | string
  }

  export type UserSecurityUpdateWithoutSecurityQuestionInput = {
    Id?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    PinHash?: NullableStringFieldUpdateOperationsInput | string | null
    PasswordHash?: NullableStringFieldUpdateOperationsInput | string | null
    SecurityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecurityUncheckedUpdateWithoutSecurityQuestionInput = {
    Id?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    PinHash?: NullableStringFieldUpdateOperationsInput | string | null
    PasswordHash?: NullableStringFieldUpdateOperationsInput | string | null
    SecurityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecurityUncheckedUpdateManyWithoutSecurityQuestionInput = {
    Id?: StringFieldUpdateOperationsInput | string
    UserId?: StringFieldUpdateOperationsInput | string
    CIFNumber?: StringFieldUpdateOperationsInput | string
    Status?: StringFieldUpdateOperationsInput | string
    PinHash?: NullableStringFieldUpdateOperationsInput | string | null
    PasswordHash?: NullableStringFieldUpdateOperationsInput | string | null
    SecurityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    InsertDate?: DateTimeFieldUpdateOperationsInput | Date | string
    UpdateDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use BranchCountOutputTypeDefaultArgs instead
     */
    export type BranchCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BranchCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CustomerCountOutputTypeDefaultArgs instead
     */
    export type CustomerCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CustomerCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SecurityQuestionCountOutputTypeDefaultArgs instead
     */
    export type SecurityQuestionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SecurityQuestionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RoleDefaultArgs instead
     */
    export type RoleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RoleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BranchDefaultArgs instead
     */
    export type BranchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BranchDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DepartmentDefaultArgs instead
     */
    export type DepartmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DepartmentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CustomerDefaultArgs instead
     */
    export type CustomerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CustomerDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PendingApprovalDefaultArgs instead
     */
    export type PendingApprovalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PendingApprovalDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TransactionDefaultArgs instead
     */
    export type TransactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TransactionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AppUserDefaultArgs instead
     */
    export type AppUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AppUserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AccountDefaultArgs instead
     */
    export type AccountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AccountDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SecurityQuestionDefaultArgs instead
     */
    export type SecurityQuestionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SecurityQuestionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserSecurityDefaultArgs instead
     */
    export type UserSecurityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserSecurityDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CorporateDefaultArgs instead
     */
    export type CorporateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CorporateDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MiniAppDefaultArgs instead
     */
    export type MiniAppArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MiniAppDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OtpCodeDefaultArgs instead
     */
    export type OtpCodeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OtpCodeDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}