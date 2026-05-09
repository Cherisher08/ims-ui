import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { CustomOptionProps } from '../../../../styled/CustomAutoComplete';

interface DisplaySettingsDialogProps {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;

  initialViewChallans: boolean;
  initialShowOnlyUnpaidOrders: boolean;
  initialViewSelectiveOrders: boolean;
  initialSelectedMonth: number;
  initialSelectedYear: number;
  initialShowAllBranches: boolean;

  onSave: (settings: {
    viewChallans: boolean;
    showOnlyUnpaidOrders: boolean;
    viewSelectiveOrders: boolean;
    selectedMonth: number;
    selectedYear: number;
    showAllBranches: boolean;
  }) => void;

  monthOptions: CustomOptionProps[];
  yearOptions: CustomOptionProps[];
}

const DisplaySettingsDialog: React.FC<DisplaySettingsDialogProps> = ({
  open,
  onClose,
  isAdmin,
  initialViewChallans,
  initialShowOnlyUnpaidOrders,
  initialViewSelectiveOrders,
  initialSelectedMonth,
  initialSelectedYear,
  initialShowAllBranches,
  onSave,
  monthOptions,
  yearOptions,
}) => {
  const [pendingViewChallans, setPendingViewChallans] = useState(initialViewChallans);
  const [pendingShowOnlyUnpaidOrders, setPendingShowOnlyUnpaidOrders] = useState(initialShowOnlyUnpaidOrders);
  const [pendingViewSelectiveOrders, setPendingViewSelectiveOrders] = useState(initialViewSelectiveOrders);
  const [pendingSelectedMonth, setPendingSelectedMonth] = useState(initialSelectedMonth);
  const [pendingSelectedYear, setPendingSelectedYear] = useState(initialSelectedYear);
  const [pendingShowAllBranches, setPendingShowAllBranches] = useState(initialShowAllBranches);

  // Sync state when dialog opens
  useEffect(() => {
    if (open) {
      setPendingViewChallans(initialViewChallans);
      setPendingShowOnlyUnpaidOrders(initialShowOnlyUnpaidOrders);
      setPendingViewSelectiveOrders(initialViewSelectiveOrders);
      setPendingSelectedMonth(initialSelectedMonth);
      setPendingSelectedYear(initialSelectedYear);
      setPendingShowAllBranches(initialShowAllBranches);
    }
  }, [
    open,
    initialViewChallans,
    initialShowOnlyUnpaidOrders,
    initialViewSelectiveOrders,
    initialSelectedMonth,
    initialSelectedYear,
    initialShowAllBranches,
  ]);

  const handleSave = () => {
    sessionStorage.setItem('orders_viewChallans', JSON.stringify(pendingViewChallans));
    sessionStorage.setItem('orders_showOnlyUnpaidOrders', JSON.stringify(pendingShowOnlyUnpaidOrders));
    sessionStorage.setItem('orders_viewSelectiveOrders', JSON.stringify(pendingViewSelectiveOrders));
    sessionStorage.setItem('orders_selectedMonth', JSON.stringify(pendingSelectedMonth));
    sessionStorage.setItem('orders_selectedYear', JSON.stringify(pendingSelectedYear));
    sessionStorage.setItem('orders_showAllBranches', JSON.stringify(pendingShowAllBranches));

    onSave({
      viewChallans: pendingViewChallans,
      showOnlyUnpaidOrders: pendingShowOnlyUnpaidOrders,
      viewSelectiveOrders: pendingViewSelectiveOrders,
      selectedMonth: pendingSelectedMonth,
      selectedYear: pendingSelectedYear,
      showAllBranches: pendingShowAllBranches,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Display Settings</DialogTitle>
      <DialogContent className="space-y-6">
        {/* Whatsapp Notifications Checkbox */}
        <div className="flex items-center gap-2 pt-4">
          <input
            type="checkbox"
            id="viewWhatsappNotifications"
            checked={pendingViewChallans}
            onChange={(e) => setPendingViewChallans(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="viewWhatsappNotifications" className="cursor-pointer">
            View Whatsapp Notifications
          </label>
        </div>

        {/* Show Only Unpaid Orders Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showOnlyUnpaidOrders"
            checked={pendingShowOnlyUnpaidOrders}
            onChange={(e) => setPendingShowOnlyUnpaidOrders(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="showOnlyUnpaidOrders" className="cursor-pointer">
            Show Only Unpaid Orders
          </label>
        </div>

        {/* Filter by Date Range Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="filterByDateRange"
            checked={pendingViewSelectiveOrders}
            onChange={(e) => {
              setPendingViewSelectiveOrders(e.target.checked);
              // If unchecking and "Show Only Unpaid Orders" is also unchecked, force it to be checked
              if (!e.target.checked && !pendingShowOnlyUnpaidOrders) {
                setPendingViewSelectiveOrders(true);
              }
            }}
            disabled={!pendingShowOnlyUnpaidOrders}
            className="w-4 h-4 cursor-pointer"
          />
          <label
            htmlFor="filterByDateRange"
            className={`cursor-pointer ${!pendingShowOnlyUnpaidOrders ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Filter by Date Range
          </label>
        </div>

        {/* Month/Year Filter Controls */}
        <div
          className={`flex items-center gap-2 ${pendingViewSelectiveOrders ? '' : 'opacity-50 cursor-not-allowed'}`}
        >
          <label className="whitespace-nowrap">Month & Year:</label>
          <select
            value={pendingSelectedMonth.toString()}
            onChange={(e) => setPendingSelectedMonth(parseInt(e.target.value))}
            disabled={!pendingViewSelectiveOrders}
            className={`px-3 py-2 border rounded bg-white cursor-pointer ${!pendingViewSelectiveOrders ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.description}
              </option>
            ))}
          </select>
          <select
            value={pendingSelectedYear.toString()}
            onChange={(e) => setPendingSelectedYear(parseInt(e.target.value))}
            disabled={!pendingViewSelectiveOrders}
            className={`px-3 py-2 border rounded bg-white cursor-pointer ${!pendingViewSelectiveOrders ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {yearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.description}
              </option>
            ))}
          </select>
        </div>

        {/* View All Branches Checkbox (Admin Only) */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="viewAllBranches"
              checked={pendingShowAllBranches}
              onChange={(e) => setPendingShowAllBranches(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="viewAllBranches" className="cursor-pointer">
              View All Branches
            </label>
          </div>
        )}

        {/* Info Alert */}
        <Alert severity="info" className="mt-4">
          Filter by Date Range is mandatory when "Show Only Unpaid Orders" is unchecked. You can
          only disable the date range filter when viewing unpaid orders.
        </Alert>
      </DialogContent>
      <DialogActions className="gap-2 p-4">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded bg-white cursor-pointer hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
        >
          Save
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default DisplaySettingsDialog;
