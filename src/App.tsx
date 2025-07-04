import { Provider } from "react-redux";

import "./App.css";
import MenuProvider from "./contexts/MenuContext";
import AppRoutes from "./routers/index";
import { store } from "./store/store";

function App() {
  return (
    <div className="w-screen overflow-hidden min-h-screen overflow-y-hidden h-fit">
      <Provider store={store}>
        <MenuProvider>
          <AppRoutes />
        </MenuProvider>
      </Provider>
    </div>
  );
}

export default App;
