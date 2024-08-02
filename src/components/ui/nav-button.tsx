import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface NavButtonProps {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const NavButton = ({ label, href, icon, children }: NavButtonProps) => {
  return (
    <Link href={href} passHref>
      <Button className="w-full group" size="lg">
        {icon && icon}
        {label}
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
