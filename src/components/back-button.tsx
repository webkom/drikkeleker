import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  className?: string;
  href: string;
}

const BackButton = ({ className, href }: BackButtonProps) => {
  return (
    <Link href={href} passHref>
      <Button variant="link" className={`${className} group`}>
        <ArrowLeft
          size={32}
          className="transition-transform group-hover:-translate-x-1"
        />
        <span className="text-lg ml-1">Tilbake</span>
      </Button>
    </Link>
  );
};

export default BackButton;
