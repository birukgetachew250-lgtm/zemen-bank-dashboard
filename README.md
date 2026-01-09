# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Running Locally

To get the application running on your local machine, follow these steps:

1.  **Install Dependencies**: Open your terminal in the project root and run the following command to install all the necessary packages.

    ```bash
    npm install
    ```

2.  **Seed the Development Database**: The application uses a local SQLite database (`zemen.db`) for development data (customers, transactions, etc.). Run the seed script to create this file and populate it with initial mock data.

    ```bash
    npm run seed
    ```

3.  **Start the Development Server**: Once the dependencies are installed and the database is seeded, you can start the local development server.

    ```bash
    npm run dev
    ```

Your application should now be running at `http://localhost:3000`.

## Database Connection

The application is configured to work with two different database setups:

-   **Development (Default)**: Uses a local SQLite file (`zemen.db`) managed via Prisma. The `npm run seed` command populates this file.
-   **Production**: Connects to a live Oracle database for core banking data. Connection strings are specified in the `.env` file.

### Testing the Production Database Connection

If you are encountering database errors when running in production mode (e.g., with `npm run seed:prod`), you can test the connection to the Oracle database directly using a dedicated script.

1.  **Set Environment**: Ensure your `.env` file contains the correct connection string for `USER_MODULE_DB_CONNECTION_STRING`.
2.  **Run Test**: Execute the following command in your terminal.

    ```bash
    npm run test:db
    ```

This script will attempt to connect to the Oracle database using the credentials provided and will report either success or a detailed error message to help you diagnose the issue.

## Production Seeding (User Management)

To seed the initial admin users and roles into your **production** database (defined by `DASH_PROD_MODULE_DATABASE_URL`), you must use a separate, dedicated script.

**Warning:** This is a potentially destructive operation. Ensure your `.env` variables are correctly set for a production environment before running. This script will not run if `NODE_ENV` is not set to `production`.

1.  **Set Environment**: Make sure your `.env` file contains the correct connection string for `DASH_PROD_MODULE_DATABASE_URL`.

2.  **Run Production Seed**: Execute the following command in your terminal.

    ```bash
    npm run seed:prod
    ```

This command will connect to your production Oracle database via Prisma and populate only the `User` and `Role` tables, leaving the rest of your production data untouched.
