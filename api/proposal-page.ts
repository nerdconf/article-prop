import {fetchProposalPageHtml, getErrorResponse} from './_lib/proposals.js';

function getRequestOrigin(request: any) {
  const protocol = request.headers['x-forwarded-proto'] || 'https';
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  return `${protocol}://${host}`;
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') {
    response.status(405).send('Method not allowed.');
    return;
  }

  try {
    const html = await fetchProposalPageHtml({
      id: request.query?.id,
      slug: request.query?.slug,
      origin: getRequestOrigin(request),
    });

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
    response.status(200).send(html);
  } catch (error) {
    const failure = getErrorResponse(error);
    response.status(failure.status).send(failure.body.error);
  }
}
