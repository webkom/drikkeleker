import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Color, getColorClasses } from "@/lib/colors";

interface NavButtonProps {
  label: string;
  href: string;
  color?: Color;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const NavButton = ({
  label,
  href,
  color,
  icon,
  children,
  className,
}: NavButtonProps) => {
  const colorClass = getColorClasses(color);

  return (
    <Link href={href} passHref>
      <Button className={`w-full group ${colorClass} ${className}`} size="lg">
        <div className="flex gap-4 items-center">
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
