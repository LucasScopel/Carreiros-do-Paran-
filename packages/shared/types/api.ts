export type ApiResult<T> =
  | {
      ok: true;
      status: number;
      data: T;
    }
  | {
      ok: false;
      status: number;
      error: ApiErrorResponse;
    };

export interface ApiErrorResponse {
  code: ApiErrorCode;
  message?: string;
  fields?: { [k: string]: string };
}

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "CONFLICT"
  | "EMAIL_NOT_VERIFIED"
  | "VALIDATION_ERROR"
  | "EMAIL_TAKEN"
  | "INTERNAL_ERROR"
  | "PAYLOAD_TOO_LARGE";
