# 🧩 Design Organizer — Figma Plugin

![Design Organizer Cover](https://user-images.githubusercontent.com/16322616/62862692-46b5f600-bd0f-11e9-93b0-75955d1de8f3.png)

**Design Organizer** is a **Figma plugin** built with **React + TypeScript**, designed to help you **audit, classify, and synchronize your design tokens** — including color styles, text configurations, and other UI assets — in a fast and structured way.

> 🎨 *Simplify your design management.*  
> Analyze variables, detect inconsistencies, and organize styles with a single click.

---

## 🚀 Features

- 🔍 **Smart Scanning** — automatically analyzes text and color styles within your selection or the entire page.  
- 🎨 **Design Token Management** — visualize, group, and organize colors, typography, and decorations.  
- ⚙️ **Modular Architecture** — each section (Color, Text, Sync, Export, Accessibility) works as an independent module.  
- 💡 **Style Synchronization** — create or link local and team styles instantly.  
- 🖼️ **Bulk Image Export** — export multiple assets at once with optimized settings.  
- ♿ **Accessibility Checker** — test color contrast and text legibility in seconds.  
- ⚡ **Modern & Minimal UI** — built with React, Tailwind, and the Figma Plugin API.

---

## 🧱 Project Structure

```bash
design-organizer/
│
├── src/
│   ├── main/               # Core Figma plugin logic
│   │   ├── controller.ts   # Message handling and module routing
│   │   ├── scanColors.ts   # Color styles scanner
│   │   ├── scanText.ts     # Text styles scanner
│   │   ├── focusActions.ts # Focus and selection helpers
│   │   └── syncStyles.ts   # Style synchronization logic
│   │
│   ├── ui/                 # React-based plugin interface
│   │   ├── MainView.tsx    # Main entry view
│   │   ├── TextStyles.tsx  # Text style visualization
│   │   ├── ColorStyles.tsx # Color variable visualization
│   │   └── components/     # Reusable UI elements (buttons, tags, layout)
│   │
│   └── utils/              # Shared utilities and converters
│
├── manifest.json           # Figma plugin manifest
├── package.json            # Dependencies and build scripts
├── tsconfig.json           # TypeScript configuration
└── webpack.config.js       # Webpack bundler config
