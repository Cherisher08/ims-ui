import { LuPlus } from "react-icons/lu";
import { Button } from "@mui/material";

const Dashboard = () => {
  return (
    <div className="bg-red-200 h-screen">
      <div className="bg-green-300 flex justify-between">
        <Button
          variant="contained"
          className="bg-primary"
          startIcon={<LuPlus color="white" />}
        >
          Add Product
        </Button>
      </div>
      <div></div>
    </div>
  );
};

export default Dashboard;
