# Hoyo Automate

A Discord bot for automating daily check-ins and redeeming codes for Hoyoverse and Kuro games.

## Features

- Automated daily check-ins for Hoyoverse games (Genshin Impact, Honkai: Star Rail, Zenless Zone Zero).
- Automated code redemption for Hoyoverse games.
- Notifications sent to your Discord account.
- Easy to set up and configure.

## Prerequisites

- Node.js (v20 or higher)
- Docker (optional, for containerized deployment)
- A Discord Bot Token
- MongoDB instance (for storing user data)

## Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/akarindt/hoyokuro-checker.git
    cd hoyokuro-checker
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root directory of the project.
2.  Add the following environment variables to the `.env` file like `.example.env` file

## Usage

### Development

To run the bot in development mode with hot-reloading, use the following command:

```sh
npm run dev
```

### Production

1.  **Build the TypeScript code:**

    ```sh
    npm run build
    ```

2.  **Start the bot:**

    ```sh
    npm start
    ```

    The `start` script in `package.json` will be configured to run `node dist/src/index.js`.

### Available Scripts

- `npm run lint`: Lint the codebase.
- `npm run lint:fix`: Fix linting errors.
- `npm run format`: Format the code using Prettier.
- `npm run build`: Compile the TypeScript code to JavaScript.

## Docker Deployment

This project includes a multi-stage `Dockerfile` for creating an optimized production image.

1.  **Build the Docker image:**

    ```sh
    docker build -t hoyokuro-checker .
    ```

2.  **Run the Docker container:**

    Make sure to pass your environment variables to the container.

    ```sh
    docker run -d --env-file .env --name hoyokuro-bot hoyokuro-checker
    ```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
