import { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "github-markdown-css/github-markdown.css";
// import 'highlight.js/styles/github.css';
// import 'highlight.js/styles/github-dark.css';

import Editor, { OnMount } from "@monaco-editor/react";
// import "monaco-editor/esm/vs/basic-languages/markdown/markdown";

import { useDataContext } from "../context";
import MarkdownEditor from "../components/MarkdownEditor/MarkdownEditor";

function Markdown() {
  const {
    baseURL,
    nodes,
    setNodes,
    edges,
    setEdges,
    focusNode,
    editFocusNode,
    content,
    setContent,
    focusContent,
    setFocusContent,
    notes,
    setNotes,
    focusNote,
    editFocusNote,
  } = useDataContext();

  const options = {
    fontFamily: "'BIZ UDゴシック',Consolas, 'Courier New', monospace",
    fontSize: 11,
    renderWhitespace: "boundary" as const,
  };

  return (
    <>
      <div className="flex-fill overflow-auto content-markdown markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
      <div className="flex-fill content-editor">
        <MarkdownEditor></MarkdownEditor>
      </div>
    </>
  );
}

export default Markdown;
