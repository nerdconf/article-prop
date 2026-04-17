import React, {Suspense, useEffect, useMemo, useState} from 'react';
import {Loader2} from 'lucide-react';

import PublicProposalView from './components/PublicProposalView';
import {
  DEFAULT_PROPOSAL_TITLE,
  getDisplayContent,
  getRouteSlug,
  readJsonResponse,
  type ProposalResponse,
} from './lib/proposal';

const CreatorWorkspace = React.lazy(() => import('./components/CreatorWorkspace'));

export default function App() {
  const [proposalTitle, setProposalTitle] = useState(DEFAULT_PROPOSAL_TITLE);
  const [articleTitle, setArticleTitle] = useState(DEFAULT_PROPOSAL_TITLE);
  const [markdownContent, setMarkdownContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const blobUrl = urlParams.get('blob');
  const proposalId = urlParams.get('id');
  const routeSlug = getRouteSlug(window.location.pathname);
  const isPublicView = !!(blobUrl || proposalId || routeSlug);

  useEffect(() => {
    if (!isPublicView) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadBlobProposal = async (blobUrlParam: string) => {
      let parsedUrl: URL;

      try {
        parsedUrl = new URL(blobUrlParam);
      } catch {
        throw new Error('Invalid proposal link.');
      }

      if (parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid proposal link.');
      }

      const response = await fetch(parsedUrl.toString());
      const payload = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load proposal.');
      }

      return payload as ProposalResponse;
    };

    const loadApiProposal = async (searchParam: string, value: string) => {
      const response = await fetch(`/api/proposal?${searchParam}=${encodeURIComponent(value)}`);
      const payload = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load proposal.');
      }

      return payload as ProposalResponse;
    };

    const loadProposal = async () => {
      try {
        const data = blobUrl
          ? await loadBlobProposal(blobUrl)
          : proposalId
            ? await loadApiProposal('id', proposalId)
            : await loadApiProposal('slug', routeSlug as string);

        if (isCancelled) {
          return;
        }

        setProposalTitle(data.title || DEFAULT_PROPOSAL_TITLE);
        setArticleTitle(data.articleTitle || data.title || DEFAULT_PROPOSAL_TITLE);
        setMarkdownContent(data.markdownContent);
        setHtmlContent(data.htmlContent || '');
        setCoverImage(data.coverImage || null);
      } catch (err) {
        console.error(err);
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load proposal.');
        }
      }

      if (!isCancelled) {
        setIsLoading(false);
      }
    };

    void loadProposal();

    return () => {
      isCancelled = true;
    };
  }, [blobUrl, isPublicView, proposalId, routeSlug]);

  useEffect(() => {
    document.title = proposalTitle.trim() || DEFAULT_PROPOSAL_TITLE;
  }, [proposalTitle]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1d9bf0] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-500">Error</h1>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="mt-6 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!isPublicView) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#1d9bf0] animate-spin" />
          </div>
        }
      >
        <CreatorWorkspace />
      </Suspense>
    );
  }

  const {contentWithoutTitle} = getDisplayContent(markdownContent, proposalTitle);

  return (
    <PublicProposalView
      proposalTitle={proposalTitle}
      articleTitle={articleTitle}
      htmlContent={htmlContent}
      markdownContent={markdownContent}
      coverImage={coverImage}
      legacyMarkdownContent={htmlContent ? undefined : contentWithoutTitle}
    />
  );
}
