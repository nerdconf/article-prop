import {
  MDXEditor,
  headingsPlugin,
  imagePlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  linkPlugin,
  linkDialogPlugin,
  type MDXEditorMethods,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import {useEffect, useRef, type MutableRefObject} from 'react';
import {enhanceCollapsibleSections} from '../lib/collapsibleSections';

export type ProposalEditorHandle = Pick<MDXEditorMethods, 'setMarkdown' | 'insertMarkdown' | 'focus'>;

type ProposalEditorProps = {
  editorRef: MutableRefObject<ProposalEditorHandle | null>;
  markdown: string;
  onChange: (value: string) => void;
};

export default function ProposalEditor({
  editorRef,
  markdown,
  onChange,
}: ProposalEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = editorContainerRef.current?.querySelector('[data-lexical-editor="true"]');
    if (!(root instanceof HTMLElement)) {
      return;
    }

    const cleanup = enhanceCollapsibleSections(root, {editorMode: true});
    const observer = new MutationObserver(() => {
      enhanceCollapsibleSections(root, {editorMode: true});
    });

    observer.observe(root, {childList: true, subtree: true});
    return () => {
      cleanup();
      observer.disconnect();
    };
  }, [markdown]);

  return (
    <div ref={editorContainerRef}>
      <MDXEditor
        ref={(instance) => {
          editorRef.current = instance;
        }}
        markdown={markdown}
        onChange={onChange}
        className="mdxeditor-dark dark-theme dark-editor"
        plugins={[
          headingsPlugin(),
          imagePlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <CreateLink />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
}
