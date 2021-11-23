# geome-db UI

Develop Branch Status Badges:
[![Netlify Status](https://api.netlify.com/api/v1/badges/16ceb81c-9b4d-4342-8e20-d3c35eb15b7a/deploy-status)](https://app.netlify.com/sites/geome-develop/deploys)

Master Branch Status Badges:
[![Netlify Status](https://api.netlify.com/api/v1/badges/07905dcf-c6b5-488d-9a93-b062b0ca13a3/deploy-status)](https://app.netlify.com/sites/geome-db/deploys)

Frontend code for [https://geome-db.org](https://geome-db.org).


>Warning: Make sure you're using a recent version of Node.js and NPM

### Quick start

```bash
# clone our repo
$ git clone https://github.com/biocodellc/geome-ui.git my-app

# change directory to cloned repo
$ cd geome-ui

# install the dependencies with npm
$ npm install

# start the server
$ npm start

#NOTE: if you are not able to install or start using npm, you may need to try an older version of node, installable using nvm and set for example to version 12, for example `nvm use 12`

# Running under Apple M1 / Silicone chip
This may require installing Rosetta for getting node libraries to work, see, for example:
https://cutecoder.org/software/run-command-line-apple-silicon/
```

go to [http://localhost:3000](http://localhost:3000) in your browser.

# Table of Contents

* [Getting Started](#getting-started)
    * [Dependencies](#dependencies)
    * [Installing](#installing)
    * [Configuraiton](#configuration)
    * [Running the app](#running-the-app)
    * [Developing](#developing)
    * [Testing](#testing)
* [License](#license)

# Getting Started

## Dependencies

What you need to run this app:
* `node` and `npm` or `yarn` (Use [NVM](https://github.com/creationix/nvm))
* Ensure you're running Node (`v4.1.x`+) and NPM (`2.14.x`+)

## Installing

* `fork` this repo
* `clone` your fork
* `npm install` to install all dependencies

*NOTE:* If `npm install` hangs on node-gyp rebuild, try running `npm rebuild node-sass` and then retrying `npm install`
*NOTE:* on Mac M1 you may need to limit max_worker_processes to 1 in postgres configuration. see https://twitter.com/searls/status/1351572379370217475

See this [github guide](https://help.github.com/articles/fork-a-repo/#step-3-configure-git-to-sync-your-fork-with-the-original-spoon-knife-repository) for how to keep your fork synced with this repo.

## Configuration

Configuration files are contained in the `config` directory. The default configuration is secified in the `default.js` file. This can be extended by environment based config files using the `ENVIRONMENT` env variable during build time.

 - ex. to extend `default.js` with the config file `development.js` (if file exists)
 
       `ENVIRONMENT=development npm build`

A `local.js` config file can be created and will extend the `default.js` config if the file exists **and** `ENVIRONMENT` var is not specified or the env config file is not found. This file is not check into the vcs, so it is useful for local development.

Additionally, the following config options can be set via env variables:

- `MAPBOX_TOKEN` -> 'mapboxToken'
- `FIMS_CLIENT_ID` -> 'fimsClientId'

## Running the app

After you have installed all dependencies you can now run the app with:
```bash
npm start
```

It will start a local server using `webpack-dev-server` which will watch, build (in-memory), and reload for you. The port will be displayed to you as `http://localhost:3000`.

## Developing

### Build files

* single run: `npm run build`
* build files and watch: `npm start`

<!-- ## Testing

#### 1. Unit Tests

* single run: `npm test`
* live mode (TDD style): `npm run test-watch` -->

# License

[MIT](/LICENSE)
