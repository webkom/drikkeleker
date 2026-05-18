"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lilita } from "@/lib/fonts";
import { Sparkles, LogIn } from "lucide-react";
import { createBeatRoom } from "@/lib/firebaseBeatRooms";

export default function BeatForBeatLanding() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    const result = await createBeatRoom();
    setCreating(false);
    if (!result.success || !result.roomCode) {
      setError(result.error ?? "Noe gikk galt");
      return;
    }
    router.push(`/beat-for-beat/admin/${result.roomCode}`);
  };

  const handleJoin = () => {
    const normalized = joinCode.trim().toLowerCase();
    if (!normalized) {
      setError("Skriv inn en romkode");
      return;
    }
    router.push(`/beat-for-beat/audience/${normalized}`);
  };

  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
      <BeerContainer color="amber" className="min-h-dvh">
        <div className="pt-16 flex flex-col items-center gap-8 max-w-md w-full">
          <h1 className={`${lilita.className} text-5xl text-center`}>
            Beat for Beat
          </h1>
          <p className="text-center text-gray-700">
            To lag, én frase, 2 røde ord. Gjett, syng og spar tida — det laget
            som velger riktig ord først får sjansen til å score.
          </p>

          <div className="w-full bg-white/80 rounded-2xl shadow p-6 flex flex-col gap-3">
            <h2 className={`${lilita.className} text-2xl`}>Lag nytt rom</h2>
            <p className="text-sm text-gray-600">
              Du blir host og får en romkode du kan dele med publikum.
            </p>
            <Button
              size="lg"
              onClick={handleCreate}
              disabled={creating}
              className="gap-2"
            >
              <Sparkles size={20} />
              {creating ? "Lager rom…" : "Lag rom"}
            </Button>
          </div>

          <div className="w-full bg-white/80 rounded-2xl shadow p-6 flex flex-col gap-3">
            <h2 className={`${lilita.className} text-2xl`}>Bli med</h2>
            <p className="text-sm text-gray-600">
              Skriv inn romkoden for å se spillet som publikum.
            </p>
            <div className="flex gap-2">
              <Input
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="123456"
                inputMode="numeric"
                className="flex-1 bg-white text-center tracking-[0.3em]"
              />
              <Button onClick={handleJoin} className="gap-1">
                <LogIn size={16} /> Bli med
              </Button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
}
