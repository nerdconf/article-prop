import {ProposalApiError} from './proposals.js';

const PUBLISH_API_TOKEN_ENV = 'PUBLISH_API_TOKEN';

function requireConfiguredToken() {
  const token = process.env[PUBLISH_API_TOKEN_ENV];

  if (!token || token.startsWith('REPLACE_WITH_')) {
    throw new ProposalApiError(
      500,
      `${PUBLISH_API_TOKEN_ENV} is not configured. Add it in Vercel and in your local .env.local.`
    );
  }

  return token;
}

export function authorizePublishBotRequest(
  headers?: Record<string, string | string[] | undefined>
) {
  const configuredToken = requireConfiguredToken();
  const authorizationHeader = headers?.authorization;
  const rawValue = Array.isArray(authorizationHeader)
    ? authorizationHeader[0]
    : authorizationHeader;

  if (!rawValue) {
    throw new ProposalApiError(401, 'Missing Authorization header.');
  }

  const [scheme, token] = rawValue.split(/\s+/, 2);

  if (scheme !== 'Bearer' || !token) {
    throw new ProposalApiError(401, 'Authorization must use Bearer token.');
  }

  if (token !== configuredToken) {
    throw new ProposalApiError(403, 'Invalid publish token.');
  }
}

