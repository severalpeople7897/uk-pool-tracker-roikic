
# Pool League Tracker - Deployment Guide

This guide will help you deploy your Pool League Tracker app to GitHub and make it accessible on the web and as a mobile app.

## 📋 Prerequisites

Before you begin, make sure you have:

- A GitHub account
- Node.js (v18 or later) installed
- Git installed on your computer
- An Expo account (free at expo.dev)
- A Supabase account (free at supabase.com)

## 🚀 Step 1: Set Up GitHub Repository

### 1.1 Create a New Repository on GitHub

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., "pool-league-tracker")
5. Make it public if you want others to see the code
6. Don't initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### 1.2 Push Your Code to GitHub

Open your terminal in the project directory and run:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: Pool League Tracker app"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub username and repository name.

## 🌐 Step 2: Deploy to Web (Expo Web)

### 2.1 Build for Web

```bash
# Install dependencies
npm install

# Build for web
npm run build:web
```

### 2.2 Deploy to GitHub Pages

1. Install the GitHub Pages deployment tool:
```bash
npm install --save-dev gh-pages
```

2. Add this script to your `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build:web && gh-pages -d dist"
  }
}
```

3. Deploy to GitHub Pages:
```bash
npm run deploy
```

4. Enable GitHub Pages in your repository settings:
   - Go to your repository on GitHub
   - Click "Settings" tab
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Click "Save"

Your app will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME`

## 📱 Step 3: Deploy Mobile App (Expo)

### 3.1 Set Up Expo Account

1. Create an account at [expo.dev](https://expo.dev)
2. Install Expo CLI globally:
```bash
npm install -g @expo/cli
```

3. Login to Expo:
```bash
expo login
```

### 3.2 Configure Your App

Update your `app.json` with your app details:

```json
{
  "expo": {
    "name": "Pool League Tracker",
    "slug": "pool-league-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/final_quest_240x240.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/final_quest_240x240.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.poolleaguetracker"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/final_quest_240x240.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourname.poolleaguetracker"
    },
    "web": {
      "favicon": "./assets/images/final_quest_240x240.png",
      "bundler": "metro"
    }
  }
}
```

### 3.3 Build and Submit

For iOS (requires Apple Developer account - $99/year):
```bash
expo build:ios
```

For Android:
```bash
expo build:android
```

For easier distribution, you can also create an Expo Go compatible build:
```bash
expo publish
```

## 🗄️ Step 4: Set Up Supabase Database

### 4.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Note down your project URL and anon key

### 4.2 Update Environment Variables

Create a `.env.local` file in your project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4.3 Set Up Database Tables

The app will automatically create the necessary tables when you first run it, but you can also manually create them in the Supabase dashboard.

## 🔧 Step 5: Continuous Deployment

### 5.1 GitHub Actions for Web Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build:web
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 5.2 Expo EAS for Mobile

Install EAS CLI:
```bash
npm install -g eas-cli
```

Configure EAS:
```bash
eas build:configure
```

Build for both platforms:
```bash
eas build --platform all
```

## 📊 Step 6: Analytics and Monitoring

### 6.1 Add Analytics

You can add analytics to track app usage:

```bash
npm install expo-analytics-amplitude
```

### 6.2 Error Monitoring

Add error monitoring with Sentry:

```bash
npm install @sentry/react-native
```

## 🔒 Step 7: Security Considerations

1. **Environment Variables**: Never commit sensitive keys to GitHub
2. **Supabase RLS**: Ensure Row Level Security is enabled on all tables
3. **API Keys**: Use environment variables for all API keys
4. **HTTPS**: Always use HTTPS in production

## 📱 Step 8: App Store Distribution

### For iOS App Store:
1. Join Apple Developer Program ($99/year)
2. Use EAS Build to create iOS build
3. Submit through App Store Connect

### For Google Play Store:
1. Create Google Play Developer account ($25 one-time fee)
2. Use EAS Build to create Android build
3. Submit through Google Play Console

## 🎯 Step 9: Testing

### Web Testing:
- Test on different browsers (Chrome, Firefox, Safari)
- Test responsive design on mobile browsers
- Test PWA functionality

### Mobile Testing:
- Use Expo Go app for development testing
- Test on both iOS and Android devices
- Test offline functionality

## 📈 Step 10: Maintenance

### Regular Updates:
1. Keep dependencies updated
2. Monitor Supabase usage
3. Check app performance
4. Update app store listings

### Backup Strategy:
1. Regular database backups through Supabase
2. Keep code versioned in GitHub
3. Document any manual configurations

## 🆘 Troubleshooting

### Common Issues:

1. **Build Failures**: Check Node.js version compatibility
2. **Supabase Connection**: Verify environment variables
3. **GitHub Pages**: Ensure proper build output directory
4. **Mobile Build**: Check Expo CLI version

### Getting Help:

- Expo Documentation: [docs.expo.dev](https://docs.expo.dev)
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- GitHub Pages: [pages.github.com](https://pages.github.com)

## 🎉 Congratulations!

Your Pool League Tracker app is now deployed and accessible to users worldwide! 

**Web App**: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME`
**Mobile App**: Available through Expo Go or app stores

Remember to update your users about new features and maintain regular backups of your data.
