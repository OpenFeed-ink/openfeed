import { ZodError } from "zod";
export type FormState<T = any>  = {
  status: "UNSET" | "SUCCESS" | "ERROR";
  message: string;
  fieldErrors: Record<string, string[] | undefined>;
  timestamp: number;
  restult?: T
};

export const EMPTY_FORM_STATE: FormState = {
  status: "UNSET" as const,
  message: "",
  fieldErrors: {},
  timestamp: Date.now(),
};
export const fromErrorToFormState = (error: unknown): FormState => {
  // if validation error with Zod, return first error message
  if (error instanceof ZodError) {
    return {
      ...EMPTY_FORM_STATE,
      message: error.message,
      status: 'ERROR'
    };
    // if another error instance, return error message
    // e.g. database error
  } else if (error instanceof Error) {
    return {
      ...EMPTY_FORM_STATE,
      message: error.message,
      status: 'ERROR'
    };
    // if not an error instance but something else crashed
    // return generic error message
  } else {
    return {
      ...EMPTY_FORM_STATE,
      message: "An unknown error occurred",
      status: 'ERROR'
    };
  }
};

export const toFormState = <T>(
  status: FormState["status"],
  message: string,
  restult?:T
): FormState<T> => {
  return {
    status,
    restult,
    message,
    fieldErrors: {},
    timestamp: Date.now(),
  };
};
