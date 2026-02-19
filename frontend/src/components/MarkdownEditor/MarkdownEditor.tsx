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
  };

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
    <Editor
      width="100%"
      height="100%"
      language="markdown"
      value={content}
      theme="vs-dark"
      onChange={(value) => setContent(value || "")}
      className="flex-fill"
      options={options}
      onMount={handleEditorDidMount}
    />
  );
}
