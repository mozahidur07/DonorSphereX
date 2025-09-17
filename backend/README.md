# DonorSphereX Backend

The backend server for DonorSphereX, a comprehensive blood and organ donation platform built with Node.js, Express, and MongoDB.

## Technology Stack

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL database for storing user data and donation records
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for secure authentication
- **Bcrypt**: Password hashing for secure user authentication
- **Multer**: File upload handling for profile pictures and KYC documents
- **Cors**: Cross-Origin Resource Sharing support
- **Dotenv**: Environment variable management

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── auth/             # Authentication controllers
│   │   ├── authController.js
│   │   └── authUtils.js
│   ├── donation/         # Donation-related controllers
│   │   └── donationController.js
│   ├── profile/          # User profile controllers
│   │   ├── passwordController.js
│   │   └── profileController.js
│   ├── requests/         # Donation request controllers
│   │   └── requestController.js
│   └── staff/            # Staff and admin controllers
│       └── staffController.js
├── database/             # Database connection and configuration
│   └── connection.js
├── middleware/           # Express middleware
│   └── auth.js
├── models/               # MongoDB Mongoose models
│   ├── Donation.js
│   ├── Request.js
│   ├── User.js
│   └── UserUpdate.js
├── routes/               # API routes definition
│   ├── authRoutes.js
│   ├── donationRoutes.js
│   ├── notificationRoutes.js
│   ├── profileRoutes.js
│   ├── requestRoutes.js
│   ├── staffRoutes.js
│   └── userRoutes.js
├── uploads/              # User uploaded files
│   ├── kyc/              # KYC document uploads
│   └── profile-pictures/ # Profile picture uploads
├── utils/                # Utility functions
│   ├── appError.js
│   ├── errorHandlers.js
│   ├── fileUpload.js
│   └── notificationUtils.js
├── updates/              # Database migration scripts
│   └── fixKycStatusUpdate.js
├── server.js             # Main server entry point
├── package.json          # Project dependencies
└── README.md             # This file
```

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mozahidur07/DonorSphereX.git
cd DonorSphereX/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/donorspherex
# Or use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/donorspherex
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

4. Start the development server:
```bash
npm run dev
```

5. Run the production server:
```bash
npm start
```

## Environment Variables Explanation

- `PORT`: The port on which the server will run
- `NODE_ENV`: Development or production environment
- `MONGODB_URI`: Connection string for MongoDB
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRE`: JWT token expiration time

## API Endpoints

The API endpoints are organized by resource:

- Authentication: `/api/auth`
  - `POST /api/auth/register`: Register a new user
  - `POST /api/auth/login`: Login a user
  - `GET /api/auth/logout`: Logout a user
  - `POST /api/auth/forgot-password`: Send password reset email
  - `POST /api/auth/reset-password/:token`: Reset password

- User Profiles: `/api/profile`
  - `GET /api/profile`: Get user profile
  - `PATCH /api/profile`: Update user profile
  - `POST /api/profile/kyc`: Upload KYC document
  - `POST /api/profile/update-kyc`: Update KYC document from Supabase
  - `PATCH /api/profile/kyc/:userId`: Update KYC verification status
  - `POST /api/profile/upload-profile-picture`: Upload profile picture

- Donations: `/api/donations`
  - `POST /api/donations`: Create a new donation
  - `GET /api/donations`: Get all donations
  - `GET /api/donations/:id`: Get a specific donation
  - `PATCH /api/donations/:id`: Update a donation status

- Requests: `/api/requests`
  - `POST /api/requests`: Create a new request
  - `GET /api/requests`: Get all requests
  - `GET /api/requests/:id`: Get a specific request
  - `PATCH /api/requests/:id`: Update a request

- Notifications: `/api/notifications`
  - `GET /api/notifications`: Get user notifications
  - `PATCH /api/notifications/:id`: Mark notification as read
  - `DELETE /api/notifications/:id`: Delete a notification

- Staff Operations: `/api/staff`
  - `GET /api/staff/dashboard`: Get dashboard data
  - `GET /api/staff/users`: Get all users
  - `GET /api/staff/users/:id`: Get a specific user
  - `PATCH /api/staff/users/:id/roles`: Update user roles
  - `PATCH /api/staff/users/:id/kyc`: Update KYC status

## License

This project is open source and for educational purposes. No commercial use is allowed without permission.
