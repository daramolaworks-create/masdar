<div align="center">
  <img src="public/logo.png" alt="Masdar City Logo" height="100" />
</div>

# Masdar City AI Assistant

A modern, responsive AI chatbot designed to assist users with inquiries regarding Masdar City, including Freezone Setup, UAE Golden Visas, Sustainable Commercial & Residential Real Estate, and general registration FAQs. 

This project leverages the **DeepSeek Reasoner Model** to provide accurate, grounded responses based on an injected Masdar City Knowledge Base.

## Features

- **DeepSeek LLM Integration:** Uses the OpenAI SDK to interface with `deepseek-reasoner` for high-quality, thoughtful answers.
- **Masdar City Knowledge Base:** Pre-loaded with specific context regarding Masdar City's offerings and policies.
- **Persistent Sessions (Local Storage):** Chat history is automatically saved to your browser's local storage.
- **Auto-Titling & Search:** Sessions are automatically titled based on your first query, and the sidebar includes a fully functional search to filter your past chats.
- **Voice Input:** Native Web Speech API integration allows for hands-free dictation.
- **Interactive Recommendations:** A dedicated explore tab featuring glassmorphic UI cards to quickly prompt the AI about popular topics.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env` file in the root directory and add your DeepSeek API key:
   ```env
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL (usually `http://localhost:3000/`).

## Tech Stack
- React
- Vite
- TailwindCSS
- Framer Motion
- DeepSeek AI (via OpenAI SDK)
- Web Speech API
