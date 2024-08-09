type ProgressBarProps = {
  value: number;
  maxValue: number;
}

const ProgressBar = ({value, maxValue}: ProgressBarProps) => {
  return (
    <div className="w-full text-center" >
      <div className="w-full h-6 rounded-full bg-gray-200">
      	<div className="h-6 rounded-full bg-orange-500" style={{ width: `${100*(1-value/maxValue)}%`}}></div>
      </div>
      <span>00:{Math.ceil(maxValue-value).toString().padStart(2, '0')}</span>
    </div>
  );
}

export default ProgressBar;
