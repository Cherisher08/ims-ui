type CardProps = {
  title: string;
  value: string;
  change?: number | null;
  className?: string;
  showSwitch?: boolean;
  switchLabels?: string[];
  onToggleSwitch?: (checked: boolean) => void;
  switchMode?: boolean;
};

const CustomCard = ({ title, value, className }: CardProps) => {
  return (
    <div
      className={`rounded-3xl p-5 flex flex-col justify-between bg-[#eceefb] min-w-48 min-h-26 max-w-60 ${className}`}
    >
      <p>{title}</p>

      <div className="grid grid-cols-2 items-center">
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default CustomCard;
