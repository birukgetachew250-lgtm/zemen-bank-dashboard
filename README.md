# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Running Locally

To get the application running on your local machine, follow these steps:

1.  **Install Dependencies**: Open your terminal in the project root and run the following command to install all the necessary packages.

    ```bash
    npm install
    ```

2.  **Seed the Database**: The application uses a local SQLite database for development. Run the seed script to create the `zemen.db` file and populate it with initial mock data.

    ```bash
    npm run seed
    ```

3.  **Start the Development Server**: Once the dependencies are installed and the database is seeded, you can start the local development server.

    ```bash
    npm run dev
    ```

Your application should now be running at `http://localhost:3000`.
