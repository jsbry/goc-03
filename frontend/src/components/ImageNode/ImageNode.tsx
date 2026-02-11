import { Handle, Position } from "@xyflow/react";

type ImageNodeData = {
  label: string;
  imageUrl: string;
};

export default function ImageNode({ data }: { data: ImageNodeData }) {
  return (
    <div
      style={{
        padding: 10,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 8,
        width: 180,
      }}
    >
      <Handle type="target" position={Position.Top} />

      <img src={data.imageUrl} alt={data.label} style={{ width: "100%" }} />

      <div style={{ marginTop: 8, textAlign: "center" }}>{data.label}</div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
