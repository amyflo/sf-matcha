import { MatchaRecommender } from "@/app/components/matcha-recommender";

export default function Home() {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.22),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(216,232,207,0.18),transparent_30%),linear-gradient(180deg,rgba(255,253,248,0.12)_0,transparent_45%,rgba(61,52,41,0.06)_100%)]">
      <main className="flex h-full min-h-0 w-full flex-1 flex-col">
        <MatchaRecommender />
      </main>
    </div>
  );
}
