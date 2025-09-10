<h1 align="center">DonorSphereX - Blood and Organ Donation Platform</h1>

<p align="center">
  <img src="./frontend/public/icon.png" alt="DonorSphereX Logo" width="120" height="120" />
</p>

## Problem Statement

Blood and organ donation systems face significant challenges including fragmented donation processes, inefficient matching of donors to recipients, inconsistent tracking of donation histories, and poor communication channels. Traditional methods often lead to delays in critical situations, limiting donor engagement, and creating barriers for potential donors. The lack of centralized information causes reduced donation rates, underutilization of potential donors, and missed opportunities to save lives.

## Solution

DonorSphereX is a comprehensive web platform designed to connect blood and organ donors with those in need. The platform streamlines the donation process, manages donation requests, and provides users with their donation history and eligibility status. By implementing a modern, user-friendly interface with real-time notifications, AI support, and secure verification processes, DonorSphereX breaks down barriers to donation and creates a more efficient, responsive donation ecosystem.

## Live Demo

[Visit DonorSphereX](https://donorspherex.vercel.app) (Coming Soon)

## Demo Video

<p align="center">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/aZb0iu4uGwA?si=IX10d2duYib3yO4v" title="DonorSphereX Demo" frameborder="1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>



## Features

- **User Authentication**: Secure login and registration system with JWT authentication
- **Donor Dashboard**: Personalized dashboard showing donation history, eligibility, and impact
- **Blood and Organ Requests**: Create and manage donation requests
- **Donation History**: Track all past donations with status updates
- **AI-powered Support**: Integrated AI chatbot to assist users with queries
- **User Profiles**: Complete user profiles with blood type information and medical history
- **KYC Verification**: User verification with document upload functionality
- **Notifications**: Real-time notifications for request updates and donation eligibility
- **Mobile Responsive**: Fully responsive design for optimal viewing on all devices

## Technology Stack

### Backend

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL database for storing user data and donation records
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for secure authentication
- **Bcrypt**: Password hashing for secure user authentication
- **Multer**: File upload handling for profile pictures and KYC documents
- **Cors**: Cross-Origin Resource Sharing support
- **Dotenv**: Environment variable management

### Frontend

- **React 19**: Modern UI library for building user interfaces
- **Vite**: Next-generation frontend build tool
- **React Router v7**: Navigation and routing for React applications
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management solution
- **Axios**: Promise-based HTTP client
- **Framer Motion**: Animation library for React
- **React Markdown**: Markdown rendering for content
- **Date-fns**: Date manipulation library
- **OpenAI**: Integration for AI-powered support chatbot
- **Supabase**: Backend as a service for file storage and additional features

## Project Structure

```
DonorSphereX/
├── backend/                  # Backend Node.js application
│   ├── controllers/          # Request handlers
│   │   ├── auth/             # Authentication controllers
│   │   ├── donation/         # Donation-related controllers
│   │   ├── profile/          # User profile controllers
│   │   ├── requests/         # Donation request controllers
│   │   └── staff/            # Staff and admin controllers
│   ├── database/             # Database connection and configuration
│   ├── middleware/           # Express middleware
│   ├── models/               # MongoDB Mongoose models
│   ├── routes/               # API routes definition
│   ├── uploads/              # User uploaded files
│   │   ├── kyc/              # KYC document uploads
│   │   └── profile-pictures/ # Profile picture uploads
│   ├── utils/                # Utility functions
│   ├── updates/              # Database migration scripts
│   └── server.js             # Main server entry point
│
└── frontend/                 # Frontend React application
    ├── public/               # Static assets
    └── src/
        ├── assets/           # Images and static resources
        ├── components/       # Reusable UI components
        │   ├── charts/       # Chart components for statistics
        │   └── ui/           # UI element components
        ├── context/          # React context providers
        ├── data/             # Mock and static data
        ├── js/               # JavaScript utility functions
        ├── pages/            # Application pages
        │   ├── about/        # About page components
        │   ├── auth/         # Authentication pages
        │   ├── dashboard/    # Dashboard components
        │   ├── donation/     # Donation pages
        │   ├── notifications/# Notification components
        │   ├── profile/      # User profile pages
        │   ├── requests/     # Request pages
        │   ├── staff/        # Staff dashboard pages
        │   └── support/      # Support and chatbot pages
        ├── store/            # State management with Zustand
        └── utils/            # Utility functions including Supabase
```

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Clone the Repository

```bash
git clone https://github.com/mozahidur07/DonorSphereX.git
cd DonorSphereX
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
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

The backend server will run on http://localhost:3000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory with the following variables:
```
VITE_API_URL=http://localhost:3000/api
VITE_REMEMBER_ME_SECRET_KEY=your_secure_remember_me_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
# If using OpenRouter instead of OpenAI directly
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Start the development server:
```bash
npm run dev
```

The frontend development server will run on http://localhost:5173

### Environment Variables Explanation

#### Backend
- `PORT`: The port on which the server will run
- `NODE_ENV`: Development or production environment
- `MONGODB_URI`: Connection string for MongoDB
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRE`: JWT token expiration time

#### Frontend
- `VITE_API_URL`: URL of the backend API
- `VITE_REMEMBER_ME_SECRET_KEY`: Secret key for remember me functionality
- `VITE_SUPABASE_URL`: Supabase project URL for file storage
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key for public operations
- `VITE_OPENAI_API_KEY`: OpenAI API key for chatbot functionality
- `VITE_OPENROUTER_API_KEY`: OpenRouter API key for AI models (alternative to OpenAI)

## API Documentation

The API endpoints are organized by resource:

- Authentication: `/api/auth`
- User Profiles: `/api/profile`
- Donations: `/api/donations`
- Requests: `/api/requests`
- Notifications: `/api/notifications`
- Staff Operations: `/api/staff`

Detailed API documentation is available [here](https://documenter.getpostman.com/view/donorspherex) (Coming Soon).

## Credits

<div style="overflow-x:auto;">

<table align="center" style="border-collapse: collapse; min-width:600px;">
  <tr style="background:#333; color:#fff;">
    <th style="border:1px solid #555; padding:8px; text-align:left;">Name</th>
    <th style="border:1px solid #555; padding:8px; text-align:left;">Student ID</th>
    <th style="border:1px solid #555; padding:8px; text-align:left;">Credits</th>
  </tr>
  <tr style="background:#111827; color:#fff;">
    <td style="border:1px solid #555; padding:8px;">Mozahidur Rahaman</td>
    <td style="border:1px solid #555; padding:8px;">BWU/BTS/25/030</td>
    <td style="border:1px solid #555; padding:8px;">Full Stack Development</td>
  </tr>
  <tr style="background:#1f2937; color:#fff;">
    <td style="border:1px solid #555; padding:8px;">Zeeshan Ahmed</td>
    <td style="border:1px solid #555; padding:8px;">BWU/BTS/25/075</td>
    <td style="border:1px solid #555; padding:8px;">Full Stack Development</td>
  </tr>
  <tr style="background:#111827; color:#fff;">
    <td style="border:1px solid #555; padding:8px;">Yusuf Hasan</td>
    <td style="border:1px solid #555; padding:8px;">BWU/BTS/25/061</td>
    <td style="border:1px solid #555; padding:8px;">Backend</td>
  </tr>
  <tr style="background:#1f2937; color:#fff;">
    <td style="border:1px solid #555; padding:8px;">Umme Hani</td>
    <td style="border:1px solid #555; padding:8px;">BWU/BTS/25/050</td>
    <td style="border:1px solid #555; padding:8px;">PPT, UI Design</td>
  </tr>
  <tr style="background:#111827; color:#fff;">
    <td style="border:1px solid #555; padding:8px;">Fatima Khatoon</td>
    <td style="border:1px solid #555; padding:8px;">BWU/BTS/25/114</td>
    <td style="border:1px solid #555; padding:8px;">PPT, UI Design</td>
  </tr>
</table>

</div>

<p align="center"><b>From ~ Brainware University</b></p>



## Contributing

Contributions to DonorSphereX are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is a open source and for educational purposes. No commercial use is allowed without permission.

---

Made with ❤️ for saving lives through blood and organ donation.
