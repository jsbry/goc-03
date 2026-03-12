import { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { useDataContext } from "../../context";
import { formatMarkdownTable } from "./format";

export default function MarkdownEditor() {
  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    monacoInstance.languages.registerDocumentFormattingEditProvider(
      "markdown",
      {
        provideDocumentFormattingEdits(model) {
          const text = model.getValue();
          const formatted = formatMarkdownTable(text);
          return [
            {
              range: model.getFullModelRange(),
              text: formatted,
            },
          ];
        },
      },
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      () => {
        editor.getAction("editor.action.formatDocument")?.run();
      },
    );

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM, () => {});

    // WIP
    const dom = editor.getDomNode();
    dom?.addEventListener("compositionstart", () => {
      composingRef.current = true;
    });
    dom?.addEventListener("compositionend", () => {
      composingRef.current = false;
    });
  };

  const { content, setContent } = useDataContext();
  const composingRef = useRef(false);

  const onEditorChange = (value: string | undefined) => {
    if (composingRef.current) return;
    setContent(value || "");
  };

  const options = {
    fontFamily: "'BIZ UDゴシック',Consolas, 'Courier New', monospace",
    fontSize: 11,
    renderWhitespace: "boundary" as const,
  };

  return (
    <Editor
      width="100%"
      height="100%"
      language="markdown"
      value={content}
      theme="vs-dark"
      onChange={onEditorChange}
      className="flex-fill"
      options={options}
      onMount={handleEditorDidMount}
    />
  );
}
