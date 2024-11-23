# Image Search API

## Description
Search images from Pixabay, Unsplash, and Storyblock using GraphQL.

## System Design
Please check [here](./src/docs/system-design.MD) to see more detail about the API system design.

## Project Setup

Before you can start the project, ensure all dependencies are installed:

```
$ npm install
```
<br>
## Running the Project

You can choose to run the project locally. The following instructions cover the setup for local development:

### Local Development Setup
To run the project locally, use the following commands:

### Step 1: Set Up Environment Variables

Create a .env file in the root directory with the following configuration:

```
DB_TYPE=db_type
PG_USER=your_db_username
PG_PASSWORD=your_db_password
PG_DB=your_db_name
PG_PORT=port
PG_HOST=localhost
SECRET=your_secret_token
PORT=3000
NODE_ENV=production
PIXABAY_URL=https://pixabay.com/api/
PIXABAY_API_KEY=your_pixabay_api_key
UNSPLASH_URL=https://api.unsplash.com/search/collections
UNSPLASH_ACCESS_KEY=your_unsplash_api_key
STORYBLOCK_BASE_URL=https://api.graphicstock.com
STORYBLOCK_SEARCH_URL=/api/v1/stock-items/search/
STORYBLOCK_API_KEY=your_storyblock_api_key
```
You can refer to the [.env-example](./.env-example) file here.

### Step 2: Run Docker Compose

Once you have the environment variables set up, use the following commands to start the project with Docker Compose:

```
docker-compose up --build
```
This will start the application and its dependencies (like the database) using Docker containers.

### Step 3: Access GraphQL Playground

To interact with the GraphQL API, visit the following URL:

```
http://localhost:${your_port}/graphql
```

- Replacen `${your_port}` with the port defined in your `.env` file or the default `(e.g., 3000)`.
- Example: If the application is running on port 3000, <br>
visit http://localhost:3000/graphql to access the GraphQL playground.
<br>

Here are some example queries and mutations you can run:
#### Example Mutation - Create User
```
mutation {
  createUser(
    createUserInput: {
      username: "janeDoe"
      email: "janeDoe@example.com"
      password: "password"
    }
  ) {
    id
    username
    email
  }
}
```
<br>

#### Example Mutation - Login
```
mutation {
  login(authInput: { username: "janeDoe", password: "password" }) {
    access_token
  }
}
```
<br>

#### Example Query - List Users
```
query {
  users {
    id
    email
    username
  }
}
```
<br>

#### Example Query - Search Images
```
query {
  images(query: "flower") {
    imageId
    thumbnail
    preview
    title
    source
    tags
  }
}
```
<br>

### Authorization
To authenticate requests that require authorization, include the Authorization header with the token:
```
{
  "Authorization": "Bearer ${auth_token}"
}
```
<br>

## Running Tests

You can run tests to ensure the application is functioning as expected.

### Unit Tests
```
$ npm run test
```

This will execute the unit tests for the project.

### Test Coverage
```
$ npm run test:cov
```
This will run the tests and generate a coverage report.

## Documentation

Once the application is running, you can access the API documentation through the GraphQL interface.

### Additional Notes
- **Environment Variables:** The .env file is critical for configuring the application correctly, especially for connecting to the PostgreSQL database and generating JWT tokens.
- **Docker Compose:** The project is set up to run via Docker Compose, which simplifies running and managing the application in a local environment.
- **Authorization:** API endpoints that require authentication must include a valid Bearer token in the request headers.