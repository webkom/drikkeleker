import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface NavButtonProps {
  label: string;
  href: string;
  color?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const NavButton = ({ label, href, color, icon, children }: NavButtonProps) => {
  const colorVariants: { [id: string]: string } = {
    blue: "bg-blue-500 hover:bg-blue-500/90",
    red: "bg-red-500 hover:bg-red-500/90",
    green: "bg-green-500 hover:bg-green-500/90",
    fuchsia: "bg-fuchsia-500 hover:bg-fuchsia-500/90",
    teal: "bg-teal-500 hover:bg-teal-500/90",
    orange: "bg-orange-500 hover:bg-orange-500/90",
  };

  return (
    <Link href={href} passHref>
      <Button className={`w-full group ${colorVariants[color!]}`} size="lg">
        <div className="flex gap-1 items-center">
          {icon && icon}
          {label}
        </div>
        {children}
        <ArrowRight
          size={20}
          className="ml-auto transition-transform group-hover:translate-x-2"
        />
      </Button>
    </Link>
  );
};

export default NavButton;
