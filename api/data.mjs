import { handleApi } from '../server/api.mjs';

export default function data(request, response) {
  return handleApi(request, response);
}
