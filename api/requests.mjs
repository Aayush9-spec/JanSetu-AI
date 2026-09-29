import { handleApi } from '../server/api.mjs';

export default function requests(request, response) {
  return handleApi(request, response);
}
