import { createContext, useContext, useState } from "react";

type MenuContextType = {
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
};

type MenuProviderProps = {
  children: React.ReactNode;
};

export const MenuContext = createContext<MenuContextType | undefined>(
  undefined
);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};

const MenuProvider = ({ children }: MenuProviderProps) => {
  const [active, setActive] = useState<number>(1);

  return (
    <MenuContext.Provider value={{ active, setActive }}>
      {children}
    </MenuContext.Provider>
  );
};

export default MenuProvider;
