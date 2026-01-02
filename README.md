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
-   [Node.js](https://nodejs.org/) (v18 or higher)
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

## 🔧 Customization

### Adjusting Pin Positions
You can manually fine-tune the position of the interactive pins on the 3D model.

1.  Open `src/components/BodyModel.tsx`.
2.  Locate the `FULL_BODY_PARTS` configuration array.
3.  Adjust the `pinOffset` values `[x, y, z]` for any body part.
    *   Increasing values generally moves the pin further outward from the body center.

```typescript
// Example: Moving the Head pin further forward (z-axis)
{ name: "Head", ..., pinOffset: [0, 0.15, 0.35] },
```

## 📄 License

**© 2025 AnatoAI. All Rights Reserved.**

This project and its source code are proprietary. Unauthorized copying, modification, distribution, or use of this software, in whole or in part, is strictly prohibited without explicit permission from the copyright holders.
