// src/utils/apiResponse.ts
export const ok = (data: any) => ({ success: true, ...data });
export const fail = (message = "error") => ({ success: false, message });
