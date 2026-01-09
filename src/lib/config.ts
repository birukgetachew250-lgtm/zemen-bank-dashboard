
// A central place to manage environment variables.

// Load environment variables
const USER_MODULE_DB_CONNECTION_STRING = process.env.USER_MODULE_DB_CONNECTION_STRING;
const SECURITY_MODULE_DB_CONNECTION_STRING = process.env.SECURITY_MODULE_DB_CONNECTION_STRING;
const GRPC_URL = process.env.GRPC_URL;
const ENCRYPTION_MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY;


// Parse boolean flags
const IS_PRODUCTION_DB = process.env.IS_PRODUCTION_DB === 'true';
const IS_PRODUCTION_GRPC = process.env.IS_PRODUCTION_GRPC === 'true';

const config = {
    db: {
        isProduction: IS_PRODUCTION_DB,
        // Specific connection strings for different modules
        userModuleConnectString: USER_MODULE_DB_CONNECTION_STRING,
        securityModuleConnectString: SECURITY_MODULE_DB_CONNECTION_STRING,
    },
    grpc: {
        isProduction: IS_PRODUCTION_GRPC,
        url: GRPC_URL,
    },
    security: {
        encryptionMasterKey: ENCRYPTION_MASTER_KEY,
    }
};

export default config;
