import { NodeResizer } from "@xyflow/react";

export type GroupNodeData = {
  label: string;
};

export default function GroupNode({ data }: { data: GroupNodeData }) {
  return (
    <div
      className="node-group react-flow__node-group"
      style={{ width: "100%", height: "100%" }}
    >
      {data.label}
    </div>
  );
}
