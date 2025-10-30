import { Provider } from 'react-redux';
import './App.css';
import MenuProvider from './contexts/MenuContext';
import AppRoutes from './routers/index';
import { store } from './store/store';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('*')) {
      return;
    }
    originalError(...args);
  };

  return (
    <div className="w-screen overflow-hidden min-h-screen overflow-y-hidden h-fit">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Provider store={store}>
          <MenuProvider>
            <AppRoutes />
          </MenuProvider>
        </Provider>
      </LocalizationProvider>
    </div>
  );
}

export default App;
