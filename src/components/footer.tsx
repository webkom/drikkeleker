import Image from "next/image";

const Footer = () => {
  return (
    <div className="w-full flex items-center flex-col">
      <Image src="/images/footer.svg" alt="Footer" width={500} height={200} />
      <div className="w-full bg-lego-muted flex flex-col items-center justify-center p-6 space-y-2">
        <span className="text-white">Laget med 🍺 av Webkom</span>
        <span className="text-white">© Abakus 2024</span>
      </div>
    </div>
  );
};

export default Footer;
