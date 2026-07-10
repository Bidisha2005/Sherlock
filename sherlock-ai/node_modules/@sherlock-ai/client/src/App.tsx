import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Camera,
  FileText,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Mic2,
  MonitorUp,
  Settings,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { tickConfidence } from "./store/predictionSlice";
import { useRealtimeDashboard } from "./realtime/useRealtimeDashboard";
import { EvidenceSignal, Participant } from "./types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "architecture", label: "Architecture", icon: GitBranch },
  { id: "settings", label: "Settings", icon: Settings }
] as const;

type Page = (typeof navItems)[number]["id"];

const pct = (value: number) => `${Math.round(value * 100)}%`;

export function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const dispatch = useAppDispatch();
  const realtime = useRealtimeDashboard();
  const prediction = useAppSelector((state) => state.prediction);

  useEffect(() => {
    if (realtime.connected) return;
    const interval = window.setInterval(() => dispatch(tickConfidence()), 3200);
    return () => window.clearInterval(interval);
  }, [dispatch, realtime.connected]);

  const candidate = prediction.participants.find((participant) => participant.id === prediction.candidateId);

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-[#0d1324] px-4 py-5 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan text-ink">
            <BrainCircuit size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold">Sherlock AI</p>
            <p className="text-xs text-slate-400">Live candidate inference</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  page === item.id ? "bg-panel2 text-white" : "text-slate-400 hover:bg-panel hover:text-slate-100"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-line bg-panel p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={16} className="text-mint" />
            Challenge Mode
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">Candidate metadata says Aisha Khan. The participant joins as MacBook Pro.</p>
        </div>
      </aside>

      <main className="lg:pl-64">
        <Header
          provider={prediction.provider}
          meetingId={prediction.meetingId}
          candidate={candidate}
          confidence={prediction.confidence}
          realtimeConnected={realtime.connected}
        />
        {page === "dashboard" && <Dashboard />}
        {page === "architecture" && <Architecture />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

function Header({
  provider,
  meetingId,
  candidate,
  confidence,
  realtimeConnected
}: {
  provider: string;
  meetingId: string;
  candidate?: Participant;
  confidence: number;
  realtimeConnected: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink/90 px-5 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-slate-500">
            <span>{provider}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>{meetingId}</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Candidate identification dashboard</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric icon={Sparkles} label="Selected" value={candidate?.displayName ?? "Unknown"} tone="cyan" />
          <Metric icon={Activity} label="Confidence" value={pct(confidence)} tone="mint" />
          <Metric icon={Users} label="Realtime" value={realtimeConnected ? "Connected" : "Fallback"} tone="amber" />
        </div>
      </div>
    </header>
  );
}

function Dashboard() {
  const prediction = useAppSelector((state) => state.prediction);
  const candidate = prediction.participants.find((participant) => participant.id === prediction.candidateId);
  const positive = prediction.evidence.filter((item) => item.direction === "positive");
  const weak = prediction.evidence.filter((item) => item.direction !== "positive");

  return (
    <div className="space-y-6 px-5 py-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-line bg-panel p-5">
          <div className="mb-5 grid gap-3 rounded-lg border border-line bg-[#0f1628] p-4 md:grid-cols-3">
            <Metric icon={FileText} label="Expected candidate" value="Aisha Khan" tone="cyan" />
            <Metric icon={Users} label="Observed display" value="MacBook Pro" tone="amber" />
            <Metric icon={ShieldCheck} label="Failure mode" value="Wrong display name" tone="mint" />
          </div>
          <div className="flex flex-col gap-5 md:flex-row">
            {candidate && <CandidateSpotlight candidate={candidate} confidence={prediction.confidence} reason={prediction.reason} />}
            <ConfidenceChart values={prediction.confidenceSeries} />
          </div>
        </div>
        <EvidencePanel positive={positive} weak={weak} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ParticipantGrid />
        <RankingTable />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <TranscriptPanel />
        <TimelinePanel />
      </section>

      <LogsPanel />
    </div>
  );
}

function CandidateSpotlight({ candidate, confidence, reason }: { candidate: Participant; confidence: number; reason: string }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-4">
        <img src={candidate.avatarUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
        <div>
          <p className="text-sm text-slate-400">Selected participant</p>
          <h2 className="text-3xl font-semibold text-white">{candidate.displayName}</h2>
          <p className="mt-1 text-sm text-slate-400">{candidate.email}</p>
        </div>
      </div>
      <div className="mt-5 h-3 rounded-full bg-slate-800">
        <div className="h-3 rounded-full bg-mint" style={{ width: pct(confidence) }} />
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">{reason}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge icon={Mic2} text="Answer-heavy speech role" />
        <Badge icon={Camera} text="Face visible" />
        <Badge icon={MonitorUp} text="Screen sharing" />
        <Badge icon={FileText} text="Resume match" />
      </div>
    </div>
  );
}

function ConfidenceChart({ values }: { values: number[] }) {
  const data = useMemo(
    () => ({
      labels: values.map((_, index) => `${index + 1}`),
      datasets: [
        {
          data: values.map((value) => Math.round(value * 100)),
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34, 211, 238, 0.18)",
          fill: true,
          tension: 0.35,
          pointRadius: 3
        }
      ]
    }),
    [values]
  );

  return (
    <div className="min-h-64 flex-1 rounded-lg border border-line bg-[#0f1628] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Confidence graph</h3>
        <BarChart3 size={18} className="text-cyan" />
      </div>
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: "#273149" }, ticks: { color: "#94a3b8" } },
            y: { min: 0, max: 100, grid: { color: "#273149" }, ticks: { color: "#94a3b8" } }
          }
        }}
      />
    </div>
  );
}

