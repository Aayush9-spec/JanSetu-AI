import { handleApi } from '../server/api.mjs';

export default function notifications(request, response) {
  return handleApi(request, response);
}
