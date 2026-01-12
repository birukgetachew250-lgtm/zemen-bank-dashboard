






























# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Running Locally

To get the application running on your local machine, follow these steps:

1.  **Install Dependencies**: Open your terminal in the project root and run the following command to install all the necessary packages.

    ```bash
    npm install
    ```

2. **Run Database Migrations**: This project uses a database for the main dashboard. You must run the migration command to create the necessary tables.

    ```bash
    # Migrate the main dashboard database (users, roles, etc.)
    npm run migrate:dev
    ```

3.  **Seed the Databases**: The application uses a local SQLite database for development data. Run the seed script to create this file and populate it with initial mock data.

    ```bash
    npm run seed
    ```

4.  **Start the Development Server**: Once the dependencies are installed and the database is seeded, you can start the local development server.

    ```bash
    npm run dev
    ```

Your application should now be running at `http://localhost:3000`.

## Database Connection

The application is configured to work with two different database setups for the dashboard module:

-   **Development (Default)**: Uses a local SQLite file (`zemen.db`) managed via Prisma. The `npm run seed` command populates this file.
-   **Production**: Connects to a live PostgreSQL database for dashboard data. The connection string is specified in the `.env` file via `DASH_MODULE_PROD_DATABASE_URL`.

### Testing the Production Database Connection

If you are encountering database errors when running in production mode (e.g., with `npm run seed:prod`), you can test the connection to the Oracle database directly using a dedicated script.

1.  **Set Environment**: Ensure your `.env` file contains the correct connection string for `USER_MODULE_DB_CONNECTION_STRING`.
2.  **Run Test**: Execute the following command in your terminal.

    ```bash
    npm run test:db
    ```

This script will attempt to connect to the Oracle database using the credentials provided and will report either success or a detailed error message to help you diagnose the issue.

## Production Seeding (User Management)

To seed the initial admin users and roles into your **production** database (defined by `DATABASE_URL`), you must use a separate, dedicated script.

**Warning:** This is a potentially destructive operation. Ensure your `.env` variables are correctly set for a production environment before running. This script will not run if `NODE_ENV` is not set to `production`.

1.  **Set Environment**: Make sure your `.env` file contains the correct connection string for your production PostgreSQL instance in `DASH_MODULE_PROD_DATABASE_URL`.

2.  **Run Production Seed**: Execute the following command in your terminal.

    ```bash
    npm run seed:prod
    ```

This command will connect to your production database via Prisma and populate only the `User` and `Role` tables, leaving the rest of your production data untouched.
