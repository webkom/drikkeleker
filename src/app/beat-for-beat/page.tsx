"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {lilita} from "@/lib/fonts";
import {HelpCircle, LogIn, Sparkles, X} from "lucide-react";
import {createBeatRoom} from "@/lib/firebaseBeatRooms";
import Stepper, {Step} from "@/components/shared/Stepper";
import * as Popover from "@radix-ui/react-popover";
import {AnimatePresence, motion} from "framer-motion";

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
            <BackButton className="absolute top-4 left-4 z-10" href="/#games"/>
            <BeerContainer color="amber" className="min-h-dvh">
                <div className="pt-16 flex flex-col items-center gap-8 max-w-md w-full">
                    <div className="flex items-center justify-center gap-3">
                        <h1 className={`${lilita.className} text-5xl text-center`}>
                            Beat for Beat
                        </h1>
                        <BeatHelpPopup/>
                    </div>

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
                            <Sparkles size={20}/>
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
                                <LogIn size={16}/> Bli med
                            </Button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <Footer/>
            </BeerContainer>
        </main>
    );
}

function BeatHelpPopup() {
    const [open, setOpen] = useState(false);

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <Button
                    type="button"
                    aria-label="Hjelp"
                    variant="outline"
                    className="rounded-full h-10 w-10 p-0 flex-shrink-0 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 shadow-sm"
                >
                    <HelpCircle size={22}/>
                </Button>
            </Popover.Trigger>

            <AnimatePresence>
                {open && (
                    <Popover.Portal forceMount>
                        <Popover.Content
                            side="bottom"
                            align="center"
                            sideOffset={8}
                            className="bg-white rounded-2xl shadow-xl max-w-[95vw] w-[400px] p-0 overflow-hidden border border-amber-200 z-50"
                            aria-labelledby="help-title"
                            asChild
                        >
                            <motion.div
                                initial={{opacity: 0, scale: 0.95, y: -10}}
                                animate={{opacity: 1, scale: 1, y: 0}}
                                exit={{opacity: 0, scale: 0.95, y: -10}}
                                transition={{duration: 0.15}}
                            >
                                <div
                                    className="p-4 border-b border-amber-100 flex justify-between items-center bg-amber-50/50">
                                    <h2 id="help-title" className={`${lilita.className} text-xl text-amber-900`}>
                                        Hvordan spille:
                                    </h2>
                                    <Popover.Close asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-full hover:bg-amber-100/80 text-amber-900"
                                        >
                                            <X size={16}/>
                                        </Button>
                                    </Popover.Close>
                                </div>

                                <div>
                                    <Stepper
                                        initialStep={1}
                                        onStepChange={() => {
                                        }}
                                        onFinalStepCompleted={() => setOpen(false)}
                                        backButtonText="Forrige"
                                        nextButtonText="Neste"
                                        className="p-0 animate-none"
                                        stepCircleContainerClassName="border-none shadow-none"
                                        stepContainerClassName="pt-4 pb-0"
                                        contentClassName="px-6 py-2 min-h-[140px]"
                                        footerClassName="pb-4 px-6 pt-2"
                                        activeColor="#d97706"
                                        completeColor="#d97706"
                                        nextButtonClassName="flex items-center justify-center rounded-full bg-amber-500 py-1.5 px-4 font-medium tracking-tight text-white transition hover:bg-amber-600 active:bg-amber-700 text-sm shadow-sm"
                                    >
                                        <Step>
                                            <h3 className="font-bold text-gray-900 mb-1">1. Lag eller bli med i rom</h3>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                En spiller trykker <strong>&ldquo;Lag rom&rdquo;</strong> og blir host.
                                                De får en romkode de deler med de andre spillerne, som blir med ved å
                                                skrive koden i <strong>&ldquo;Bli med&rdquo;</strong>-feltet.
                                            </p>
                                        </Step>
                                        <Step>
                                            <h3 className="font-bold text-gray-900 mb-1">2. Sangsarkiv & regler</h3>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                Hosten (admin) velger sanger fra <strong>Sangsarkivet</strong> eller
                                                taster dem inn manuelt. Admin kan også konfigurere poeng, tidsfrist, og
                                                antall <strong>røde ord</strong>!
                                            </p>
                                        </Step>
                                        <Step>
                                            <h3 className="font-bold text-gray-900 mb-1">3. Avslør et ord</h3>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                Det aktive laget velger et tall på tavlen.
                                                Ordet snus og avsløres for alle spillere og publikum.
                                            </p>
                                        </Step>
                                        <Step>
                                            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-1">
                                                4. Gjett og syng!
                                            </h3>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                <strong>Svarte ord:</strong> Timeren starter! Dere må gjette sangen
                                                og <span className="text-amber-800 font-bold">synge strofen</span> for å
                                                score rundepoengene!<br/>
                                                <strong>Røde ord:</strong> Turen går direkte til det andre laget uten
                                                sjanse til å gjette.
                                            </p>
                                        </Step>
                                    </Stepper>
                                </div>
                                <Popover.Arrow className="fill-white"/>
                            </motion.div>
                        </Popover.Content>
                    </Popover.Portal>
                )}
            </AnimatePresence>
        </Popover.Root>
    );
}
