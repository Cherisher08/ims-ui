import { useNavigate } from 'react-router-dom';
import CustomButton from '../../styled/CustomButton';

type ErrorPageProps = {
  message?: string;
  retry?: () => void;
};

const ErrorPage: React.FC<ErrorPageProps> = ({ message = 'Something went wrong.', retry }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex gap-2">
        {retry && (
          <CustomButton label={'Try Again'} onClick={retry} className="bg-red-600 text-white" />
        )}
        <CustomButton
          onClick={() => navigate('/')}
          className="bg-gray-600 text-white"
          label="Go to Entries page"
        />
      </div>
    </div>
  );
};

export default ErrorPage;
