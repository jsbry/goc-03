import { useEffect, useState } from "react";

import ReactMarkdown, { Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import "github-markdown-css/github-markdown.css";
// import 'highlight.js/styles/github.css';
// import 'highlight.js/styles/github-dark.css';

import Editor, { OnMount } from "@monaco-editor/react";
// import "monaco-editor/esm/vs/basic-languages/markdown/markdown";

import { getCommentId, useDataContext } from "../../context";
import MarkdownEditor from "../../components/MarkdownEditor/MarkdownEditor";
import { componentsWithLinePosition, getSelectionLineRange } from "./selection";

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
    comments,
    setComments,
    focusComment,
    setFocusComment,
  } = useDataContext();

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString();
    console.log(selectedText);

    const range = selection.getRangeAt(0);
    console.log("range:", range);
    const element = range.startContainer.parentElement;
    console.log("element:", element);
    console.log("textContent", element?.textContent);

    const lineRange = getSelectionLineRange(selection);
    if (lineRange) {
      console.log("lineRange.startLine:", lineRange.startLine);
      console.log("lineRange.endLine:", lineRange.endLine);
    }
    setFocusComment((prev) => ({
      ...prev,
      filename: focusContent,
      start: lineRange ? lineRange.startLine : 0,
      end: lineRange ? lineRange.endLine : 0,
      selectedText: selectedText,
      content: "",
    }));
  };

  return (
    <>
      <div
        className="flex-fill overflow-auto content-markdown markdown-body"
        onMouseUp={handleMouseUp}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={componentsWithLinePosition}
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
