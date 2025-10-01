import styles from "./bubble.module.css";

const digitPatterns: Record<string, number[][]> = {
  "0": [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  "1": [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  "2": [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
  ],
  "3": [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  "4": [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  "5": [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  "6": [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  "7": [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  "8": [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  "9": [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
};

interface BubbleDigitProps {
  digit: string;
  isAnimating: boolean;
  isOld: boolean;
}

const BubbleDigit: React.FC<BubbleDigitProps> = ({
  digit,
  isAnimating,
  isOld,
}) => {
  const pattern = digitPatterns[digit] || digitPatterns["0"];
  const seed = digit.charCodeAt(0);

  return (
    <div
      className="relative"
      style={{
        width: "90px",
        height: "150px",
      }}
    >
      {pattern.map((row, rowIndex) =>
        row.map((shouldShow, colIndex) => {
          if (!shouldShow) return null;

          const bubbleVariation =
            ((seed + rowIndex * 3 + colIndex * 7) % 10) / 10;
          const size = 20 + bubbleVariation * 10;
          const offset = (bubbleVariation - 0.5) * 4;
          const floatIndex = (rowIndex + colIndex) % 4;
          const floatClass = styles[`float-${floatIndex}`];

          const bubbleClasses = [
            styles["digit-bubble"],
            floatClass,
            isAnimating && (isOld ? styles["pop-out"] : styles["pop-in"]),
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={bubbleClasses}
              style={{
                left: `${colIndex * 30 + offset}px`,
                top: `${rowIndex * 30 + offset}px`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            />
          );
        }),
      )}
    </div>
  );
};

export default BubbleDigit;
