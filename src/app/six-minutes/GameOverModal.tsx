import { Card, CardContent, CardHeader } from "@/components/ui/card";

const GameOverModal = () => {
  return (
    <div className="absolute w-screen z-10 h-screen backdrop-blur-sm animate-fade">
      <Card className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <CardHeader>
          <h2>🚨 Tiden har gått ut 🚨</h2>
        </CardHeader>
        <CardContent>Den gruppen som har tur nå må chugge 🍻</CardContent>
      </Card>
    </div>
  );
};

export default GameOverModal;
