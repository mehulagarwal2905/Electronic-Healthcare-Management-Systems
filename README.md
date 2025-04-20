
# MedConnect - Healthcare Portal

MedConnect is a comprehensive healthcare management system that connects patients and doctors on a single platform. This web application provides role-based access with different interfaces for patients and doctors.

## Features

### Patient Features
- View prescriptions
- Set medication reminders
- Access lab reports
- Manage doctors

### Doctor Features
- Write prescriptions
- Set appointment reminders
- View patient test results
- Manage patients

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router
- Shadcn UI Components

### Backend (Implementation Guide)
- Node.js
- Express
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation and Setup

1. Clone the repository
```bash
git clone <repository-url>
cd medconnect
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Backend Implementation

This repository includes a frontend implementation. For the backend implementation, refer to the `BACKEND_IMPLEMENTATION.md` file which provides detailed instructions on how to set up the Node.js, Express, and MongoDB backend.

## Demo Credentials

For demonstration purposes, you can use the following credentials:

### Patient Access
- Email: patient@example.com
- Password: password123

### Doctor Access
- Email: doctor@example.com
- Password: password123

## Project Structure

```
medconnect/
├── public/                  # Static files
├── src/                     # Source files
│   ├── components/          # Reusable components
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── doctor/          # Doctor-specific components
│   │   ├── layout/          # Layout components
│   │   ├── patient/         # Patient-specific components
│   │   └── ui/              # UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   └── App.tsx              # Main app component
├── BACKEND_IMPLEMENTATION.md # Backend implementation guide
└── README.md                # Project documentation
```

## Extending the Project

### Adding New Features

1. **Create New Components**: 
   - Add new components to the appropriate directory under `src/components/`

2. **Add Routes**:
   - Update routes in `src/App.tsx`

3. **Backend Integration**:
   - Follow the implementation guide in `BACKEND_IMPLEMENTATION.md`
   - Update API service functions to connect to your backend

### Authentication Flow

The application uses localStorage for authentication in the demo. For a production application, you should:

1. Implement JWT-based authentication with the backend
2. Add token refresh mechanisms
3. Implement proper security measures

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
