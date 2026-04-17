import React, {Suspense, useEffect, useRef, useState} from 'react';
import {Check, Download, ImagePlus, Link as LinkIcon, Loader2, Upload, X} from 'lucide-react';

import type {ProposalEditorHandle} from './ProposalEditor';
import PublicProposalView from './PublicProposalView';
import {
  DEFAULT_PROPOSAL_SLUG,
  DEFAULT_PROPOSAL_TITLE,
  getDisplayContent,
  readJsonResponse,
  slugify,
} from '../lib/proposal';

const ProposalEditor = React.lazy(() => import('./ProposalEditor'));

export default function CreatorWorkspace() {
  const [proposalTitle, setProposalTitle] = useState(DEFAULT_PROPOSAL_TITLE);
  const [proposalSlug, setProposalSlug] = useState(DEFAULT_PROPOSAL_SLUG);
  const [hasCustomSlug, setHasCustomSlug] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('Start writing your proposal here...');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const editorRef = useRef<ProposalEditorHandle | null>(null);
  const dragDepthRef = useRef(0);
  const {articleTitle, contentWithoutTitle} = getDisplayContent(markdownContent, proposalTitle);

  useEffect(() => {
    if (!hasCustomSlug) {
      setProposalSlug(slugify(proposalTitle) || DEFAULT_PROPOSAL_SLUG);
    }
  }, [hasCustomSlug, proposalTitle]);

  useEffect(() => {
    document.title = proposalTitle.trim() || DEFAULT_PROPOSAL_TITLE;
  }, [proposalTitle]);

  const compressImage = (dataUrl: string, maxWidth = 1200): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });

  const isMarkdownFile = (file: File) =>
    file.type === 'text/markdown' ||
    file.type === 'text/x-markdown' ||
    /\.(md|markdown)$/i.test(file.name);

  const isImageFile = (file: File) => file.type.startsWith('image/');

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve((event.target?.result as string) || '');
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
      reader.readAsText(file);
    });

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve((event.target?.result as string) || '');
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
      reader.readAsDataURL(file);
    });

  const applyMarkdownFile = async (file: File) => {
    const newContent = await readFileAsText(file);
    setMarkdownContent(newContent);
    editorRef.current?.setMarkdown(newContent);
    setIsEditing(true);
  };

  const applyImageFile = async (file: File) => {
    const imageDataUrl = await readFileAsDataUrl(file);
    setCoverImage(imageDataUrl);
  };

  const handleIncomingFiles = async (files: File[]) => {
    if (!files.length) return;

    const markdownFile = files.find(isMarkdownFile);
    const imageFile = files.find(isImageFile);

    if (!markdownFile && !imageFile) {
      return;
    }

    try {
      if (markdownFile) {
        await applyMarkdownFile(markdownFile);
      }

      if (imageFile) {
        await applyImageFile(imageFile);
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to load dropped file.');
    }
  };

  const handleShare = async () => {
    if (!markdownContent) return;

    try {
      setIsSharing(true);

      let compressedImage = coverImage;
      if (coverImage && coverImage.length > 800000) {
        compressedImage = await compressImage(coverImage);
      }

      const title = proposalTitle.trim() || DEFAULT_PROPOSAL_TITLE;
      const slug = slugify(proposalSlug) || slugify(title) || DEFAULT_PROPOSAL_SLUG;

      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          markdownContent,
          coverImage: compressedImage ?? null,
        }),
      });

      const payload = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to share proposal.');
      }

      const link = payload?.shareUrl;
      if (typeof link !== 'string') {
        throw new Error('Publish API returned an invalid share URL.');
      }

      setProposalSlug(payload?.slug || slug);
      setShareLink(link);
      await navigator.clipboard.writeText(link);
      setShowPublishModal(true);
    } catch (err) {
      console.error('Error sharing:', err);
      alert(err instanceof Error ? err.message : 'Failed to share proposal. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleMarkdownInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleIncomingFiles([file]);
    }
    event.target.value = '';
  };

  const handleImageInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleIncomingFiles([file]);
    }
    event.target.value = '';
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragActive(false);
    void handleIncomingFiles(Array.from(event.dataTransfer.files));
  };

  const handleDownloadMd = () => {
    if (!markdownContent) return;
    const title = proposalTitle.trim() || 'Proposal';
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;

    const blob = new Blob([markdownContent], {type: 'text/markdown'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="relative min-h-screen bg-black text-[#e7e9ea] font-sans selection:bg-[#1d9bf0] selection:text-white pb-20"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragActive ? (
        <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-6">
          <div className="rounded-2xl border border-[#1d9bf0] bg-[#0b0f14] px-6 py-5 text-center shadow-[0_0_0_1px_rgba(29,155,240,0.15)]">
            <div className="text-lg font-bold text-[#e7e9ea]">Drop your files</div>
            <div className="mt-1 text-sm text-[#8b98a5]">.md updates the article. Image updates the cover.</div>
          </div>
        </div>
      ) : null}

      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-[1000px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="bg-[#1d9bf0]/20 text-[#1d9bf0] text-xs font-bold px-2 py-1 rounded">Draft</span>
            <span className="text-gray-500 text-sm hidden sm:inline-block">Saved just now</span>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-[#1d9bf0] font-bold hover:underline text-sm cursor-pointer flex items-center space-x-1">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline-block">Upload .md</span>
              <input type="file" accept=".md" className="hidden" onChange={handleMarkdownInput} />
            </label>
            <input
              type="text"
              value={proposalTitle}
              onChange={(event) => setProposalTitle(event.target.value)}
              placeholder="Proposal title"
              className="w-44 sm:w-56 bg-[#16181c] border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-[#e7e9ea] outline-none focus:border-[#1d9bf0]"
            />
            <div className="flex items-center w-40 sm:w-48 bg-[#16181c] border border-gray-800 rounded-lg px-3 py-1.5 text-sm focus-within:border-[#1d9bf0]">
              <span className="text-gray-500 mr-1">/</span>
              <input
                type="text"
                value={proposalSlug}
                onChange={(event) => {
                  setHasCustomSlug(true);
                  setProposalSlug(slugify(event.target.value));
                }}
                placeholder="public-url"
                className="w-full bg-transparent text-[#e7e9ea] outline-none"
              />
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-[#1d9bf0] font-bold hover:underline text-sm"
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={handleDownloadMd}
              disabled={!markdownContent.trim()}
              className="text-[#1d9bf0] font-bold hover:underline text-sm disabled:opacity-50 disabled:no-underline flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline-block">.md</span>
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing || !markdownContent.trim()}
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold py-1.5 px-4 rounded-full transition-colors flex items-center space-x-2 text-sm"
            >
              {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish</span>}
            </button>
          </div>
        </div>
      </div>

      {isEditing ? (
        <main className="max-w-[600px] mx-auto w-full border-x border-gray-800 min-h-screen flex flex-col pb-20">
          <>
            <div className="relative w-full aspect-[21/9] bg-gray-900 group">
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <label className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 cursor-pointer text-white" title="Change Image">
                      <ImagePlus className="w-5 h-5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageInput} />
                    </label>
                    <button
                      onClick={() => setCoverImage(null)}
                      className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 text-white"
                      title="Remove Image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors text-gray-500">
                  <ImagePlus className="w-8 h-8 mb-2" />
                  <span>Add cover image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageInput} />
                </label>
              )}
            </div>

            <div className="flex-1 w-full bg-black">
              <Suspense
                fallback={
                  <div className="flex min-h-[500px] items-center justify-center border-t border-gray-800">
                    <Loader2 className="h-7 w-7 animate-spin text-[#1d9bf0]" />
                  </div>
                }
              >
                <ProposalEditor
                  editorRef={editorRef}
                  markdown={markdownContent}
                  onChange={setMarkdownContent}
                />
              </Suspense>
            </div>
          </>
        </main>
      ) : (
        <PublicProposalView
          proposalTitle={proposalTitle}
          articleTitle={articleTitle}
          htmlContent=""
          markdownContent={markdownContent}
          coverImage={coverImage}
          legacyMarkdownContent={contentWithoutTitle}
        />
      )}

      {showPublishModal && shareLink ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#000000] border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#e7e9ea]">Published!</h3>
              <button onClick={() => setShowPublishModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#71767b] text-sm mb-6">
              Your proposal is now live. Anyone with the link can view it.
            </p>
            <div className="flex items-center space-x-2 mb-6">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 bg-[#16181c] border border-gray-800 rounded-lg px-3 py-2 text-[#e7e9ea] text-sm outline-none focus:border-[#1d9bf0]"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="bg-[#e7e9ea] hover:bg-white text-black font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <button
              onClick={() => setShowPublishModal(false)}
              className="w-full bg-transparent border border-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-full transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
