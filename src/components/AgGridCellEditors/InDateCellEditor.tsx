import { CustomCellEditorProps } from "ag-grid-react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

dayjs.extend(utc);
dayjs.extend(timezone);

export const InDateCellEditor = forwardRef(
  (props: CustomCellEditorProps & { format: string }, ref) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState<Dayjs | null>(() =>
      props.value ? dayjs(props.value) : null
    );

    const format = props.format || "DD/MM/YYYY hh:mm A";
    useImperativeHandle(ref, () => ({
      getValue() {
        return value ? value.tz(dayjs.tz.guess()).format() : null;
      },
      isPopup() {
        return true;
      },
      afterGuiAttached() {
        const input = wrapperRef.current?.querySelector("input");
        input?.focus();
      },
    }));

    const handleChange = (newValue: Dayjs | null) => {
      setValue(newValue);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          props.stopEditing();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [props]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        props.stopEditing();
      }
    };

    return (
      <div ref={wrapperRef} onKeyDown={handleKeyDown}>
        <DateTimePicker
          value={value}
          onChange={handleChange}
          ampm
          format={format}
          slotProps={{
            textField: {
              fullWidth: true,
              size: "small",
              autoFocus: true,
              sx: {
                "& .MuiPickersInputBase-root": {
                  height: "100%",
                  outline: "none",
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": { border: "none" },
                },
                "& .MuiOutlinedInput-root": {
                  height: "2.5rem",
                  border: 0,
                  width: "fit-content",
                },
                "& .MuiPickersSectionList-root": { width: "fit-content" },
                "& .MuiInputBase-input": {
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                },
                "& fieldset": { border: "none" },
              },
            },
          }}
        />
      </div>
    );
  }
);
