"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  className?: string;
  href: string;
}

const BackButton = ({ className, href }: BackButtonProps) => {
  return (
    <Button asChild variant="link" className={`${className} group`}>
      <Link href={href}>
        <ArrowLeft
          size={20}
          className="transition-transform group-hover:-translate-x-1"
        />
        <span className="text-lg ml-1">Tilbake</span>
      </Link>
    </Button>
  );
};

export default BackButton;
