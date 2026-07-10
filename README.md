# Sherlock AI

Sherlock AI identifies the most likely interview candidate during live Google Meet, Microsoft Teams, and Zoom sessions by combining many weak signals into a real-time confidence score. The system never depends on a single rule: every prediction is backed by weighted evidence, negative signals, unknowns, and a human-readable explanation.
# Demo Video-https://drive.google.com/file/d/1larQKue4ciLTlOGhr4DYraNW00m5S8hp/view?usp=drivesdk

## Architecture

```mermaid
flowchart LR
  A["Participant Events"] --> B["Feature Extraction"]
  B --> C["Vision Engine"]
  B --> D["Speech Engine"]
  B --> E["Transcript Engine"]
  C --> F["Evidence Aggregator"]
  D --> F
  E --> F
  F --> G["Confidence Engine"]
  G --> H["Explanation Generator"]
  H --> I["React Dashboard"]
```

## Services

- `client`: React, TypeScript, TailwindCSS, Redux Toolkit, React Query, Chart.js, Socket.IO Client.
- `server`: Node.js, Express, Socket.IO, MongoDB repositories, clean architecture services.
- `ai-service`: Python Flask service with modular CV, speech, transcript, and LLM-assisted analysis.
- `shared`: Cross-service TypeScript contracts for participant events, evidence, predictions, and metrics.
- `scripts`: Mock meeting generator and local orchestration helpers.

## Assumptions

- The system receives participant metadata (display name, join/leave events, webcam status, speaking activity, transcript, etc.) through platform adapters or approved meeting APIs.
- Each participant has a unique identifier throughout the meeting.
- Speech diarization and transcripts are attributed to the correct participant.
- External metadata such as candidate name, email, and interview schedule is available before the interview begins.
- The current prototype uses simulated real-time meeting events for demonstration purposes and can be extended to integrate with production meeting SDKs.
> **🚀 Real-Time Demo**
>
> **After cloning the repository, navigate to the `shrelock-ai` directory and run the application using `npm run dev`. The project is fully integrated with a real-time data stream powered by Socket.IO, allowing the dashboard to receive and display live participant updates, confidence scores, transcripts, rankings, and evidence without requiring a page refresh.**
>
> **The frontend runs on `http://localhost:5173`, the API on `http://localhost:4000`, and the AI service on `http://localhost:5001`**
>
> **Once the backend is running, you can verify that the API is operational by visiting the Health Check endpoint. The frontend automatically establishes a real-time connection with the backend and continuously updates the dashboard as new events are streamed.**

![Live Dashboard](./Screenshot%202026-07-10%20223221.png)
![Live Transcript](./Screenshot%202026-07-10%20223321.png)
![Confidence Timeline](./Screenshot%202026-07-10%20223344.png)
![Ranks](./Screenshot%202026-07-10%20223405.png)
![Participants](./Screenshot%202026-07-10%20223452.png)
![Evidence Panel](./Screenshot%202026-07-10%20223518.png)
![Architecture](./Screenshot%202026-07-10%20223538.png)


## Local Setup

1. Install Node.js 20+ and Python 3.10+.
2. Copy `.env.example` to `.env` and set `JWT_SECRET`. `GEMINI_API_KEY` is optional for local mocks.
3. Install dependencies:

```bash
npm install
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

4. Start the real-time local demo:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`, the API on `http://localhost:4000`, and the AI service on `http://localhost:5001`.

For the current local real-time demo, the Node server starts a synthetic meeting adapter that emits Socket.IO updates every three seconds. The dashboard connects to `http://127.0.0.1:4000`, receives `dashboard.updated`, and updates participant cards, transcript, timeline, logs, ranking, and confidence without refreshing.
## Evaluation

### Testing Approach

The system was evaluated using simulated real-time interview sessions containing multiple participants with varying metadata, speaking patterns, and behavioral signals.

### Edge Cases Covered

- Candidate joins using a device name (e.g., "MacBook Pro")
- Candidate changes display name during interview
- Multiple interviewers join simultaneously
- Silent observers present in meeting
- Missing transcript information
- Webcam disabled
- Multiple participants with similar names
- Incomplete candidate metadata

### Accuracy

The confidence engine combines multiple weighted signals instead of relying on any single heuristic, making predictions more robust under uncertainty.

### Limitations

- Uses simulated meeting adapters instead of production Google Meet/Zoom/Teams APIs.
- Computer vision and speech models are lightweight prototype implementations.
- Confidence weights are rule-based and can be learned from historical interview data in production.
## Core Prediction Contract

Each extractor emits:

```json
{
  "participantId": "p-001",
  "signal": "display_name_similarity",
  "confidence": 0.86,
  "weight": 0.14,
  "direction": "positive",
  "reason": "Display name closely matches the candidate profile name."
}
```

The confidence engine returns:

```json
{
  "candidate": "p-001",
  "confidence": 0.82,
  "topSignals": [],
  "weakSignals": [],
  "reason": "Selected Priya Sharma because profile metadata, transcript self-introduction, speaking behavior, and camera visibility align.",
  "ranking": []
}
```

## Limitations

This local project ships with mock adapters for Google Meet, Microsoft Teams, and Zoom because those platforms do not expose a common public live media/participant API for arbitrary local interception. Production integration should use approved platform SDKs, bot admission flows, consent screens, and enterprise compliance review. Biometric processing must be opt-in, auditable, and regionally compliant.

## Future Improvements

- Provider-specific meeting bot adapters.
- Stronger diarization calibration per room and microphone topology.
- Resume-aware retrieval with vector search.
- Human feedback loop for post-meeting label correction.
- Privacy-preserving on-device face embeddings.
