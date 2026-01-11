
// A central place to manage environment variables.

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const config = {
    security: {
        encryptionMasterKey: process.env.ENCRYPTION_MASTER_KEY,
    },
    db: {
      isProduction: !!process.env.DASH_MODULE_PROD_DATABASE_URL,
    },
    grpc: {
        url: process.env.GRPC_URL || 'localhost:50051'
    }
};

export default config;

