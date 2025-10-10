import Lyrics from "@/components/lyrics";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import BeerContainer from "@/components/beer/beer-container";

const layAllYourLoveOnMe = [
  [
    <b key="Fadderbarn">Fadderbarn</b>,
    "I wasn't jealous before we met. Now every woman I see is a potential threat",
    <b key="Faddere">Faddere</b>,
    "And I'm possessive, it isnt nice. You've heard me saying that smoking was my only vice",
    <b key="Alle">Alle</b>,
    "But now it isn't true. Now everything is new",
    <b key="Blir full av en øl">Blir full av en øl</b>,
    "And all I've learned has overturned I beg of you",
    <b key="Har gått på en smell">Har gått på en smell</b>,
    "Don't go wasting your emotion. Lay all your love on me",
    <b key="Har brunt hår">Har brunt hår</b>,
    "It was like shooting a sitting duck. A little small talk, a smile, and baby, I was stuck",
    <b key="Er blond">Er blond</b>,
    "I still don't know what you've done with me. A grown-up woman should never fall so easily",
    <b key="Fra Bærum">Fra Bærum</b>,
    "I feel a kind of fear. When I don't have you near",
    <b key="Fra vestlandet">Fra vestlandet</b>,
    "Unsatisfied, I skip my pride. I beg you, dear",
    <b key="Er singel">Er singel</b>,
    "Don't go wasting your emotion. Lay all your love on me",
    <b key="Har blitt kastet ut av et utested">
      Har blitt kastet ut av et utested
    </b>,
    "Don't go sharing your devotion. Lay all your love on me",
    <b key="Alle som snuser">Alle som snuser</b>,
    "I've had a few little love affairs. They didn't last very long and they've been pretty scarce",
    <b key="Alle 05 og 04">Alle 05 og 04</b>,
    "I used to think that was sensible. It makes the truth even more incomprehensible",
    <b key="Har tatt en powerpuke">Har tatt en powerpuke</b>,
    "'Cause everything is new. And everything is you",
    <b key="Har et abacrush">Har et abacrush</b>,
    "And all I've learned has overturned. What can I do?",
    <b key="Har tatovering">Har tatovering</b>,
    "Don't go wasting your emotion. Lay all your love on me",
    <b key="Har hatt friår">Har hatt friår</b>,
    "Don't go sharing your devotion. Lay all your love on me",
    <b key="Fra Trøndelag">Fra Trøndelag</b>,
    "Don't go wasting your emotion. Lay all your love on me",
    <b key="Har blitt tatt på fersken av foreldrene sine">
      Har blitt tatt på fersken av foreldrene sine
    </b>,
    "Don't go sharing your devotion. Lay all your love on me",
    <b key="ALLE">ALLE</b>,
    "Don't go wasting your emotion. Lay all your love on me",
  ],
];

const LayAllYourLoveOnMePage = () => {
  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
      <BeerContainer color="blue" className="min-h-dvh">
        <Lyrics title="Lay All Your Love On Me" lyrics={layAllYourLoveOnMe} />
        <Footer />
      </BeerContainer>
    </main>
  );
};

export default LayAllYourLoveOnMePage;
