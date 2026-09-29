import { handleApi } from '../server/api.mjs';

export default function recommendations(request, response) {
  return handleApi(request, response);
}
