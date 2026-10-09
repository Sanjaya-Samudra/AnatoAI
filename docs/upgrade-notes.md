# Performance and guided chat

Branch: `feat/performance-guided-chat`

## What changed

- All 16 anatomy assets shrink from 266,867,116 to 90,733,124 bytes: a 66.0% reduction. The optimization checks decoded geometry, triangle winding, node transforms, skins, animations, and texture pixels. Body-point coordinates remain unchanged.
- The anatomy viewer loads in a separate JavaScript chunk, shows loading progress, adapts rendering resolution to performance, and pauses rendering in hidden tabs.
- Answers stream into the existing blue chat design. Stop cancels generation; Retry recovers failed requests. Switching body points cancels the previous request and opens the new answer at the top.
- Optional severity, duration, and pain-description controls appear after the first explanation. Unanswered details remain unspecified.
- Keyboard search distinguishes the left and right sides. The selected marker is highlighted; mobile chat leaves part of the anatomy view visible and keeps controls accessible.
- A printable consultation summary separates user-entered details from AI-generated conversation notes. It is generated in the browser and can be printed to PDF.
- The API validates body points, roles, symptom choices, request size, and conversation length. It enforces request limits, cancels timed-out generation, rejects cross-origin browser requests, and keeps provider errors private.
- Next.js and compatible dependencies were updated. Production dependencies passed `npm audit --omit=dev`. Five development-only advisory entries remain in the ESLint dependency chain; no forced framework downgrade was applied.

## Verification

Verified on 9 October 2026: 12 core tests and six desktop/mobile browser tests passed, along with TypeScript, ESLint, and the production build. A real Groq-backed browser request returned HTTP 200 with 298 stream events; the first answer remained at scroll position zero. Invalid message roles returned 400, and a cross-origin request returned 403. Desktop light/dark and mobile screens were inspected, with no browser runtime errors during the live check.

The core test suite covers validation, selected-side context, stream parsing, rate limits, incomplete responses, and safe export. The browser suite checks desktop and mobile search, initial scroll position, optional details, summary download, Stop/Retry, and recoverable errors. Browser regression tests intercept AI responses so they do not spend API credits or depend on nondeterministic wording.

The asset reduction is measured file size, not a claim that every user journey is 66% faster. Live response time depends on the AI provider, network, and server warm-up.

## Deployment configuration

Keep `GROQ_API_KEY` on the server. Set `GROQ_MODEL` only to a model available to that account.

Production chat requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Without them, production chat intentionally returns 503; local development uses a bounded in-memory limiter. The Redis integration is tested with a simulated REST response; deployment credentials and the real Redis service still need configuration and verification.

Only set `CHAT_TRUSTED_IP_HEADER` to a header overwritten by your deployment proxy. Otherwise requests share a conservative rate-limit bucket. No symptom content is stored in Redis.

Health questions and the selected body point are sent to the application's server and configured Groq service to generate answers. The app does not automatically persist chat history in browser storage. A consultation summary is saved only when the user requests a download.

Restart an existing development terminal after updating dependencies. Use one `npm run dev` process on port 3000. `npm run test:e2e:local` uses port 3100 and a separate cache for verification.
