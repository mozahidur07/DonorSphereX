# DonorSphereX Frontend

The frontend client for DonorSphereX, a comprehensive blood and organ donation platform built with React, Vite, and Tailwind CSS.

## Technology Stack

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
frontend/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images and static resources
│   ├── components/        # Reusable UI components
│   │   ├── charts/        # Chart components for statistics
│   │   └── ui/            # UI element components
│   ├── context/           # React context providers
│   │   └── AuthContext.jsx
│   ├── data/              # Mock and static data
│   ├── js/                # JavaScript utility functions
│   ├── pages/             # Application pages
│   │   ├── About.jsx
│   │   ├── Home.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── Terms.jsx
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard components
│   │   ├── donation/      # Donation pages
│   │   ├── notifications/ # Notification components
│   │   ├── profile/       # User profile pages
│   │   ├── requests/      # Request pages
│   │   ├── staff/         # Staff dashboard pages
│   │   └── support/       # Support and chatbot pages
│   ├── store/             # State management with Zustand
│   │   └── userStore.js
│   └── utils/             # Utility functions
│       └── supabase.js
├── index.html             # HTML entry point
├── main.jsx               # React entry point
├── App.jsx                # Main app component
├── package.json           # Project dependencies
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mozahidur07/DonorSphereX.git
cd DonorSphereX/frontend
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

## Environment Variables Explanation

- `VITE_API_URL`: URL of the backend API
- `VITE_REMEMBER_ME_SECRET_KEY`: Secret key for remember me functionality
- `VITE_SUPABASE_URL`: Supabase project URL for file storage
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key for public operations
- `VITE_OPENAI_API_KEY`: OpenAI API key for chatbot functionality
- `VITE_OPENROUTER_API_KEY`: OpenRouter API key for AI models (alternative to OpenAI)

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build production bundle
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build locally

## Features

- **User Authentication**: Secure login and registration system
- **Donor Dashboard**: Personalized dashboard showing donation history and impact
- **Blood and Organ Requests**: Create and manage donation requests
- **User Profiles**: Complete user profiles with blood type information
- **AI-powered Support**: Integrated AI chatbot to assist users
- **KYC Verification**: User verification with document upload
- **Notifications**: Real-time notifications for updates
- **Mobile Responsive**: Fully responsive design for all devices

## License

This project is open source and for educational purposes. No commercial use is allowed without permission.
