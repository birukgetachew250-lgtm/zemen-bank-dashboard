
// A central place to manage environment variables.

// Load environment variables
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_CONNECT_STRING = process.env.DB_CONNECT_STRING;
const GRPC_URL = process.env.GRPC_URL;
const ENCRYPTION_MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY;


// Parse boolean flags
const IS_PRODUCTION_DB = process.env.IS_PRODUCTION_DB === 'true';
const IS_PRODUCTION_GRPC = process.env.IS_PRODUCTION_GRPC === 'true';

const config = {
    db: {
        isProduction: IS_PRODUCTION_DB,
        user: DB_USER,
        password: DB_PASSWORD,
        connectString: DB_CONNECT_STRING,
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
