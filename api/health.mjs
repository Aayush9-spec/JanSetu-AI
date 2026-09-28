import { handleApi } from '../server/api.mjs';

export default function health(request, response) {
  return handleApi(request, response);
}
