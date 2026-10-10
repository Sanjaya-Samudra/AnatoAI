# AnatoAI - Interactive 3D Health Assistant

AnatoAI is a cutting-edge web application that combines interactive 3D visualization with AI-powered health analysis. Users can explore a detailed 3D human model, select specific body parts via interactive pins, and receive instant, context-aware medical insights powered by the Groq AI engine.

## 🚀 Features

-   **Interactive 3D Human Model**: High-fidelity 3D rendering using React Three Fiber.
-   **Pinpoint Selection**: Precise, clickable pins on key body parts (Head, Eyes, Chest, Arms, Legs, etc.).
-   **AI Health Analysis**: Integrated chat interface powered by the configured Groq model to answer health questions related to selected body parts.
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
    
    > **Note:** Without an API key, chat shows a clear unavailable message. It never invents a mock medical answer.

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

Development and builds use Next.js webpack mode for the verified Windows startup path.

The first development request can take time to compile the 3D dependencies. Keep the terminal open and wait for the route compilation to finish. Subsequent requests use the generated cache. The homepage redirects on the server to `/landing`.


## Performance and guided chat upgrade

- Streamed AI answers with Stop, Retry, and cancellation when a different point is selected.
- Optional severity, duration, and pain-description controls appear after the first answer. The selected left/right region is included in chat context.
- Searchable pain-point list with keyboard navigation, plus a mobile chat sheet that leaves the anatomy view visible.
- Download a printable HTML consultation summary. User-entered details and AI-generated notes are separated. The file is generated locally, contains no executable scripts, and can be printed or saved as PDF from the browser.
- Geometry-preserving compression reduced all 16 model assets from 266,867,116 to 90,733,124 bytes (66.0%). These are asset-size measurements, not claims about end-to-end latency. Detailed measurements are in `docs/model-optimization.json`.
- Viewer code loads separately; visible loading feedback, adaptive pixel ratio/shadows, and hidden-tab rendering suspension reduce unnecessary work.

### Production chat protection

Local development has an in-process limit of 12 requests per minute and a global ceiling of 120 requests per minute. Production requires a shared Redis REST service (Upstash-compatible) so all server instances share the same atomic counters:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-rest-endpoint
UPSTASH_REDIS_REST_TOKEN=your-server-only-token
# Optional: only configure a header that your trusted proxy overwrites.
# CHAT_TRUSTED_IP_HEADER=x-your-verified-client-ip-header
```

If no trusted IP header is configured, requests share one conservative rate-limit bucket. Never expose a deployment directly while trusting a client-controlled forwarding header. When Redis is missing or unavailable in production, chat returns 503 rather than bypassing limits. The UI and 3D viewer remain available. No health content is written to Redis; keys contain a hash of the rate-limit identity.

The API caps request bodies at 64 KiB, history at 16 messages, user messages at 2,000 characters, validates body points and symptom options, rejects cross-origin browser requests, times out AI generation after 45 seconds, and keeps provider error details private. Production API keys stay in server environment variables. The client sends a bounded recent conversation; there is no automatic browser persistence of symptom information.

### Verification

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Run `npm run test:e2e:local` to start an isolated verification server on port 3100, run desktop/mobile checks, and stop that server automatically. It uses `.next-verify` so your regular development cache remains independent. On Windows, it detects Chrome in its standard installation location. Otherwise install Playwright Chromium with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROME_PATH` to an installed Chrome executable.

Use `npm run test:e2e` against an already running instance at `http://127.0.0.1:3100`, or set `PLAYWRIGHT_BASE_URL`. Tests cover desktop and mobile keyboard selection, initial scroll position, optional details, summary download, Stop/Retry, and error recovery. AI responses are intercepted in browser tests; live provider verification is separate.

`npm run optimize:models` is an idempotent asset pipeline. It skips already compressed models and verifies decoded attributes, triangle winding, original node transforms, skins, animation data, and lossless texture pixels against the source. Uncompressed originals remain available in Git history. Do not repeatedly apply lossy transformations to the compressed output.
