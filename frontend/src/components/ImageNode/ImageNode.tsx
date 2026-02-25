import { NodeResizer, Handle, Position } from "@xyflow/react";
import { useDataContext, isURL } from "../../context";

type ImageNodeData = {
  label: string;
  imageUrl: string;
};

export default function ImageNode({
  data,
  selected,
}: {
  data: ImageNodeData;
  selected: boolean;
}) {
  const {
    baseURL,
    nodes,
    setNodes,
    edges,
    setEdges,
    focusNode,
    editFocusNode,
    focusEdge,
    setFocusEdge,
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

  let src = "";
  if (isURL(data.imageUrl)) {
    src = data.imageUrl;
  } else {
    src = baseURL + data.imageUrl;
  }

  return (
    <div className="node-image">
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        keepAspectRatio={true}
        minWidth={50}
        minHeight={50}
      />

      <Handle
        type="target"
        position={Position.Top}
        id="tt"
        // style={{ left: "35%", background: "red" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="tl"
        // style={{ top: "35%", background: "red" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="tr"
        // style={{ top: "35%", background: "red" }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="tb"
        // style={{ left: "35%", background: "red" }}
      />

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

      <Handle
        type="source"
        position={Position.Bottom}
        id="sb"
        // style={{ right: "35%", background: "blue" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="sr"
        // style={{ bottom: "35%", background: "blue" }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="st"
        // style={{ right: "35%", background: "blue" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="sl"
        // style={{ bottom: "35%", background: "blue" }}
      />
    </div>
  );
}
