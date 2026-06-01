import { MatchaRecommender } from "@/app/components/matcha-recommender";

export default function Home() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.55),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(216,232,207,0.45),transparent_30%),linear-gradient(180deg,#fffdf8_0,var(--color-paper)_45%,var(--color-paper-deep)_100%)]">
      <main className="flex h-full min-h-0 w-full flex-1 flex-col">
        <MatchaRecommender />
      </main>
    </div>
  );
}
