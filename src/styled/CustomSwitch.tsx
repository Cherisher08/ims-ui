import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

const AntSwitch = styled(Switch)(() => ({
  width: 47,
  height: 26,
  padding: 0,
  display: "flex",
  "& .MuiSwitch-switchBase": {
    padding: 3,
    color: "#5e5e5e",
    "&.Mui-checked": {
      transform: "translateX(20px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#002f53",
        borderColor: "#002f53",
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 20,
    height: 20,
    boxShadow: "none",
  },
  "& .MuiSwitch-track": {
    border: "1px solid #5e5e5e",
    borderRadius: 32 / 2,
    backgroundColor: "#fff",
    opacity: 1,
  },
}));

export default AntSwitch;
