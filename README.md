<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Getting Started with simple REST Application

### Prerequisites
Before you start, make sure you have the following installed on your machine:

* Node.js (v12.x or higher)
* npm (v6.x or higher)
* RabbitMQ
* MongoDB 

### Project Setup
1. Clone the Repository
First, clone the project repository to your local machine.
```bash
git clone https://github.com/EkeneDeProgram/REST-Application.git
cd your-repo
```
2.  Install Dependencies
Navigate to the project directory and install the necessary dependencies:
```bash
npm install
```
3. Set Up Environment Variables
* Copy the .env.example file and rename it to .env.
* You can use MongoDB Compass or any MongoDB client to create a new database named `your_db_name`
* Ensure to replace `your_db_name` with the actual database name you want to use for your project.
```bash
MONGO_URI=mongodb://localhost:27017/your_db_name
RABBITMQ_URI=amqp://localhost:5672
```

4. Run the Application
Start your NestJS application:
```bash
npm run start:dev
```

Your application should now be running on `http://localhost:3000`

## Usage
## Endpoints

1. **POST /api/users**
    * Store a user entry in the database, send a dummy email, and emit a RabbitMQ event.
    * Example request:
    ```bash
    {
      "email": "ZinedineZidane@example.com"
    }
    ```
2. **GET /api/users/{userId}**
    * Retrieve user data from `https://reqres.in/api/users/{userId}` and return the user in `JSON` representation.

3. **GET /api/users/{userId}/avatar**
    * Retrieve the image by 'avatar' URL. On the first request, it saves the image as a plain file, stores it as a  MongoDB entry with userId and hash, and returns its base64-encoded representation. On subsequent requests, it returns the previously saved file in base64-encoded representation (retrieved from DB).

4. **DELETE /api/users/{userId}/avatar**
    * Remove the file from the file system storage and delete the stored entry from the database.

## Example Requests with Postman
* **POST /api/users**
  * URL: `http://localhost:3000/api/users`
  * Method: POST
  * Body:
  ```bash
  {
    "email": "ZinedineZidane@example.com"
  }
  ```

* **GET /api/users/{userId}**
  * URL: `http://localhost:3000/api/users/2`
  * Method: GET

* **GET /api/users/{userId}/avatar**
  * URL: `http://localhost:3000/api/users/2/avatar`
  * Method: GET

* **DELETE /api/users/{userId}/avatar**
  * URL: `http://localhost:3000/api/users/2/avatar`
  * Method: DELETE


## Testing
To run the tests for the application, use the following command:
```bash
npm run test
```
This command will execute the unit and functional tests defined in the application. 

## Lint
To lint your code and ensure it adheres to the coding standards, use the following command:
```bash
npm run lint
```
Fix any linting errors as reported by ESLint.

## Conclusion
You now have a fully functional NestJS application with MongoDB and RabbitMQ integration. Follow the steps in this documentation to set up, run, and test your application. If you encounter any issues, refer to the NestJS, MongoDB, and RabbitMQ documentation for further assistance.

