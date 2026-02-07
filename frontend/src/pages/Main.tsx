import { useState } from "react";

import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "highlight.js/styles/github-dark.min.css";

import Editor from "@monaco-editor/react";
// import "monaco-editor/esm/vs/basic-languages/markdown/markdown";

function Main() {
  const [content, setContent] = useState(
    "# H1\n## H2\n### H3\n\nThis is a sample markdown content.",
  );

  return (
    <div className="h-100">
      <div className="flex-fill overflow-auto content-markdown">
        <Markdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </Markdown>
      </div>
      <div className="flex-fill content-editor">
        <Editor
          width="100%"
          height="100%"
          language="markdown"
          defaultValue={content}
          theme="vs-dark"
          onChange={(value) => setContent(value || "")}
          className="flex-fill"
          options={{
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

export default Main;
