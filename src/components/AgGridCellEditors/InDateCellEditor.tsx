import { CustomCellEditorProps } from "ag-grid-react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useState, useEffect, useRef } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

export const InDateCellEditor = (props: CustomCellEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>(() => {
    if (!props.value) return "";
    return dayjs(props.value).format("YYYY-MM-DDTHH:mm");
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBlur = () => {
    props.stopEditing();
  };

  const handleValueChange = (updatedValue: string) => {
    console.log("updatedValue: ", updatedValue);
    setValue(updatedValue);
    props.onValueChange(dayjs(updatedValue).tz(dayjs.tz.guess()).format());
  };

  return (
    <input
      ref={inputRef}
      type="datetime-local"
      value={value}
      onChange={(e) => handleValueChange(e.target.value)}
      onBlur={handleBlur}
      className="ag-input-field-input ag-text-field-input"
    />
  );
};
