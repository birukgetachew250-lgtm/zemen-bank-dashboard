
// A central place to manage environment variables.

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const config = {
    security: {
        encryptionMasterKey: process.env.ENCRYPTION_MASTER_KEY,
    }
};

export default config;
