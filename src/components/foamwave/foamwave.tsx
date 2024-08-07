import styles from "./foamwave.module.css";

type Props = {
  className?: string;
};

const FoamWave = ({ className }: Props) => {
  return <div className={`${styles.foamWave} ${className}`} />;
};

export default FoamWave;
