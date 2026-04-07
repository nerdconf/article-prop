import {getErrorResponse, parsePublishProposalInput, publishProposal} from '../server/proposals';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parsePublishProposalInput(body);
    const result = await publishProposal(input, new URL(request.url).origin);
    return Response.json(result);
  } catch (error) {
    const failure = getErrorResponse(error);
    return Response.json(failure.body, {status: failure.status});
  }
}
