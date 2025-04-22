# Bitcoin Wallet API

A secure and scalable Bitcoin wallet API built with NestJS that provides wallet management, authentication, and Bitcoin transaction capabilities.

## Technologies Used

- **Framework**: NestJS (v11) - A progressive Node.js framework for building efficient and scalable server-side applications
- **Language**: TypeScript - Providing type safety and better developer experience
- **Database**: MongoDB with Mongoose - For storing user and wallet data
- **Authentication**: JWT (JSON Web Tokens) - For secure user authentication and authorization
- **Bitcoin Integration**: 
  - bitcoinjs-lib - For Bitcoin transaction handling
  - @mempool/mempool.js - For blockchain data and fee estimation
- **API Documentation**: Swagger/OpenAPI - Auto-generated API documentation
- **Validation**: class-validator and class-transformer - For DTO validation
- **Testing**: Jest - For unit and e2e testing

## Architecture & Design Patterns

- **Modular Architecture**: Separate modules for Auth, Bitcoin, Wallet, and Crypto operations
- **Design Patterns**:
  - Repository Pattern (Providers)
  - Dependency Injection
  - DTO (Data Transfer Objects)
  - Guard Pattern for authentication
  - Middleware for request processing
  - Service Layer Pattern
- **Clean Architecture Principles**:
  - Clear separation of concerns
  - Dependency inversion
  - Interface segregation

## Project Structure

```
src/
├── auth/           # Authentication and authorization
├── bitcoin/        # Bitcoin-specific operations
├── crypto/         # Cryptographic operations
├── wallet/         # Wallet management
└── decorators/     # Custom decorators
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- NPM or Yarn

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
MONGO_URI=
MONGO_USER=
MONGO_PASS=
MONGO_DB=

PORT=

CORS_ORIGIN=

JWT_SECRET=

AES_KEY= # 64 bit string length
IV_LENGTH= # 12
```

## Running the Application

```bash
# development mode
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api/docs
```

## Main Features

1. **User Authentication**
   - Sign up
   - Sign in
   - JWT-based authentication
   - Refresh token mechanism

2. **Wallet Management**
   - Create Bitcoin wallet
   - View wallet balance
   - List transactions

3. **Bitcoin Operations**
   - Send Bitcoin
   - Receive Bitcoin
   - Transaction fee estimation
   - Transaction history
