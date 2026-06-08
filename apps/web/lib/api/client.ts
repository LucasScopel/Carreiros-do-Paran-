export { baseApiFetch as apiClientFetch } from "./base";
import { baseApiFetch, createApi } from "./base";

export const api = createApi(baseApiFetch);
