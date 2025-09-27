import { CircularProgress } from '@mui/material';

const Loader = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <CircularProgress />
    </div>
  );
};

export default Loader;
