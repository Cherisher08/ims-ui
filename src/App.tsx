import "./App.css";
import MenuProvider from "./contexts/MenuContext";
import AppRoutes from "./routers/index";

function App() {
  return (
    <div className="min-w-screen min-h-screen h-fit">
      <MenuProvider>
        <AppRoutes />
      </MenuProvider>
    </div>
  );
}

export default App;
