export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
  code?: string;
};