function ParticipantGrid() {
  const participants = useAppSelector((state) => state.prediction.participants);
  const ranking = useAppSelector((state) => state.prediction.ranking);

  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <SectionTitle icon={Users} title="Participant cards" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {participants.map((participant) => {
          const row = ranking.find((item) => item.participantId === participant.id);
          return (
            <article key={participant.id} className="rounded-lg border border-line bg-[#0f1628] p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={participant.avatarUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  {participant.isSpeaking && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-mint ring-2 ring-[#0f1628]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{participant.displayName}</p>
                  <p className="truncate text-xs text-slate-400">{participant.email}</p>
                </div>
                <span className="text-sm font-semibold text-cyan">{pct(row?.confidence ?? 0)}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                <Status active={participant.webcamEnabled} label="Camera" />
                <Status active={participant.isSpeaking} label="Speaking" />
                <Status active={participant.screenSharing} label="Share" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EvidencePanel({ positive, weak }: { positive: EvidenceSignal[]; weak: EvidenceSignal[] }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <SectionTitle icon={ListChecks} title="Evidence panel" />
      <div className="mt-4 space-y-4">
        <EvidenceGroup title="Positive signals" items={positive.slice(0, 4)} />
        <EvidenceGroup title="Negative / unknown signals" items={weak.slice(0, 4)} />
      </div>
    </section>
  );
}

function EvidenceGroup({ title, items }: { title: string; items: EvidenceSignal[] }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-slate-300">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={`${item.participantId}-${item.signal}`} className="rounded-lg bg-[#0f1628] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{item.signalLabel ?? item.signal}</p>
              <span className={item.direction === "positive" ? "text-mint" : item.direction === "negative" ? "text-rose" : "text-amber"}>
                {pct(item.confidence)}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingTable() {
  const rows = useAppSelector((state) => state.prediction.ranking);
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <SectionTitle icon={BarChart3} title="Ranking table" />
      <div className="mt-4 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0f1628] text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.participantId}>
                <td className="px-4 py-3 font-medium text-white">{row.displayName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-28 rounded-full bg-slate-800">
                      <div className="h-2 rounded-full bg-cyan" style={{ width: pct(row.confidence) }} />
                    </div>
                    {pct(row.confidence)}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{row.score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TranscriptPanel() {
  const transcript = useAppSelector((state) => state.prediction.transcript);
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <SectionTitle icon={FileText} title="Live transcript" />
      <div className="mt-4 space-y-3">
        {transcript.map((segment) => (
          <article key={segment.id} className="rounded-lg bg-[#0f1628] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-white">{segment.speaker}</p>
              <span className={segment.isAnswer ? "text-xs text-mint" : "text-xs text-amber"}>{segment.time}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{segment.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TimelinePanel() {
  const timeline = useAppSelector((state) => state.prediction.timeline);
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <SectionTitle icon={Activity} title="Timeline" />
      <div className="mt-4 space-y-3">
        {timeline.map((event) => (
          <div key={event.id} className="flex gap-3">
            <span className="mt-1 h-3 w-3 rounded-full bg-cyan" />
            <div>
              <p className="text-sm font-medium text-white">{event.label}</p>
              <p className="text-xs text-slate-500">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LogsPanel() {
  const logs = useAppSelector((state) => state.prediction.logs);
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <SectionTitle icon={Activity} title="Logs" />
      <div className="mt-4 grid gap-2">
        {logs.map((log) => (
          <div key={log.id} className="grid gap-3 rounded-lg bg-[#0f1628] px-4 py-3 text-sm md:grid-cols-[80px_80px_1fr]">
            <span className="text-slate-500">{log.time}</span>
            <span className={log.level === "warn" ? "text-amber" : log.level === "debug" ? "text-cyan" : "text-mint"}>{log.level}</span>
            <span className="text-slate-300">{log.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Architecture() {
  const steps = ["Participant Events", "Feature Extraction", "Vision Engine", "Speech Engine", "Transcript Engine", "Evidence Aggregator", "Confidence Engine", "Explanation Generator", "Frontend Dashboard"];
  return (
    <div className="px-5 py-6 lg:px-8">
      <section className="rounded-lg border border-line bg-panel p-5">
        <SectionTitle icon={GitBranch} title="Architecture" />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="rounded-lg border border-line bg-[#0f1628] p-4">
              <p className="text-xs text-cyan">Stage {index + 1}</p>
              <p className="mt-2 font-medium text-white">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="px-5 py-6 lg:px-8">
      <section className="rounded-lg border border-line bg-panel p-5">
        <SectionTitle icon={Settings} title="Settings" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {["Display name matching", "Calendar metadata", "Speech diarization", "Face visibility", "Resume matching", "Transcript analysis"].map((setting) => (
            <label key={setting} className="flex items-center justify-between rounded-lg bg-[#0f1628] px-4 py-3">
              <span className="text-sm text-slate-200">{setting}</span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-cyan" />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: string; tone: "cyan" | "mint" | "amber" }) {
  const color = tone === "cyan" ? "text-cyan" : tone === "mint" ? "text-mint" : "text-amber";
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3">
      <div className={`flex items-center gap-2 text-xs ${color}`}>
        <Icon size={15} />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Activity; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={18} className="text-cyan" />
      <h2 className="font-semibold text-white">{title}</h2>
    </div>
  );
}

function Badge({ icon: Icon, text }: { icon: typeof Activity; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-[#0f1628] px-3 py-2 text-xs text-slate-300">
      <Icon size={14} className="text-cyan" />
      {text}
    </span>
  );
}

function Status({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="rounded-lg bg-ink px-2 py-2">
      <p className={active ? "font-semibold text-mint" : "text-slate-500"}>{active ? "On" : "Off"}</p>
      <p>{label}</p>
    </div>
  );
}
