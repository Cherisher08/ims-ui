import { FC, useRef, useState } from 'react';
import CustomMenu from '../../../styled/CustomMenu';
import { IoMdMore } from 'react-icons/io';
import CustomButton from '../../../styled/CustomButton';
import ClearIcon from '@mui/icons-material/Clear';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { RentalOrderInfo } from '../../../types/order';

interface EntryMenuProps {
  rentalOrder: RentalOrderInfo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleValueChange: (field: string, value: any) => void;
}

const EntryMenu: FC<EntryMenuProps> = ({ rentalOrder, handleValueChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const isMenuItemsDisabled = rentalOrder._id ? false : true;

  const handleMenu = (value: boolean) => {
    setMenuOpen(value);
  };

  const handleCancelEntry = () => {
    handleValueChange('status', 'cancelled');
    handleMenu(false);
  };

  const handleNoEntry = () => {
    // Implement cancel entry logic here
    console.log('Entry set as no bill');
    handleValueChange?.('status', 'no bill');
    handleMenu(false);
  };

  const entryMenuItems = [
    <CustomButton
      label={'Cancel'}
      onClick={() => {
        handleCancelEntry();
      }}
      icon={<ClearIcon />}
      disabled={isMenuItemsDisabled}
    />,
    <CustomButton
      label={'No Bill'}
      onClick={() => {
        handleNoEntry();
      }}
      icon={<DoNotDisturbIcon />}
      disabled={isMenuItemsDisabled}
    />,
  ];

  return (
    <>
      <div ref={ref} onClick={() => handleMenu(true)} className="flex items-center">
        <IoMdMore size={28} className="text-black cursor-pointer" />
      </div>
      <CustomMenu
        open={menuOpen}
        anchorEl={ref.current}
        handleClose={() => handleMenu(false)}
        menuItems={entryMenuItems.map((button, index) => ({
          label: button.props.label,
          icon: button.props.icon,
          handleItem: button.props.onClick,
          key: `entry-menu-item-${index}`,
          disabled: button.props.disabled,
        }))}
        transformPosition={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
    </>
  );
};

export default EntryMenu;
