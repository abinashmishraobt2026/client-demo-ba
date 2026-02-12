# OffbeatTrips Business Associate Portal - Static Demo

A fully static demo version of the OffbeatTrips Business Associate Portal, ready for deployment on GitHub Pages or any static hosting platform.

## 🎯 Demo Features

This is a **fully functional demo** that runs entirely in the browser with no backend required:

- ✅ Complete authentication system (mock)
- ✅ Admin and Associate dashboards
- ✅ Lead management (CRUD operations)
- ✅ Commission tracking
- ✅ Package showcase
- ✅ All data stored in browser localStorage
- ✅ Responsive design for mobile and desktop

## 🔐 Demo Credentials

### Admin Account
- **Email:** admin@offbeattrips.com
- **Password:** admin123

### Associate Accounts
- **Email:** associate@offbeattrips.com | **Password:** associate123
- **Email:** demo@offbeattrips.com | **Password:** demo123

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server (runs on port 5174)
npm run dev

# Build for production
npm run build

# Preview production build (runs on port 4174)
npm run preview
```

## 📦 Deployment to GitHub Pages

### Option 1: Using GitHub Actions (Automatic)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Static demo version"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Under "Build and deployment":
     - Source: GitHub Actions
   - The workflow will automatically deploy on push to main

3. **Access your site:**
   - URL: `https://YOUR_USERNAME.github.io/YOUR_REPO/`
   - Wait 2-3 minutes for first deployment

### Option 2: Manual Deployment

```bash
# Build the project
npm run build

# Deploy using gh-pages
npm install -g gh-pages
gh-pages -d dist
```

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
│   ├── admin/       # Admin dashboard pages
│   ├── associate/   # Associate dashboard pages
│   ├── auth/        # Authentication pages
│   └── public/      # Public pages
├── services/        # Mock API services
│   ├── api.js       # Main API exports (mocked)
│   ├── mockAuth.js  # Mock authentication
│   ├── mockData.js  # Mock data operations
│   └── socket.js    # Mock WebSocket (no-op)
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
└── App.jsx          # Main app component (HashRouter)
```

## 🔧 Technical Details

### Static Demo Implementation

This version has been converted from a full-stack application to a static demo:

1. **No Backend Dependencies:**
   - Removed axios, @stomp/stompjs, sockjs-client
   - All API calls replaced with mock services
   - No environment variables for backend URLs

2. **Data Storage:**
   - All data stored in browser localStorage
   - Persists across page refreshes
   - Can be cleared via browser dev tools

3. **Routing:**
   - Uses HashRouter for GitHub Pages compatibility
   - All routes work without server-side configuration

4. **Mock Services:**
   - `mockAuth.js` - Handles login/logout/password operations
   - `mockData.js` - Manages leads, associates, packages, commissions
   - Simulates API delays for realistic UX

## 🎨 Customization

### Adding New Demo Users

Edit `src/services/mockAuth.js`:

```javascript
const DEMO_USERS = [
  {
    id: 4,
    email: 'newuser@example.com',
    password: 'password123',
    name: 'New User',
    role: 'associate',
    uniqueId: 'BA-003',
    requiresPasswordChange: false
  }
];
```

### Modifying Mock Data

Edit `src/services/mockData.js` to customize initial leads, packages, etc.

## 📝 Notes

- This is a **demo version** for showcase purposes
- Data is stored locally and will be lost if localStorage is cleared
- No real backend integration
- File uploads are simulated (no actual file storage)
- WebSocket connections are mocked (no real-time updates)

## 🛠️ Technologies Used

- React 18
- React Router v6 (HashRouter)
- TailwindCSS
- Vite
- Heroicons
- React Hot Toast

## 🐛 Troubleshooting

### Blank page after deployment
- Verify `base: './'` in `vite.config.js`
- Ensure using HashRouter (not BrowserRouter)
- Check GitHub Pages settings

### Data not persisting
- Check browser localStorage is enabled
- Not in incognito/private mode
- Clear localStorage: `localStorage.clear()` in console

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 License

This is a demo project for OffbeatTrips Business Associate Portal.

---

**Built with ❤️ for OffbeatTrips**
