type ProgressBarProps = {
  value: number;
  maxValue: number;
};

const ProgressBar = ({ value, maxValue }: ProgressBarProps) => {
  return (
    <div className="w-full text-center flex flex-col gap-1">
      <span className="text-xl font-normal text-gray-500">
        00:
        {Math.ceil(maxValue - value)
          .toString()
          .padStart(2, "0")}
      </span>
      <div className="w-full h-6 rounded-md bg-orange-50 overflow-clip">
        <div
          className="h-6 rounded-md bg-orange-200 transition-all"
          style={{ width: `${100 * (1 - value / maxValue)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
