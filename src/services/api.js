import { employeeService } from './employeeService';
import { hrService } from './hrService';
import { managerService } from './managerService';

export const DatabaseService = {
  ...employeeService,
  ...hrService,
  ...managerService,
};

export { authenticatedFetch } from './apiClient';
