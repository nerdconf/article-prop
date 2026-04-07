import type { VercelRequest, VercelResponse } from '@vercel/node';
import {fetchProposal, getErrorResponse} from '../server/proposals';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const slug = req.query.slug as string | undefined;
    const proposal = await fetchProposal(slug);
    return res.status(200).json(proposal);
  } catch (error) {
    const failure = getErrorResponse(error);
    return res.status(failure.status).json(failure.body);
  }
}
