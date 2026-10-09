# AnatoAI - Interactive 3D Health Assistant

AnatoAI is a cutting-edge web application that combines interactive 3D visualization with AI-powered health analysis. Users can explore a detailed 3D human model, select specific body parts via interactive pins, and receive instant, context-aware medical insights powered by the Groq AI engine.

## 🚀 Features

-   **Interactive 3D Human Model**: High-fidelity 3D rendering using React Three Fiber.
-   **Pinpoint Selection**: Precise, clickable pins on key body parts (Head, Eyes, Chest, Arms, Legs, etc.).
-   **AI Health Analysis**: Integrated chat interface powered by Groq (Llama 3) to answer health questions related to selected body parts.
-   **Responsive UI**: Modern, glass-morphism interface built with Tailwind CSS.
-   **Smart Controls**: Intuitive camera controls restricted to the relevant viewing area.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **3D Engine**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) / [Drei](https://github.com/pmndrs/drei)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **AI Integration**: [Groq SDK](https://console.groq.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v22.19 or higher; required for system certificate trust)
-   npm or yarn

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Sanjaya-Samudra/AnatoAI.git
    cd AnatoAI
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add your Groq API key.
    
    ```env
    GROQ_API_KEY=your_groq_api_key_here
    GROQ_MODEL=openai/gpt-oss-20b
    ```
    
    > **Note:** If no API key is provided, the application will run in "Mock Mode", providing static responses for demonstration purposes.

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```

5.  **Open the Application**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Controls

-   **Left Click + Drag**: Rotate the model.
-   **Right Click + Drag**: Pan the camera (limited to the immediate area).
-   **Scroll**: Zoom in/out (limited range).
-   **Click Pin**: Select a body part to open the AI analysis panel.

## 📄 License

**© 2025 AnatoAI. All Rights Reserved.**

This project and its source code are proprietary. Unauthorized copying, modification, distribution, or use of this software, in whole or in part, is strictly prohibited without explicit permission from the copyright holders.

## Development Team

- Sanjaya Samudra
- Praveen Tharuka
- Yasas Chamod
- Sithum Dineth

## Startup troubleshooting

Run commands from the project directory. If generated Next.js files are corrupted, stop the server, remove only `.next`, then run `npm run dev` again. The cache is regenerated automatically. Source files must remain UTF-8 text; restore damaged source from a known-good Git revision after backing it up.

The configuration uses `next.config.mjs` to avoid native TypeScript config compilation during startup on Windows.

The development server binds to `localhost:3000`. Port 3000 is the development default. To choose another port, run `npm run dev -- --port 3002`.

Inter is bundled locally under `src/app/fonts` using its SIL Open Font License, so starting/building the app does not require a Google Fonts download.

The npm scripts enable Node.js system CA trust (`--use-system-ca`) to use trusted Windows certificates while keeping TLS verification enabled. Chat defaults to `openai/gpt-oss-20b`; set `GROQ_MODEL` to another model available to your Groq account when needed.

Development and builds use Next.js webpack mode for the verified Windows startup path. The UI and model assets are unchanged.

The first development request can take time to compile the 3D dependencies. Keep the terminal open and wait for the route compilation to finish. Subsequent requests use the generated cache. The homepage redirects on the server to `/landing`.
