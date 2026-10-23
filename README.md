# MovieVerse Client

The MovieVerse Client is a public-facing React application designed for movie exploration, title searches, content reviews, user profile management, and organization of favorites and watchlists.

## Technology Stack

The application is built using the following technologies: React, Vite, React Router, Axios, Tailwind CSS, and Lucide.

## Project Structure

- **`src/api`**: Contains the Axios instance for API interactions.
- **`components`**: Organizes reusable UI components for consistent design across the application.
- **`context`**: Manages shared state for session data, theme preferences, toast notifications, and storefront data.
- **`pages`**: Consists of screens mapped to various application routes.
- **`routes`**: Handles authentication and authorization protocols.
- **`utils`**: Provides utility functions for general application needs.

## Available Commands

To manage the project, the following terminal commands can be executed:

```bash
npm install          # Install dependencies
npm run dev          # Start the development server
npm run lint         # Run linters for code quality checks
npm run build        # Build the application for production
npm run preview      # Preview the built application
```

## Environment Variables

Specify the following environment variable in the `.env` file:

```env
VITE_API_ORIGIN=http://localhost:5000
```

The default local development origin is set to `http://localhost:5000`, which is later adjusted for production environments. Ensure that no sensitive server information is exposed in Vite environment variables.
