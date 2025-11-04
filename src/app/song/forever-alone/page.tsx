import Lyrics from "@/components/shared/lyrics";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import BeerContainer from "@/components/beer/beer-container";

const foreverAlone = [
  [
    <b key="Faddere">Faddere</b>,
    "No one can say I didn't try",
    <b key="Alle">Alle</b>,
    "Tried everything to make you feel what I feel",
    <b key="Går Datateknologi">Går Datateknologi</b>,
    "Well, I guess I pushed to hard",
    <b key="Går Cyber">Går Cyber</b>,
    "And now you're slipping away",
    <b key="Har hatt kjæreste">Har hatt kjæreste</b>,
    "Feels like my love for you",
    <b key="Jukset på en prøve">Jukset på en prøve</b>,
    "Is stopping you from being you",
    <b key="De som har hatt friår">De som har hatt friår</b>,
    "You shine best without me",
    <b key="Fadderbarn">Fadderbarn</b>,
    "Like all the ones I had before",
    <b key="ALLE!">ALLE!</b>,
    "I am forever alone",
    <b key="Har vært i milla">Har vært i milla</b>,
    "Home alone eating sushi for two",
    <b key="Har grått i 2025">Har grått i 2025</b>,
    "Home alone and I'm waiting for someone who never shows up",
    <b key="Er hyped for i dag">Er hyped for i dag</b>,
    "Ooh, and I'm lonely, I'm angry I'm tired",
    <b key="Spydd på fest">Spydd på fest</b>,
    "You're only giving med drips of your love",
    <b key="Har blitt blokket på snap av noen før">
      Har blitt blokket på snap av noen før
    </b>,
    "Appointments, you've been breaking them all",
    <b key="Har blokket noen før">Har blokket noen før</b>,
    "It's like a never ending story",
    <b key="Har hatt blackout">Har hatt blackout</b>,
    "I give, and you take, and I give, and you take",
    <b key="Har på seg undertøy">Har på seg undertøy</b>,
    "Feels like my love for you",
    <b key="Alle">Alle</b>,
    "Is stopping you from being you",
    <b key="Gått på folkehøyskole">Gått på folkehøyskole</b>,
    "You shine best without me",
    <b key="Alle">Alle</b>,
    "Like all the ones I had before",
    <b key="Er singel">Er singel</b>,
    "I am forever alone",
    <b key="Fått 2 på en prøve">Fått 2 på en prøve</b>,
    "When I held your hand you were sincere",
    <b key="Ditchet skolen">Ditchet skolen</b>,
    "But did you ever think about me when I wasn't near you",
    <b key="Drikker noe annet enn øl">Drikker noe annet enn øl</b>,
    "Why would you ever put me first?",
    <b key="Har vært på tinderdate">Har vært på tinderdate</b>,
    "You are second to none",
    <b key="Har onanert">Har onanert</b>,
    "I wanted to leave, I tried to find someone new",
    <b key="Studerer">Studerer</b>,
    "But I always end up still wanting you",
    <b key="Tror de blir fulle i kveld">Tror de blir fulle i kveld</b>,
    "Why do I do this to myself?",
    <b key="Hoppet i fallskjerm">Hoppet i fallskjerm</b>,
    "Feels like my love for you",
    <b key="Har farget håret før">Har farget håret før</b>,
    "Is stopping you from being you",
    <b key="Blitt tatt med fake leg">Blitt tatt med fake leg</b>,
    "You shine best without me",
    <b key="Har et crush">Har et crush</b>,
    "Like all the ones I had before",
    <b key="Blir fort forelsket">Blir fort forelsket</b>,
    "I am forever alone",
    <b key="Alle">Alle</b>,
    "When I'm with you, you tell me you love me",
    <b key="Skulle tatt en tur til specsavers">
      Skulle tatt en tur til specsavers
    </b>,
    "When you're not I don't even exist",
    <b key="Hadde solgt bilde av føttene for 100 kr">
      Hadde solgt bilde av føttene for 100 kr
    </b>,
    "If I ask you if you want to hang with me",
    <b key="Har dusjet med en annen">Har dusjet med en annen</b>,
    "You got a thousand excuses rehearsed",
    <b key="Alle med blondt hår">Alle med blondt hår</b>,
    "But when you're drunk and got no place to hide",
    <b key="Alle som er single">Alle som er single</b>,
    "Who's the one you always call?",
    <b key="Alle som skal bli fulle i dag">Alle som skal bli fulle i dag</b>,
    "Feels like my love for you",
    <b key="Hadde gått på date med en sugerdaddy for 10 000 kr">
      Hadde gått på date med en sugerdaddy for 10 000 kr
    </b>,
    "Is stopping you from being you",
    <b key="Fadderbarn">Fadderbarn</b>,
    "You shine best without me",
    <b key="Alle">Alle</b>,
    "Like all the ones I had before",
    <b key="Kommet hjem i 06 tiden">Kommet hjem i 06 tiden</b>,
    "I am forever alone",
    <b key="Har flyttet ut">Har flyttet ut</b>,
    "My love for you",
    <b key="Drikker sprit i dag">Drikker sprit i dag</b>,
    "Is stopping you from being you",
    <b key="Har vært på utested">Har vært på utested</b>,
    "You shine best without me",
    <b key="Fadderbarn">Fadderbarn</b>,
    "Like all the ones I had before",
    <b key="ALLE">ALLE</b>,
    "I am forever alone",
  ],
];

const ForeverAlonePage = () => {
  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
      <BeerContainer color="green" className="min-h-dvh">
        <Lyrics title="Forever Alone" lyrics={foreverAlone} />
        <Footer />
      </BeerContainer>
    </main>
  );
};

export default ForeverAlonePage;
