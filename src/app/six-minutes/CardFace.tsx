import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ReactNode } from "react";

type CardFaceProps = {
  songNumber: number;
  children: ReactNode[] | ReactNode;
  onFlip?: () => void;
};

const CardFace = ({ songNumber, children, onFlip }: CardFaceProps) => {
  return (
    <Card className="bg-orange-100 border-orange-800/30">
      <CardHeader className="flex justify-between flex-row space-y-0">
        <span className="text-xl">{songNumber}</span>
        <Button
          className="bg-orange-500 hover:bg-orange-500/90 w-fit"
          onClick={onFlip}
        >
          <RefreshCw className="mr-2" /> Flipp kort
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col w-full h-96">
        {children}
      </CardContent>
    </Card>
  );
};

export default CardFace;
