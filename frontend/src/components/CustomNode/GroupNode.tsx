import { NodeResizer } from "@xyflow/react";

export type GroupNodeData = {
  label: string;
  width: number;
  height: number;
};

export default function GroupNode({ data }: { data: GroupNodeData }) {
  return (
    <div
      className="node-group react-flow__node-group"
      style={{ width: data.width, height: data.height }}
    >
      {data.label}
    </div>
  );
}
