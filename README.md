# RSS Rest API
This is a simple REST API that provides an RSS feed for a given URL.

## Table of Contents
- [Technologies](#technologies)
- [Setup Database](#setup-database)
- [Running the API at localhost](#running-the-api-at-localhost)
- [Deploying the API to Cloudflare Workers](#deploying-the-api-to-cloudflare-workers)
- [API Documentation](#api-documentation)

## Technologies
- [Node.js](https://nodejs.org/en/)
- [Typescript](https://www.typescriptlang.org/)
- [Hono](https://hono.dev/)
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- [PostgreSQL Neon Tech](https://neon.tech)
- [@extractus/feed-extractor](https://www.npmjs.com/package/@extractus/feed-extractor)

## Setup Database
To setup the database, you need to have Neon Tech Account and create a new database.
1. Create a new database on [PostgreSQL Neon Tech](https://neon.tech)
2. Copy SQL Query at `init.sql` file and run it on the database

## Running the API at localhost
To run the API at localhost, you need to have Node.js and Docker installed on your machine.
1. Clone the repository and copy the `.dev.vars.example` file to `.dev.vars`
2. Run `npm install or yarn install or bun install` to install the dependencies
4. Run `npm dev or yarn dev or bun dev` to start the server
5. The server will be running at `http://localhost:3000`

## Deploying the API to Cloudflare Workers
To deploy the API to Cloudflare Workers, you need to have Wrangler installed on your machine.
1. Copy the `wrangler.toml.example` file to `wrangler.toml`
2. Update the `name` and vars `DATABASE_URL` in the `wrangler.toml` file
3. Run `wrangler deploy` to deploy the API to Cloudflare Workers
4. The API will be deployed to a URL like `https://rss-api.your-subdomain.workers.dev`

## API Documentation
To testing the API or for the API Documentation, you must install Insomnia, and you can use the Insomnia file at `rss-api-insomnia.json` file.
1. Install Insomnia, you can download it [here](https://insomnia.rest/download)
2. Import the Insomnia file at `rss-api-insomnia.json` or `rss-api-insomnia.yaml` file
