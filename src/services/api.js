import { employeeService } from './employeeService';
import { hrService } from './hrService';
import { managerService } from './managerService';
import { atsService } from './atsService';

export const DatabaseService = {
  ...employeeService,
  ...hrService,
  ...managerService,
  ...atsService,
};

export { authenticatedFetch, API_BASE_URL } from './apiClient';
