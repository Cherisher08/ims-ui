type CardProps = {
  title: string;
  value: string;
  change?: number | null;
  className?: string;
  showSwitch?: boolean;
  switchLabels?: string[];
  onToggleSwitch?: (checked: boolean) => void;
  switchMode?: boolean;
  dropdownOptions?: { value: string; label: string }[];
  selectedDropdownValue?: string;
  onDropdownChange?: (value: string) => void;
};

const CustomCard = ({
  title,
  value,
  className,
  dropdownOptions,
  selectedDropdownValue,
  onDropdownChange,
}: CardProps) => {
  return (
    <div
      className={`rounded-3xl p-5 flex flex-col justify-between bg-[#eceefb] min-w-48 min-h-26 max-w-60 ${className}`}
    >
      {dropdownOptions && onDropdownChange ? (
        <div className="flex justify-between items-center">
          <p>{title}</p>
          <select
            value={selectedDropdownValue || ''}
            onChange={(e) => onDropdownChange(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
          >
            {dropdownOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p>{title}</p>
      )}

      <div className="grid grid-cols-2 items-center">
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default CustomCard;
