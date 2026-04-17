import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function LegacyMarkdownContent({markdownContent}: {markdownContent: string}) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>;
}
