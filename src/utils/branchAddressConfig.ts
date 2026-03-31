import { Branch } from '../types/user';

export interface BranchAddress {
  line1: string;
  line2: string;
}

/**
 * Maps branch to their respective company addresses
 * Line 1: Street address
 * Line 2: City, State and Postal Code
 */
const branchAddresses: Record<Branch, BranchAddress> = {
  [Branch.PADUR]: {
    line1: 'No. 1/290, Angalamman Koil Street, Padur,',
    line2: 'Chengalpattu, Chennai - 603103, Tamil Nadu',
  },
  [Branch.KELAMBAKKAM]: {
    line1: 'No. 1/290, Angalamman Koil Street, Padur,',
    line2: 'Chengalpattu, Chennai - 603103, Tamil Nadu',
  },
  [Branch.PUDUPAKKAM]: {
    line1: 'M.R. Radha Street Echangadu,',
    line2: 'Pudupakkam - 603 103',
  },
};

/**
 * Gets the address lines for a specific branch
 * @param branch - The branch to get the address for
 * @returns Address object with line1 and line2
 */
export const getAddressByBranch = (branch: Branch): BranchAddress => {
  return branchAddresses[branch] || branchAddresses[Branch.PADUR];
};
