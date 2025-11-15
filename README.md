
# Goat Farm App (Expo / React Native)

Minimal starter mobile app (Expo) to manage a simple goat inventory stored on the device.

## What's included
- `App.js` — main app with add/list/delete goats using AsyncStorage (local device storage).
- `package.json` — npm scripts and dependencies (for local development with Expo).
- `.gitignore` — typical Node/Expo ignores.
- `README.md` — this file.

## Two ways to use this (choose one)

### 1) Quick — run in **Expo Snack** (no install)
- Go to https://snack.expo.dev/
- Create a new Snack, delete default files, and copy-paste the contents of `App.js` from this repo into the online editor.
- Open the Snack with the Expo Go app on your phone (scan QR). This requires no installs on your computer.

### 2) Local — run on phone with Expo CLI (requires Node/npm)
- Install Node (recommended v18+) and npm.
- Install Expo CLI: `npm install -g expo-cli`
- Extract this zip and open terminal inside the project folder:
  ```bash
  npm install
  npm run start
  ```
- Use the Expo Go app on your phone to open the QR code, or run `npm run android` (if you later install Android Studio / emulator).

## How to push to GitHub
1. Create a repo on GitHub (e.g. `goat-farm-app`).  
2. Extract this zip and in the project folder run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - goat farm app skeleton"
   git branch -M main
   git remote add origin https://github.com/your-username/goat-farm-app.git
   git push -u origin main
   ```

## Next steps we'll do together (after you extract and confirm)
1. I will guide you to open this project in **Snack** or run locally with Expo.
2. We'll add features step-by-step (growth tracking, expenses, vaccination reminders, reports), each as a small change and commit.

