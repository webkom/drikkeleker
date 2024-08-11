import Lyrics from "@/components/lyrics";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import BeerContainer from "@/components/beer/beer-container";

const lambo = [
  [
    <b key="Tilskuere 1">Tilskuere synger</b>,
    "Se der står en fyllehund, mine herrer lambo.",
    "Sett nu flasken for din munn, mine herrer lambo.",
    "Se hvordan den dråpen vanker ned ad halsen på den dranker",
    <>
      <b>:/:</b> Lambo, lambo, mine herrer lambo <b>:/:</b>{" "}
    </>,
    <i>(Synges til dranker har drukket opp)</i>,
  ],
  [
    <b key="Dranker">Dranker synger</b>,
    "Jeg mitt glass utdrukket har, mine herrer lambo.",
    "Se der fins ei dråpen kvar, mine herrer lambo.",
    "Som bevis der på jeg vender, flasken på dens rette ende.",
    <i>(Pause mens drankeren snur glass/flaske over hodet)</i>,
  ],
  [
    <b key="Tilskuere 2">Tilskuere synger</b>,
    "Lambo, lambo, mine herrer lambo",
    "Han/hun kunne kunsten han/hun var et jævla fyllesvin.",
    "Så går vi til nestemann og ser hva han/hun formår.",
    <i>(Alternativt&#58; Så går vi til baren og sjenker oss en tår.)</i>,
  ],
];

const LamboPage = () => {
  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
      <BeerContainer color="red" className="min-h-dvh">
        <Lyrics title="Lambo" lyrics={lambo} />
        <Footer />
      </BeerContainer>
    </main>
  );
};

export default LamboPage;
