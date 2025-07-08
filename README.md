<p align="center">
    <a href="https://bloomui.com" title="BloomUI.com">
        <img src="https://bloomui.s3.us-east-2.amazonaws.com/tokyo-logo.png" alt="Tokyo Free White Typescript Next.js Admin Dashboard">
    </a>
</p>
<h1 align="center">
    <b>Tokyo Free White Typescript Next.js Admin Dashboard</b>
    <br>
    <a href="https://twitter.com/intent/tweet?url=https://bloomui.com&text=I like this Next.js admin dashboard">
        <img src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social" />
    </a>
</h1>
<div align="center">

![version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

<a href="https://bloomui.com/product/tokyo-free-white-nextjs-typescript-material-ui-admin-dashboard/"><img src="https://bloomui.s3.us-east-2.amazonaws.com/tokyo-free-white-nextjs-typescript-material-ui-admin-dashboard.jpg" /></a>

</div>

<a href="https://bloomui.com/product/tokyo-free-white-nextjs-typescript-material-ui-admin-dashboard/"><h3>Free Material-UI Next.js Typescript Dashboard Template with Dark Color Scheme</h3></a>

<p>
    Tokyo Free White Next.js Typescript Dashboard is built using the latest industry standards and features a clean and premium design style, making use of colors and accents to improve the user experience for all included flows and pages.
</p>
<p>
It is powered by Next.js, Typescript and React and contains multiple components customized on top of Material-UI – which is one of the best UI components frameworks available.</p>
<p>
We keep all dependencies updated to their latest stable versions. Each time we release an updated version you will be notified via the email you used to initially download the template.
</p>
<p>
To discover all the features that this free React admin template has to offer, we suggest visiting the live preview we've set up.
</p>
<p>There is also a free Javascript version available, if that is what you prefer working with.</p>

---

<h3>Updrade to PRO</h3>

<p>The premium version of this template comes with a lot more components, features and options making it a very powerful friend in your development endeavors. You can download a copy of it from <a href="https://bloomui.com">bloomui.com</a></p>

---

<h2>
    Quick Start
</h2>
<ol>
    <li>Make sure you have the latest stable versions for Node.js and NPM installed</li>
    <li>Clone repository: <code>git clone https://github.com/bloomui/tokyo-free-white-nextjs-admin-dashboard.git</code></li>
    <li>Install dependencies: Run <code>npm install</code> inside the project folder</li>
    <li>Start dev server: After the install finishes, run <code>yarn dev</code>. A browser window will open on http://localhost:3000 where you''ll see the live preview</li>
</ol>

---

<h2>
    Technical Support
</h2>
<p>
    You can open a support ticket by sending an email here: <a href="mailto:support@bloomui.freshdesk.com" title="Open Support Ticket">
        support@bloomui.freshdesk.com
    </a>
</p>

# Tokyo Free White NextJS Typescript Admin Dashboard

High performance React template built with lots of powerful MUI (Material-UI) components across multiple product niches for fast & perfect apps development processes

## Features

- **Modern React with TypeScript**: Built with Next.js 15 and TypeScript
- **Material-UI Components**: Rich set of pre-built components
- **Authentication System**: Integrated with REST API
- **Responsive Design**: Works on all devices
- **Dark/Light Theme**: Multiple theme options
- **Real-time Data**: Live data updates

## Authentication

The application now integrates with a REST API for authentication:

### Login Endpoint
- **URL**: `POST /login`
- **Base URL**: `http://172.16.1.33:8080/v1`
- **Parameters**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "statusCode": 0,
    "message": "string",
    "body": {
      "accessToken": "string",
      "refreshToken": "string",
      "user": {
        "id": "string",
        "fullName": "string",
        "email": "string",
        "phoneNumber": "string",
        "ktpNumber": "string",
        "dateOfBirth": "string",
        "gender": "string",
        "roleId": "string",
        "isVerified": true,
        "profilePictureId": "string",
        "createdAt": "string",
        "updatedAt": "string",
        "isGuest": true
      }
    }
  }
  ```

### Logout Endpoint
- **URL**: `POST /logout`
- **Base URL**: `http://172.16.1.33:8080/v1`
- **Parameters**:
  ```json
  {
    "userId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "string"
  }
  ```

### Token Management
- Access tokens are automatically stored in localStorage
- Tokens are included in API requests via Authorization header
- Automatic logout on token expiration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd black-hole
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Configuration

The application is configured to connect to the API at `http://172.16.1.33:8080/v1`. 

### Development Mode
- Uses proxy configuration to avoid CORS issues
- Requests go through `/api/v1/*` and are proxied to the backend

### Production Mode
- Direct API calls to the configured backend URL

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint-fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/          # Reusable components
├── contexts/           # React contexts (Auth, Sidebar)
├── hooks/             # Custom React hooks (useUserService, useTokenService)
├── layouts/           # Layout components
├── models/            # TypeScript interfaces
├── services/          # API services and utilities
└── theme/             # Theme configuration
```

## Service Architecture

The application uses a hook-based service architecture:

### Authentication & User Management
- `useUserService` - User authentication, role checking, and user data management
- `useTokenService` - Token storage and management in localStorage
- `useAuth` - React context for authentication state

### API Services
- `authApi` - Login/logout operations with role validation
- `eventsApi` - Event management operations
- `organizersApi` - Event organizer operations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
