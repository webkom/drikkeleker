import Lyrics from "@/components/lyrics";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import BeerContainer from "@/components/beer/beer-container";

const layAllYourLoveOnMe = [
  [
    <b>Alle</b>,
    "I wasn't jealous before we met. Now every woman I see is a potential threat",
    <b>Fadderbarn</b>,
    "And I'm possessive, it isnt nice. You've heard me saying that smoking was my only vice",
    <b>Faddere</b>,
    "But now it isn't true. Now everything is new",
    <b>Har kjæreste</b>,
    "And all I've learned has overturned I beg of you",
    <b>Har gått på en smell</b>,
    "Don't go wasting your emotion. Lay all your love on me",
    <b>Gutter</b>,
    "It was like shooting a sitting duck. A little small talk, a smile, and baby, I was stuck",
    <b>Jenter</b>,
    "I still don't know what you've done with me. A grown-up woman should never fall so easily",
    <b>Fra Bærum</b>,
    "I feel a kind of fear. When I don't have you near",
    <b>Fra vestlandet</b>,
    "Unsatisfied, I skip my pride. I beg you, dear",
    <b>Blir full av en øl</b>,
    "Don't go wasting your emotion. Lay all your love on me",
    <b>Har blitt kastet ut av et utested</b>,
    "Don't go sharing your devotion. Lay all your love on me",
    <b>Alle som snuser</b>,
    "I've had a few little love affairs. They didn't last very long and they've been pretty scarce",
    <b>Alle 03 og 02</b>,
    "I used to think that was sensible. It makes the truth even more incomprehensible",
    <b>Har tatt en powerpuke</b>,
    "'Cause everything is new. And everything is you",
    <b>Har et abacrush</b>,
    "And all I've learned has overturned. What can I do?",
    <b>Har tatovering</b>,
    "Don't go wasting your emotion. Lay all your love on me",
    <b>Har hatt friår</b>,
    "Don't go sharing your devotion. Lay all your love on me",
    <b>Har sendt nudes</b>,
    "Don't go wasting your emotion. Lay all your love on me",
    <b>Har blitt tatt på fersken av foreldrene sine</b>,
    "Don't go sharing your devotion. Lay all your love on me",
    <b>ALLE</b>,
    "Don't go wasting your emotion. Lay all your love on me",
  ],
];

const LayAllYourLoveOnMePage = () => {
  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/" />
      <BeerContainer color="blue" className="min-h-dvh">
        <Lyrics title="Lay All Your Love On Me" lyrics={layAllYourLoveOnMe} />
        <Footer />
      </BeerContainer>
    </main>
  );
};

export default LayAllYourLoveOnMePage;
