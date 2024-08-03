import Image from "next/image";
import styles from "@/components/beer/beer.module.css";

type Props = {
  className?: string;
};

const Footer = ({ className }: Props) => {
  return (
    <div className={`w-full flex items-center flex-col bg-lego ${className}`}>
      <div className={styles.foamWaveBottom} />
      <Image src="/images/footer.svg" alt="Footer" width={500} height={200} />
      <div className="w-full bg-lego-muted flex flex-col items-center justify-center p-6 space-y-2">
        <span className="text-white text-gray">Laget med 🍺 av Webkom</span>
        <span className="text-white">© Abakus 2024</span>
      </div>
    </div>
  );
};

export default Footer;
