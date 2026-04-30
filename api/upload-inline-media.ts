import {getErrorResponse, parseInlineMediaUploadInput, uploadInlineMedia} from './_lib/proposals.js';

function parseBody(body: unknown) {
  if (typeof body === 'string') {
    return JSON.parse(body);
  }

  return body;
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.status(405).json({error: 'Method not allowed.'});
    return;
  }

  try {
    const input = parseInlineMediaUploadInput(parseBody(request.body));
    const result = await uploadInlineMedia(input);
    response.status(200).json(result);
  } catch (error) {
    const failure = getErrorResponse(error);
    response.status(failure.status).json(failure.body);
  }
}
