import { handleApi } from '../../server/api.mjs';

export default function analyze(request, response) {
  return handleApi(request, response);
}
