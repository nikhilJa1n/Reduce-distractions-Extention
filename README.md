# Reduce Distraction — Chrome Extension 🧘‍♂️

A premium, glassmorphism-themed browser extension designed to help you regain focus by introducing a mindful pause before you dive into distracting websites or open new tabs.

## ✨ Features

### 🆕 Mindful New Tab
- **Two-Stage Flow**:
    1. **Pause Stage**: Displays a live clock, breathing animation, and a motivational quote to center your mind.
    2. **Focus Stage**: Transitions to a minimal search/URL bar after clicking "Continue", allowing you to type your destination without distractions.
- **Intention Prompt**: Write down your browsing intention before you proceed.

### 🔄 Refresh & Navigation Overlay
- **Instant Intervention**: Injects a full-screen pause overlay when you refresh a page or type a URL directly into the address bar.
- **Unified Aesthetic**: Shares the same calming design as the new tab page.

### ⚙️ Personalized Settings
- **Mandatory Timer**: Enforce a pause of several seconds or minutes. The "Continue" button stays disabled until the timer expires.
- **Auto-Continue**: Toggle a setting to automatically dismiss the pause once the timer reaches zero.
- **Site Filters**:
    - **Blacklist**: Only pause on specific distracting sites (e.g., `youtube.com`).
    - **Whitelist**: Pause everywhere *except* for your productive tools (e.g., `docs.google.com`).
    - **Always Pause**: The default mode to keep every navigation intentional.

### 🎨 Visuals
- **Dark Glassmorphism**: High-end UI with vibrant gradients, blurred backgrounds, and smooth animations.
- **Breathing Guide**: A pulsing animation to guide you through a quick box-breathing cycle.

## 🛠️ Tech Stack
- **Manifest V3**: Using modern Chrome extension standards.
- **HTML5 & Vanilla CSS**: Clean, responsive, and performant design.
- **JavaScript**: Robust logic with `chrome.storage.sync` for cross-device setting persistence.

## 🚀 Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the extension folder.
5. Pin the extension for quick access to settings!

## 📜 License
MIT