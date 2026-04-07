import type { VercelRequest, VercelResponse } from '@vercel/node';
import {getErrorResponse, parsePublishProposalInput, publishProposal} from '../server/proposals';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const input = parsePublishProposalInput(body);
    const result = await publishProposal(input);
    return res.status(200).json(result);
  } catch (error) {
    const failure = getErrorResponse(error);
    return res.status(failure.status).json(failure.body);
  }
}
