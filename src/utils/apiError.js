import axios from "axios";

export const isCancellationError = (error) =>
  error?.code === "ERR_CANCELED" ||
  error?.name === "CanceledError" ||
  axios.isCancel(error);