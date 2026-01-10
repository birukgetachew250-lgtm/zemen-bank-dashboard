
// A central place to manage environment variables.

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const IS_PRODUCTION_DB = process.env.IS_PRODUCTION_DB === 'true';

const config = {
    db: {
        isProduction: IS_PRODUCTION_DB,
    },
    security: {
        encryptionMasterKey: process.env.ENCRYPTION_MASTER_KEY,
    }
};

export default config;
