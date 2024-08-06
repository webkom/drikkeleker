type Props = {
  className?: string;
};

const Footer = ({ className }: Props) => {
  return (
    <div className={`w-full ${className} py-1 text-black text-center mt-auto`}>
      <span>
        Laget med 🍺 av{" "}
        <a className="text-lego underline" href="https://github.com/webkom/">
          Webkom
        </a>
      </span>
    </div>
  );
};

export default Footer;
