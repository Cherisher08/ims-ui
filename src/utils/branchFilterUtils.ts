import { Branch } from '../types/user';

/**
 * Generates a branch filter parameter for API queries.
 *
 * @param userBranch - The user's assigned branch
 * @param showAllBranches - Whether to show all branches (admin only)
 * @returns Filter string in format "branch:BRANCH-CODE" or null if no filter needed
 *
 * @example
 * // For regular user - always filtered to their branch
 * getBranchFilterParam(Branch.PADUR, false) // returns "branch:PADUR-1"
 *
 * // For admin user showing all branches
 * getBranchFilterParam(Branch.PADUR, true) // returns null (no filter)
 *
 * // For admin user showing only their branch
 * getBranchFilterParam(Branch.PADUR, false) // returns "branch:PADUR-1"
 */
export const getBranchFilterParam = (
  userBranch: Branch,
  showAllBranches: boolean
): string | null => {
  // If admin wants to see all branches, don't apply any filter
  if (showAllBranches) {
    return null;
  }

  // Otherwise, filter to user's branch only
  return `branch:${userBranch}`;
};

/**
 * Adds a branch filter to an existing filter array if needed.
 *
 * @param filterArray - Existing filter array
 * @param userBranch - The user's assigned branch
 * @param showAllBranches - Whether to show all branches (admin only)
 * @returns Updated filter array with branch filter added if applicable
 */
export const addBranchFilterToArray = (
  filterArray: string[],
  userBranch: Branch,
  showAllBranches: boolean
): string[] => {
  const branchFilter = getBranchFilterParam(userBranch, showAllBranches);

  if (branchFilter) {
    return [...filterArray, branchFilter];
  }

  return filterArray;
};
