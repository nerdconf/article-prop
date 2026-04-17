export type ProposalResponse = {
  id?: string;
  slug?: string | null;
  title: string;
  articleTitle: string;
  markdownContent: string;
  htmlContent: string;
  coverImage: string | null;
  createdAt: string;
};

export const DEFAULT_PROPOSAL_TITLE = 'Proposal Draft';
export const DEFAULT_PROPOSAL_SLUG = 'proposal-draft';
export const NERDCONF_PROFILE_URL = 'https://x.com/nerdconf_ar';
export const NERDCONF_PROFILE_IMAGE =
  'https://pbs.twimg.com/profile_images/1969167638963142656/LavpBww0_400x400.jpg';

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function getRouteSlug(pathname: string) {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');

  if (!normalizedPath) {
    return null;
  }

  if (normalizedPath.includes('/')) {
    return null;
  }

  return decodeURIComponent(normalizedPath);
}

export async function readJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

export function getDisplayContent(markdownContent: string, proposalTitle: string) {
  const markdownHeadingMatch = markdownContent.match(/^#\s+(.+)$/m);
  const articleTitle = markdownHeadingMatch?.[1].trim() || proposalTitle.trim() || DEFAULT_PROPOSAL_TITLE;
  const contentWithoutTitle = markdownHeadingMatch
    ? markdownContent.replace(/^#\s+(.+)$/m, '').trim()
    : markdownContent.trim();

  return {
    articleTitle,
    contentWithoutTitle,
  };
}
