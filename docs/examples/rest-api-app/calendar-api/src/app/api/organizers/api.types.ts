import { Organizer } from '@/organizer/types/organizer.types';
import { ApiResponseList } from '../api.types';

export interface OrganizerApiResponse extends ApiResponseList {
  data: Organizer[];
}
