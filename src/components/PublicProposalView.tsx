import React, {Suspense, useEffect, useRef, useState} from 'react';
import {
  BadgeCheck,
  BarChart2,
  Bookmark,
  Download,
  Heart,
  MessageCircle,
  Repeat2,
} from 'lucide-react';

import { NerdConfLogo } from './NerdConfLogo';
import {
  DEFAULT_PROPOSAL_TITLE,
  NERDCONF_PROFILE_IMAGE,
  NERDCONF_PROFILE_URL,
} from '../lib/proposal';

const LegacyMarkdownContent = React.lazy(() => import('./LegacyMarkdownContent'));

function LikeButton({
  liked,
  burstVisible,
  onClick,
  label,
  size = 'sm',
}: {
  liked: boolean;
  burstVisible: boolean;
  onClick: () => void;
  label?: string;
  size?: 'sm' | 'xs';
}) {
  const iconSizeClass = size === 'xs' ? 'w-4 h-4' : 'w-5 h-5';
  const textSizeClass = size === 'xs' ? 'text-xs' : 'text-sm';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center space-x-1.5 transition-colors ${
        liked ? 'text-[#f91880]' : 'text-[#71767b] hover:text-[#f91880]'
      }`}
      aria-pressed={liked}
      title={liked ? 'Unlike' : 'Like'}
    >
      {burstVisible ? (
        <span className="absolute left-0 top-1/2 h-8 w-8 -translate-x-1/4 -translate-y-1/2 rounded-full bg-[#f91880]/20 animate-ping pointer-events-none" />
      ) : null}
      <Heart
        className={`${iconSizeClass} transition-all duration-200 ${liked ? 'fill-current scale-110' : ''}`}
      />
      {label ? <span className={textSizeClass}>{label}</span> : null}
    </button>
  );
}

export default function PublicProposalView({
  proposalTitle,
  articleTitle,
  htmlContent,
  markdownContent,
  coverImage,
  legacyMarkdownContent,
}: {
  proposalTitle: string;
  articleTitle: string;
  htmlContent: string;
  markdownContent: string;
  coverImage: string | null;
  legacyMarkdownContent?: string;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [showLikeBurst, setShowLikeBurst] = useState(false);
  const likeBurstTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (likeBurstTimeoutRef.current !== null) {
        window.clearTimeout(likeBurstTimeoutRef.current);
      }
    };
  }, []);

  const handleLikeToggle = () => {
    const nextLikedState = !isLiked;
    setIsLiked(nextLikedState);

    if (!nextLikedState) {
      setShowLikeBurst(false);
      if (likeBurstTimeoutRef.current !== null) {
        window.clearTimeout(likeBurstTimeoutRef.current);
        likeBurstTimeoutRef.current = null;
      }
      return;
    }

    setShowLikeBurst(true);

    if (likeBurstTimeoutRef.current !== null) {
      window.clearTimeout(likeBurstTimeoutRef.current);
    }

    likeBurstTimeoutRef.current = window.setTimeout(() => {
      setShowLikeBurst(false);
      likeBurstTimeoutRef.current = null;
    }, 600);
  };

  const handleDownloadMd = () => {
    if (!markdownContent) return;
    const title = proposalTitle.trim() || DEFAULT_PROPOSAL_TITLE;
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
    <div className="relative min-h-screen bg-black text-[#e7e9ea] font-sans selection:bg-[#1d9bf0] selection:text-white pb-20">
      <main className="max-w-[600px] mx-auto w-full border-x border-gray-800 min-h-screen">
        <div className="px-4 pt-4">
          <a
            href={NERDCONF_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-3 group"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-800 bg-[#060d1a] flex-shrink-0">
              <img
                src={NERDCONF_PROFILE_IMAGE}
                alt="@NERDCONF profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1">
                <span className="font-bold text-[#e7e9ea] group-hover:underline text-lg">NERDCONF</span>
                <BadgeCheck className="w-5 h-5 text-[#1d9bf0]" fill="currentColor" />
              </div>
              <div className="text-[#71767b] text-sm">@nerdconf_ar</div>
            </div>
          </a>
        </div>

        {coverImage ? (
          <div className="mt-4 w-full aspect-[21/9] bg-gray-900 overflow-hidden">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="mt-4 w-full aspect-[21/9] bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <span className="text-gray-600 font-mono text-sm">No cover image uploaded</span>
          </div>
        )}

        <div className="px-4 pt-5 pb-6">
          <h1 className="text-[2.45rem] sm:text-[3.15rem] font-bold text-[#e7e9ea] mb-4 leading-[0.98] tracking-tight">
            {articleTitle}
          </h1>

          <div className="flex items-center justify-between pb-4 text-[#71767b]">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div className="flex items-center space-x-1.5">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Discuss</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Repeat2 className="w-5 h-5" />
                <span className="text-sm">v1.0</span>
              </div>
              <LikeButton
                liked={isLiked}
                burstVisible={showLikeBurst}
                onClick={handleLikeToggle}
                label="Approve"
              />
              <div className="hidden sm:flex items-center space-x-1.5">
                <BarChart2 className="w-5 h-5" />
                <span className="text-sm">Confidential</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <div className="text-[#1d9bf0]">
                <Bookmark className="w-5 h-5" fill="currentColor" />
              </div>
              <button
                onClick={handleDownloadMd}
                className="flex items-center space-x-1.5 text-[#1d9bf0] hover:text-[#63b3ff] transition-colors"
                title=".md"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm font-medium">.md</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-p:text-[#e7e9ea] prose-p:leading-relaxed prose-p:mb-6
                prose-headings:text-[#e7e9ea] prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-a:text-[#8ecdfc] prose-a:underline prose-a:decoration-[#1d9bf0]/55 prose-a:underline-offset-[0.18em] prose-a:bg-[#1d9bf0]/12 prose-a:px-1 prose-a:py-0.5 prose-a:rounded-md hover:prose-a:bg-[#1d9bf0]/20 hover:prose-a:text-[#c7e8ff] hover:prose-a:decoration-[#63b3ff]/85
                prose-strong:text-[#e7e9ea]
                prose-ul:text-[#e7e9ea] prose-ol:text-[#e7e9ea]
                prose-li:marker:text-gray-500
                prose-blockquote:border-l-4 prose-blockquote:border-gray-700 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
                prose-code:text-[#e7e9ea] prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800
                prose-img:rounded-2xl prose-img:border prose-img:border-gray-800"
            >
              {htmlContent ? (
                <div dangerouslySetInnerHTML={{__html: htmlContent}} />
              ) : legacyMarkdownContent ? (
                <Suspense fallback={null}>
                  <LegacyMarkdownContent markdownContent={legacyMarkdownContent} />
                </Suspense>
              ) : null}
            </div>
          </div>

          <div className="mt-12 pt-4">
            <div className="text-[#71767b] text-sm mb-4 flex items-center space-x-1">
              <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
              <span>·</span>
              <span>{new Date().toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
              <span>·</span>
              <span className="text-white font-bold ml-1">1</span>
              <span>Exclusive View</span>
            </div>

            <div className="flex items-center justify-between py-3 border-y border-gray-800 mb-4 text-[#71767b]">
              <div className="flex items-center space-x-2 hover:text-[#1d9bf0] cursor-pointer transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-sm">Discuss</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-[#00ba7c] cursor-pointer transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                  <Repeat2 className="w-5 h-5" />
                </div>
                <span className="text-sm">Revise</span>
              </div>
              <div className="p-2 rounded-full hover:bg-[#f91880]/10 transition-colors">
                <LikeButton
                  liked={isLiked}
                  burstVisible={showLikeBurst}
                  onClick={handleLikeToggle}
                  label="Approve"
                />
              </div>
              <div className="flex items-center space-x-1">
                <div className="p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] cursor-pointer transition-colors">
                  <Bookmark className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-4 pb-4 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full bg-[#060d1a] flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-800">
                <NerdConfLogo />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-[#e7e9ea] hover:underline cursor-pointer">NERDCONF</span>
                  <BadgeCheck className="w-4 h-4 text-[#1d9bf0]" fill="currentColor" />
                  <span className="text-[#71767b] text-sm">@nerdconf_ar · 1m</span>
                </div>
                <p className="text-[#e7e9ea] mt-1">
                  Next steps: If you're happy with this proposal, just reply to the email with your thoughts. We'll then prepare the MSA and SOW to get started. Excited to partner with you! 🚀
                </p>
                <div className="flex items-center space-x-6 mt-3 text-[#71767b]">
                  <div className="flex items-center space-x-2 hover:text-[#1d9bf0] cursor-pointer group">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex items-center space-x-2 hover:text-[#00ba7c] cursor-pointer group">
                    <Repeat2 className="w-4 h-4" />
                  </div>
                  <LikeButton
                    liked={isLiked}
                    burstVisible={showLikeBurst}
                    onClick={handleLikeToggle}
                    size="xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-4 pb-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="https://pbs.twimg.com/profile_images/1780044485541699584/p78MCn3B_400x400.jpg"
                  alt="Elon Musk"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-[#e7e9ea] hover:underline cursor-pointer">Elon Musk</span>
                  <BadgeCheck className="w-4 h-4 text-[#ffd700]" fill="currentColor" />
                  <span className="text-[#71767b] text-sm">@elonmusk · Apr 1</span>
                </div>
                <p className="text-[#e7e9ea] mt-1">
                  Working with <span className="text-[#1d9bf0]">@nerdconf_ar</span> was the best decision we made this year. They completely transformed our architecture and delivered 10x ROI. Highly recommend! 🔥
                </p>
                <div className="flex items-center space-x-6 mt-3 text-[#71767b]">
                  <div className="flex items-center space-x-2 hover:text-[#1d9bf0] cursor-pointer group">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">1.2K</span>
                  </div>
                  <div className="flex items-center space-x-2 hover:text-[#00ba7c] cursor-pointer group">
                    <Repeat2 className="w-4 h-4" />
                    <span className="text-xs">4.5K</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LikeButton
                      liked={isLiked}
                      burstVisible={showLikeBurst}
                      onClick={handleLikeToggle}
                      size="xs"
                    />
                    <span className="text-xs">30.2K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
