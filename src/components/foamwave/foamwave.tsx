import styles from "./foamwave.module.css";

type Props = {
  className?: string;
};

const FoamWave = ({ className }: Props) => {
  return (
    <div className={`relative ${className}`}>
      <div className={styles.foamWave} />
      <div className={styles.foamWave} />
    </div>
  );
};

export default FoamWave;
