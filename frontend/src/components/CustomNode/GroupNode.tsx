import { NodeResizer } from "@xyflow/react";

export type GroupNodeData = {
  label: string;
};

export default function GroupNode({
  data,
  selected,
}: {
  data: GroupNodeData;
  selected: boolean;
}) {
  return (
    <div
      className="node-group react-flow__node-group"
      style={{ width: "100%", height: "100%" }}
    >
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={50}
        minHeight={50}
      />
      {data.label}
    </div>
  );
}
