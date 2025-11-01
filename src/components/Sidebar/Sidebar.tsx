import { motion } from 'motion/react';
import { useEffect } from 'react';
import { LuChevronsLeft } from 'react-icons/lu';
import Logo from '../../assets/New_Logo.svg';
import { MenuItems } from '../../constants/MenuItems';
import { useMenu } from '../../contexts/MenuContext';
import { useLocation, useNavigate } from 'react-router-dom';

type SideBar = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const SideBar = ({ open, setOpen }: SideBar) => {
  // const [open, setOpen] = useState<boolean>(true);
  const navigate = useNavigate();
  const { active, setActive } = useMenu();
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    const matchingItems = MenuItems.filter((item) => pathname.includes(item.path));
    if (matchingItems.length > 0) {
      // Select the item with the longest path (most specific match)
      const activeMenuItem = matchingItems.sort((a, b) => b.path.length - a.path.length)[0];
      setActive(activeMenuItem.id);
    }
  }, [pathname, setActive]);

  return (
    <div
      className={`w-fit h-full z-50 absolute md:hidden md:relative ${
        open ? '' : '-translate-x-25 md:-translate-x-10'
      }`}
    >
      <motion.div
        initial={{ width: '17rem', padding: '1rem 1.5rem' }}
        animate={{
          width: open ? '15rem' : '5rem',
          padding: open ? '1rem 1rem' : '1rem .5rem ',
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className="relative h-full bg-primary rounded-r-3xl overflow-hidden"
      >
        <motion.div transition={{ duration: 0.3, delay: 0.2 }} className="flex flex-col gap-8">
          <div className={`relative flex items-center ${open ? '' : 'justify-center'}`}>
            <div
              className={
                ' rounded-full overflow-hidden min-w-12 h-12 aspect-square content-center bg-white'
              }
            >
              <img src={Logo} className="w-12 h-12" />
            </div>
            <p
              className={`text-2xl text-white text-center text-wrap absolute w-3/4 right-0 ease-in-out
    ${
      open
        ? 'opacity-100 visible transition-opacity duration-700'
        : 'opacity-0 invisible transition-none'
    }`}
            >
              Mani Power Tools
            </p>
          </div>

          <ul className="flex flex-col gap-2 px-2">
            {MenuItems.map((item) => {
              const Icon = item.logo;
              return (
                <li
                  key={item.path}
                  onClick={() => {
                    setOpen(false);
                    navigate(item.path);
                  }}
                  className={`relative cursor-pointer flex items-center gap-3 w-full pl-3 py-2 text-white hover:rounded-md rounded-r-md hover:menu-active hover:bg-[#006fc431] ${
                    item.id === active ? 'menu-active bg-[#006fc431]' : ''
                  }`}
                >
                  {Icon}
                  {open && <p className="text-lg font-semibold">{item.title}</p>}
                </li>
              );
            })}
          </ul>
        </motion.div>
      </motion.div>

      {/* Hamburger */}
      <div
        onClick={() => setOpen(!open)}
        className="absolute cursor-pointer top-1/2 right-0 flex justify-center items-center translate-x-5 rounded-r-xl -translate-y-1/2 bg-primary w-6 h-18"
      >
        <LuChevronsLeft
          size={23}
          color="white"
          className={`transition-transform duration-200 ${open ? 'rotate-0' : 'rotate-180'}`}
        />
      </div>
    </div>
  );
};

export default SideBar;
