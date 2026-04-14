import { Branch } from '../types/user';
import CustomSelect from '../styled/CustomSelect';

interface BranchSelectorProps {
  selectedBranch: string | null;
  onChange: (branch: string | null) => void;
}

const BranchSelector = ({ selectedBranch, onChange }: BranchSelectorProps) => {
  const branchOptions = [
    { id: 'all', value: 'All Branches' },
    { id: Branch.PADUR, value: 'PADUR' },
    { id: Branch.KELAMBAKKAM, value: 'KELAMBAKKAM' },
    { id: Branch.PUDUPAKKAM, value: 'PUDUPAKKAM' },
  ];

  return (
    <CustomSelect
      label="Branch"
      onChange={(val) => {
        onChange(val === 'all' ? null : val);
      }}
      options={branchOptions}
      value={selectedBranch || 'all'}
      className="w-[12rem]"
    />
  );
};

export default BranchSelector;
