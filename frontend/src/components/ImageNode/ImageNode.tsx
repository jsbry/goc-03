import { Handle, Position } from "@xyflow/react";
import { useDataContext, isURL } from "../../context";

type ImageNodeData = {
  label: string;
  imageUrl: string;
};

export default function ImageNode({ data }: { data: ImageNodeData }) {
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

  let src = "";
  if (isURL(data.imageUrl)) {
    src = data.imageUrl;
  } else {
    src = baseURL + data.imageUrl;
  }

  return (
    <div className="node-image">
      <Handle type="target" position={Position.Top} />

      <img
        src={src}
        key={src}
        alt={data.label}
        style={{ width: "100%" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      <div style={{ marginTop: 8, textAlign: "center" }}>{data.label}</div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
