# Chef's Arsenal

A professional culinary platform for chefs, culinary students, and food enthusiasts.

## Features

- Recipe management and scaling
- Menu engineering tools
- Technique library with video tutorials
- Ingredient database with substitutions
- Nutrition analysis
- Menu costing and pricing

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- **State Management**: Redux Toolkit
- **Styling**: Styled Components
- **Testing**: Jest & React Testing Library

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both `server` and `client` directories
   - See `.env.example` for required variables

4. Start the development servers:
   ```bash
   # In server directory
   npm run dev

   # In client directory (new terminal)
   npm start
   ```

## Project Structure

```
chefs-arsenal/
├── client/                 # Frontend React application
├── server/                 # Backend Express server
├── .gitignore
└── README.md
```

## License

MIT
