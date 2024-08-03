import Lyrics from "@/components/lyrics";
import BackButton from "@/components/back-button";

const lambo = [
  [
    "Se der står en fyllehund, mine herrer lambo.",
    "Sett nu flasken for din munn, mine herrer lambo.",
    "Se hvordan den dråpen vanker ned ad halsen på den dranker",
    "Lambo, lambo, mine herrer lambo",
  ],
  [
    "Jeg mitt glass utdrukket har, mine herrer lambo.",
    "Se der fins ei dråpen kvar, mine herrer lambo.",
    "Som bevis der på jeg vender, flasken på dens rette ende.",
  ],
  [
    "Lambo, lambo, mine herrer lambo",
    "Hun/han kunne kunsten hun/han var et jævla fyllesvin.",
    "Så går vi til nestemann og ser hva hun/han formår.",
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
