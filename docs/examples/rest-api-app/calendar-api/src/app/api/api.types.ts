export interface ApiResponse {
  status: number;
}

export interface ApiResponseWithResult {
  status: 200 | 204 | 404;
}

export interface ApiResponseItem extends ApiResponseWithResult {
  data: unknown;
}

export interface ApiResponseList extends ApiResponseWithResult {
  results: number;
  // TODO: add paging
  data: unknown[];
}

export interface ApiErrorResponse extends ApiResponse {
  error: string; // error message
}
