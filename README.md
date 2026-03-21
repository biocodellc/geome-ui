# GEOME UI

[![Netlify Status](https://api.netlify.com/api/v1/badges/e165aa0a-4c9f-4cf8-9990-ad5c16939812/deploy-status)](https://app.netlify.com/projects/geome-db/deploys)

This document provides comprehensive instructions on how to configure and manage the GEOME UI. 

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

## Netlify Mapbox Token Setup

The UI map layer reads Mapbox token in this order:
1. `environment.mapboxToken`
2. Runtime variable from `/env.js` as `window.__env.MAPBOX_TOKEN`

If `environment.mapboxToken` is empty, configure Netlify to inject `MAPBOX_TOKEN` at build time.

1. In Netlify Site settings, add environment variable:
   - Name: `MAPBOX_TOKEN`
   - Value: your Mapbox public token (`pk...`)
   - `Contains secret values`: **unchecked** (this is a public browser token)

2. Use this build command in Netlify:

```bash
printf "window.__env = window.__env || {};\nwindow.__env.MAPBOX_TOKEN = '%s';\n" "$MAPBOX_TOKEN" > public/env.js && npm install && npm run build -- --configuration=production
```

Notes:
- `public/env.js` is loaded by `src/index.html`.
- Production builds currently use `src/environments/environment.ts`.

## Local Contexts Integration Setup

GEOME stores the Local Contexts Project identifier in the `localcontextsId` project field and renders the linked Local Contexts notices/labels on record detail pages.

### Recommended deployment setup

Use the Netlify function proxy added at `netlify/functions/local-contexts.js` so the Local Contexts API key stays server-side.

1. Make sure Netlify is using the repo root as the base directory.

2. In Netlify Site settings, confirm these build settings:
   - Build command: use the repo `netlify.toml` value, or keep an equivalent custom command that writes `public/env.js` before the Angular build
   - Publish directory: `dist/geome/browser`
   - Functions directory: `netlify/functions`

   These are also captured in `netlify.toml`. The included build command preserves the existing runtime Mapbox token injection and adds the Local Contexts runtime defaults.

3. In Netlify Site settings, keep or add environment variable:
   - Name: `MAPBOX_TOKEN`
   - Value: your public Mapbox browser token
   - `Contains secret values`: **unchecked**

4. In Netlify Site settings, add environment variable:
   - Name: `LOCAL_CONTEXTS_API_KEY`
   - Value: your Local Contexts integration partner API key
   - `Contains secret values`: **checked**

5. Optional environment variables:
   - Name: `LOCAL_CONTEXTS_API_BASE_URL`
   - Value: `https://localcontextshub.org/api`
   - Name: `LOCAL_CONTEXTS_PROJECT_PAGE_BASE_URL`
   - Value: `https://localcontextshub.org/projects`

6. Trigger a new deploy after saving the environment variables.

7. Verify the deployed site:
   - Open any GEOME record that belongs to a project with `localcontextsId` set.
   - In browser devtools, confirm the request goes to `/localcontexts-api/projects/<uuid>/?format=json&version=2.0`
   - Confirm the response is `200` and the record page shows Local Contexts cards instead of the fallback message.

No Angular code changes are needed after that. Requests to `/localcontexts-api/*` are rewritten through the Netlify function and then forwarded to the Local Contexts API.

### Local development

For local-only testing, set these values in an untracked `public/env.local.js` file:

```js
window.__env = window.__env || {};
window.__env.LOCAL_CONTEXTS_API_KEY = 'your-local-contexts-key';
window.__env.LOCAL_CONTEXTS_API_BASE_URL = 'https://localcontextshub.org/api';
```

Notes:
- `public/env.local.js` is ignored by Git.
- This browser-side key fallback is for local development only. Do not use it for production deployments.
- The UI will first try the same-origin proxy at `/localcontexts-api`; if that is unavailable, it falls back to the browser key from `public/env.local.js`.

### Netlify dashboard mods summary

If this site was already deploying successfully before this change, the only required Netlify dashboard modification is:

- Add `LOCAL_CONTEXTS_API_KEY` as a secret environment variable.

These are only needed if the site is not already configured from the repo defaults:

- Keep `MAPBOX_TOKEN` configured for the build-generated `env.js`
- Set publish directory to `dist/geome/browser`
- Set functions directory to `netlify/functions`
- Keep the base directory at the repository root
