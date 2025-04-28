# Angular 18 Project - Configuration and API Endpoint Management

This document provides comprehensive instructions on how to configure and manage API endpoints within this Angular 18 project.  This allows you to easily switch between different backend API installations for development, testing, and production environments.

## Project Setup

1.  **Clone the repository:**

    ```
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

2.  **Install dependencies:**

    ```
    npm install
    ```

## Configuration - Environment Files

Angular projects utilize environment-specific configuration files to manage settings that vary between deployments.  These files are located in the `src/environments/` directory.

**Key Files:**

* `environment.ts`:  The default configuration file used for development.
* `environment.prod.ts`:  The configuration file used for production builds.

**File Structure and Contents**

Each environment file exports a constant object named `environment`.  This object contains key-value pairs representing the application's configuration.  A crucial key is `restRoot`, which defines the base URL of your backend API.

**Example `environment.ts`:**

```
export const environment = {
    production: false,
    restRoot: 'http://localhost:3000/api',  //  Development API URL
    otherSetting: 'some-value'
};
```

## Modifying the API URL

To change the API endpoint, you need to modify the apiUrl property within the appropriate environment file.

**For development:**
*   Open the src/environments/environment.development.ts file.
*   Locate the "restRoot" property.
*   Replace the existing value with the URL of your development API server.

**For production:**

*   Open the src/environments/environment.ts file.
*   Locate the "restRoot" property.
*   Replace the value with the URL of your production API server.

**Running with Different API Endpoints:**
Angular's build process allows you to specify which environment configuration to use.  This enables you to run the application with different API endpoints without manually changing the environment.ts file every time.

Using the --configuration Flag
*   For development use:
    ```
        ng s --configuration development
            or
        ng s

    ```
*   For production use:
    ```
        ng s --configuration production
    ```

## Updating Help Documentation

Help documentation is created in a Google Document.  From this document we export it as a PDF File and save it to this repository and modify the environment.ts files.
```
cp {path_to_documentation_downloaded} {root folder}/public/docs/helpDocumentationv2.pdf
src/environments/environment.ts:    documentationUrl: '/docs/helpDocumentationv2.pdf'
src/environments/environment.development.ts:	documentationUrl: '/docs/helpDocumentationv2.pdf'
```
