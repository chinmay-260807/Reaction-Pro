# ⚡ Reaction Pro

**Reaction Pro** is a simple and interactive reaction time tester that measures how quickly you can respond to a visual change. The app challenges your reflexes by making you wait for a random moment before the screen changes color—once it does, your goal is to react as fast as possible.

🔗 **Live Demo:** https://reaction-pro-seven.vercel.app/  
📦 **GitHub Repository:** https://github.com/chinmay-260807/Reaction-Pro.git

---

## 🌟 Overview

Reaction Pro is designed to test and improve reflex speed in a fun, minimal way. Unlike predictable timers, the app introduces a random delay before the color change, preventing anticipation and ensuring a fair reaction test each time.

The project focuses on accurate timing, clean UI state management, and smooth user interaction while remaining lightweight and easy to use.

---

## ✨ Features

- ⚡ Accurate reaction time measurement in milliseconds  
- 🎨 Clear color change cue to trigger reactions  
- 🎲 Random delay before color change to prevent guessing  
- ⏱️ Detects and warns about early clicks (“Too Soon”)  
- 🔁 Retry option for repeated testing  
- 📱 Fully responsive (desktop & mobile friendly)  
- ⚡ Fast, client-side only app  
- 🚀 Deployed on Vercel  

---

## 🛠️ Tech Stack

- React  
- Vite  
- TypeScript  
- HTML, CSS, JavaScript  
- Vercel  

---

## 🎮 How to Use the App (Tutorial)

1. Open the app using the live demo link above.  
2. You’ll see a neutral screen with instructions.  
3. Click the **Start** button to begin the test.  
4. Wait patiently — the screen will change color after a random delay.  
5. **As soon as the color changes, tap/click anywhere on the screen.**  
6. Your reaction time (in milliseconds) will be displayed.  
7. If you click too early, the app will show a **“Too Soon”** message.  
8. Click **Retry** to test your reaction speed again.

Try multiple rounds to see how consistent your reaction time is.

---

## 🧑‍💻 Run the Project Locally

To run Reaction Pro on your local machine:

```bash
# Clone the repository
git clone https://github.com/chinmay-260807/Reaction-Pro.git

# Navigate into the project folder
cd Reaction-Pro

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at:
```
http://localhost:5173
```

---

## 📦 Build & Preview Production Version

```bash
npm run build
npm run preview
```

This creates an optimized production build inside the `dist/` folder.

---

## 🌐 Deployment

Reaction Pro is deployed using **Vercel**.

Recommended configuration:
- **Framework Preset:** Vite  
- **Build Command:** `npm run build`  
- **Output Directory:** `dist`  

No environment variables or external APIs are required.

---

## 💡 What I Learned

- Handling precise timing and delays in frontend applications  
- Managing multiple UI states (waiting, ready, reacting, result)  
- Preventing premature user interactions  
- Building interactive apps with minimal but clear feedback  
- Deploying performance-sensitive apps using Vercel  

---

## 📄 License

This project is open source and available under the **MIT License**.

---

How fast are you? ⚡ Try to beat your best time!
