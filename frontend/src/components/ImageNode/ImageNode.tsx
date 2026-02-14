import { Handle, Position } from "@xyflow/react";
import { useDataContext, isURL } from "../../context";

type ImageNodeData = {
  label: string;
  imageUrl: string;
};

export default function ImageNode({ data }: { data: ImageNodeData }) {
  const { baseURL, nodes, setNodes, edges, setEdges, focusNode, setFocusNode } =
    useDataContext();

  let src = "";
  if (isURL(data.imageUrl)) {
    src = data.imageUrl;
  } else {
    src = baseURL + data.imageUrl;
  }

  return (
    <div className="node-image">
      <Handle type="target" position={Position.Top} />

      <img src={src} alt={data.label} style={{ width: "100%" }} />

      <div style={{ marginTop: 8, textAlign: "center" }}>{data.label}</div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
