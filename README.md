# 🚀 HireSync AI: Intelligent Resume Screening Engine

**HireSync AI** is a high-performance, AI-powered recruitment tool designed to automate the initial screening of resumes. By leveraging the **Gemini 3 Flash** model, it analyzes PDF resumes against specific Job Descriptions to provide instant, data-driven hiring recommendations.

![HireSync AI Screenshot](https://ais-dev-usczm755w5vddbnxykloem-337529264019.asia-southeast1.run.app/screenshot.png) 
*(Note: Replace with your actual screenshot URL after pushing to GitHub)*

---

## ✨ Key Features

- **📄 Batch PDF Processing:** Upload multiple resumes at once and process them in parallel.
- **🤖 AI-Powered Analysis:** Uses Google's Gemini AI to evaluate technical skills, experience, and cultural fit.
- **📊 Real-time Ranking:** Automatically ranks candidates by score (0-100) and provides a verdict (Shortlist, Maybe, Reject).
- **🔍 Deep Insights:** Generates executive summaries, key strengths, and areas of concern for every candidate.
- **🎨 Brutalist UI:** A clean, high-contrast interface built with Tailwind CSS and Framer Motion for a professional feel.

---

## 🛠️ Tech Stack

### Frontend
- **React 19:** Modern UI development with functional components and hooks.
- **Vite:** Lightning-fast build tool and development server.
- **Tailwind CSS:** Utility-first styling for a responsive, custom design.
- **Framer Motion:** Smooth animations and layout transitions.
- **Lucide React:** Beautiful, consistent iconography.

### AI & Processing
- **Google Gemini API:** Powering the intelligent resume analysis and scoring.
- **PDF.js:** Client-side PDF text extraction for privacy and speed.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Google AI Studio API Key](https://aistudio.google.com/app/apikey)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/hiresync-ai.git
cd hiresync-ai
npm install
