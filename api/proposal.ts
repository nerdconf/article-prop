import {fetchProposal, getErrorResponse} from '../server/proposals';

export async function GET(request: Request) {
  try {
    const proposal = await fetchProposal(new URL(request.url).searchParams.get('id'));
    return Response.json(proposal);
  } catch (error) {
    const failure = getErrorResponse(error);
    return Response.json(failure.body, {status: failure.status});
  }
}
