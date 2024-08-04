import Lyrics from "@/components/lyrics";
import BackButton from "@/components/back-button";

const lambo = [
  [
    "Tilskuere synger:",
    "Se der står en fyllehund, mine herrer lambo.",
    "Sett nu flasken for din munn, mine herrer lambo.",
    "Se hvordan den dråpen vanker ned ad halsen på den dranker",
    ":/: Lambo, lambo, mine herrer lambo :/: (Synges til dranker har drukket opp)",
  ],
  [
    "Dranker synger:",
    "Jeg mitt glass utdrukket har, mine herrer lambo.",
    "Se der fins ei dråpen kvar, mine herrer lambo.",
    "Som bevis der på jeg vender, flasken på dens rette ende.",
    "(Pause mens drankeren snur glass/flaske over hodet)",
  ],
  [
    "Tilskuere synger:",
    "Lambo, lambo, mine herrer lambo",
    "Han/hun kunne kunsten han/hun var et jævla fyllesvin.",
    "Så går vi til nestemann og ser hva han/hun formår.",
    "(Alternativ: Så går vi til baren og sjenker oss en tår.)",
  ],
];

const LamboPage = () => {
  return (
    <>
      <BackButton className="absolute top-4 left-4" href="/" />
      <Lyrics title="Lambo" lyrics={lambo} />
    </>
  );
};

export default LamboPage;
