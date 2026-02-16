import { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "highlight.js/styles/github-dark.min.css";

import Editor from "@monaco-editor/react";
// import "monaco-editor/esm/vs/basic-languages/markdown/markdown";

import { useDataContext } from "../context";

function Markdown() {
  const {
    baseURL,
    nodes,
    setNodes,
    edges,
    setEdges,
    focusNode,
    setEditContent,
    content,
    setContent,
    notes,
    setNotes,
  } = useDataContext();

  return (
    <div className="h-100">
      <div className="flex-fill overflow-auto content-markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
      <div className="flex-fill content-editor">
        <Editor
          width="100%"
          height="100%"
          language="markdown"
          value={content}
          theme="vs-dark"
          onChange={(value) => setContent(value || "")}
          className="flex-fill"
        />
      </div>
    </div>
  );
}

export default Markdown;
