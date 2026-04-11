<div align="center">

<br/>

# 🌿 Aeris — AI Eco Intelligence Scanner

**Scan any product. Understand its true environmental cost. Make smarter choices.**

[![Made with HTML](https://img.shields.io/badge/Built%20with-HTML%20%2B%20CSS%20%2B%20JS-10b981?style=flat-square&logo=html5&logoColor=white)](https://github.com)
[![AI Powered](https://img.shields.io/badge/AI-Vision%20%2B%20NLP-a3e635?style=flat-square&logo=openai&logoColor=black)](https://github.com)
[![License MIT](https://img.shields.io/badge/License-MIT-059669?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-10b981?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

<br/>

> *"Every product has a hidden environmental cost. Aeris surfaces it."*

<br/>

---

</div>

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Author](#-author)

---

## 🌿 Overview

**Aeris** is an AI-powered environmental intelligence platform that analyzes product images and delivers a comprehensive sustainability report in seconds. Upload a photo of any product — packaging, label, or even a webshop screenshot — and Aeris instantly returns carbon footprint data, water usage metrics, recyclability scores, eco-friendly alternatives, and actionable sustainability tips.

Built as a single-page web application with a sleek dark UI, Aeris combines computer vision and natural language AI to make sustainability data accessible and beautifully presented to everyone.

> Aeris is designed for consumers, researchers, sustainability consultants, and developers who want to integrate eco-intelligence into their workflows.

---


## ✨ Features

### 🔬 Core Scanner
| Feature | Description |
|---|---|
| **Drag & Drop Upload** | Drop any product image onto the orbital upload zone or click to browse |
| **Orbital UI** | Three animated concentric rings with pulsing node dots create a distinctive upload experience |
| **Fullscreen Scan Animation** | Image expands fullscreen with a sweeping green beam, corner brackets, and progress bar |
| **GreenSight Watermark** | Branded dim watermark appears behind the scanned image during analysis |

### 📊 Analysis Report (Bento Grid)
| Card | Description |
|---|---|
| **Sustainability Score** | 0–100 animated ring counter with dynamic color coding (red → amber → lime → emerald) |
| **Carbon Footprint** | CO₂ equivalent savings vs. conventional alternatives |
| **Water Usage** | Litres of water consumed in the product lifecycle |
| **Air Quality Impact** | Particulate and emissions data |
| **Environmental Summary** | Full AI-generated paragraph on the product's ecological impact |
| **Materials Identified** | Detected materials (PET, glass, organic, etc.) |
| **Eco Alternatives** | 3–5 greener product alternatives |
| **Sustainability Tips** | Actionable steps to reduce impact |

### 📄 PDF Export
- One-click **professional report download** — full scan results in a styled HTML file
- Print-ready layout: open in browser → Ctrl+P → Save as PDF
- Includes: branding, score circle, metrics grid, impact summary, materials, alternatives, tips
- Auto-named: `Aeris_[ProductName]_[Timestamp].html`

### 🔊 AI Voice Assistant
- **Web Speech API** powered voice summary — reads the full report aloud
- Smart voice selection: prefers Google UK English Female, Samantha, or best available
- Animated **waveform bars** pulse during playback
- Inline **script panel** shows exactly what's being read
- Toggle to stop at any time

### 🕓 Scan History
- All past scans stored in **localStorage** — persists across sessions
- Card grid with product name, date, score bar, and color-coded rating
- Click any card to view the full report again
- Delete individual scans or clear all history

### 🎬 Live Demo Widget
- Built-in **4-stage animated demo** in the scanner panel:
  1. `Upload` — Animated cursor moves to the drop zone, clicks, image appears
  2. `Scan` — Green grid + beam sweep + tags light up one by one
  3. `AI Analyse` — Live terminal with streaming commands + score ring animating
  4. `Results` — Product card, metric tiles, eco-alternatives cascade in
- Auto-loops every 5 seconds, IntersectionObserver triggered
- Manual ↺ Replay button

### 🎨 UI/UX Highlights
- Full **dark theme** — emerald × slate × charcoal
- Hex-grid background pattern + grain texture overlay
- Ambient blur orbs for depth
- Smooth `clip-path: circle()` zoom transitions
- Staggered `fadeUp` card animations throughout
- Compact single-row footer with social links
- Toast notification system

---

## 🛠 Tech Stack

```
Frontend
├── HTML5                  — Semantic single-page application
├── CSS3                   — Custom properties, grid, animations, clip-path
├── Vanilla JavaScript     — No framework dependencies
│
APIs & Browser Features
├── Web Speech API         — Voice synthesis for AI voice summaries
├── FileReader API         — Client-side image handling
├── localStorage           — Persistent scan history
├── IntersectionObserver   — Lazy demo autoplay
├── Fetch API              — Backend communication for AI analysis
│
Fonts
├── Outfit (Google Fonts)  — Primary UI typeface
└── JetBrains Mono         — Monospaced data / terminal displays
```

> **Backend (bring your own):** Aeris expects a `POST /analyze` endpoint that accepts `multipart/form-data` with an `image` field and returns a JSON analysis object. You can connect any vision + LLM API (OpenAI GPT-4o Vision, Google Gemini, Claude, etc.).

### Expected API Response Schema

```json
{
  "product_name": "Plastic Water Bottle (500ml)",
  "category": "Beverages",
  "sustainability_score": 28,
  "environmental_impact": "Single-use PET plastic contributes significantly to microplastic pollution...",
  "impact_metrics": {
    "carbon_saved": "1.2 kg CO₂",
    "water_saved": "14 L",
    "air_impact": "Moderate"
  },
  "materials_likely_used": ["PET Plastic", "Polypropylene Cap", "Paper Label"],
  "sustainable_alternatives": ["Stainless steel reusable bottle", "Glass bottle", "Filtered tap water"],
  "sustainability_tips": [
    "Switch to a reusable bottle — saves ~150 plastic bottles per year",
    "Choose brands with take-back recycling programs"
  ]
}
```

---

## 📁 Project Structure

```
aeris/
│
├── README.md                      # This file
├── LICENSE                        # MIT License
│
├── templates/                     # HTML templates (Jinja2 / Flask / Django)
│   ├── landingpage.html           # Marketing landing page — hero, features, CTA
│   └── index.html                 # Main scanner app — full SPA with bento results
│
├── static/                        # Static assets served by the backend
│   ├── css/
│   │   ├── landing.css            # Styles for landingpage.html
│   │   └── app.css                # Styles for index.html (scanner UI)
│   │
│   ├── js/
│   │   ├── landing.js             # JS for landing page interactions
│   │   └── app.js                 # Core scanner logic — upload, scan, PDF, voice
│   │
│   └── assets/
│       ├── favicon.svg
│       └── og-image.png           # Social share preview image
│
├── backend/                       # AI analysis backend
│   ├── server.py                  # FastAPI / Flask server — exposes POST /analyze
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Environment variables template (API keys)
│
└── docs/                          # Additional documentation
    ├── API.md
    └── DEPLOYMENT.md
```

> Note: Aeris is intentionally a **zero-dependency single-file frontend**. The entire UI, animations, and logic live in `index.html`. This makes it trivially deployable to any static host.

---

## ⚙️ How It Works

```
User uploads product image
        │
        ▼
┌─────────────────────────────┐
│  Fullscreen Scan Animation  │  ← clip-path zoom, beam sweep, watermark
└─────────────────────────────┘
        │  (parallel)
        ▼
┌─────────────────────────────┐
│   POST /analyze (FormData)  │  ← image sent to your AI backend
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  AI Vision + LLM Analysis   │  ← GPT-4o / Gemini / Claude identifies
│                             │    product, estimates lifecycle metrics,
│                             │    generates sustainability score + report
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│   Bento Grid Results UI     │  ← score ring, metric cards, eco tips
└─────────────────────────────┘
        │
        ├──▶  📄 Download PDF     ← styled HTML report, print-to-PDF
        │
        └──▶  🔊 Voice Summary    ← Web Speech API reads the full report
```

Both the scan animation and the API call run **in parallel** using `Promise.all()` — so results appear the moment both finish, with no wasted waiting time.

---



## 🗺 Roadmap

| Status | Feature |
|---|---|
| ✅ | Drag & drop image upload with orbital UI |
| ✅ | Fullscreen scan animation with GreenSight watermark |
| ✅ | AI-powered sustainability report (bento grid) |
| ✅ | Animated sustainability score ring |
| ✅ | PDF export with professional layout |
| ✅ | AI voice summary (Web Speech API) |
| ✅ | Scan history with localStorage |
| ✅ | Interactive live demo widget |
| ✅ | Compact footer with social links |
| 🔄 | Backend integration guide (FastAPI + GPT-4o) |
| 🔄 | Browser extension for scanning products on any website |
| 🔄 | Comparison mode — scan two products side by side |
| 🔄 | User accounts + cloud sync history |
| 🔄 | Barcode / QR code scanning support |
| 🔄 | Share report via link / social cards |
| 🔄 | Mobile PWA — installable on iOS & Android |
| 🔄 | Multi-language voice summaries |
| 📋 | Carbon offset integration (partner APIs) |
| 📋 | Brand sustainability database |
| 📋 | Weekly eco-impact digest emails |

---



## 📄 License

```
MIT License

Copyright (c) 2025 Aeris

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

See [LICENSE](LICENSE) for full text.

---

## 👤 Author

<div align="center">

**Built with 🌿 by [Vansh Gupta](https://github.com/vanshgupta87)**


</div>

---

<div align="center">

### 🌍 *If this project helped you think greener, give it a ⭐ — it means the world.*

<br/>

`aeris` · `sustainability` · `eco-scanner` · `AI` · `computer-vision` · `green-tech` · `climate-tech` · `web-app`

</div>
