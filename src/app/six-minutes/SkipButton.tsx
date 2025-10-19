import { LucideIcon, SkipBack, SkipForward } from "lucide-react";

interface SkipButtonProps {
  onClick: () => void;
  disabled?: boolean;
  Icon: LucideIcon;
}

const SkipButton = ({ Icon, onClick, disabled = false }: SkipButtonProps) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <button
      className="p-2 rounded-full active:scale-90 transition-transform drop-shadow-md disabled:cursor-not-allowed"
      onClick={handleClick}
    >
      <Icon fill="rgb(255, 255, 255)" className="text-white" size={64} />
    </button>
  );
};

const SkipForwardButton = (props: Omit<SkipButtonProps, "Icon">) =>
  SkipButton({
    ...props,
    Icon: SkipForward,
  });
const SkipBackButton = (props: Omit<SkipButtonProps, "Icon">) =>
  SkipButton({
    ...props,
    Icon: SkipBack,
  });

SkipButton.Forward = SkipForwardButton;
SkipButton.Back = SkipBackButton;

export default SkipButton;
