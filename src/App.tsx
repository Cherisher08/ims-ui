import { Provider } from "react-redux";

import "./App.css";
import MenuProvider from "./contexts/MenuContext";
import AppRoutes from "./routers/index";
import { store } from "./store/store";

function App() {
  return (
    <div className="min-w-screen min-h-screen h-fit">
      <Provider store={store}>
        <MenuProvider>
          <AppRoutes />
        </MenuProvider>
      </Provider>
    </div>
  );
}

export default App;
