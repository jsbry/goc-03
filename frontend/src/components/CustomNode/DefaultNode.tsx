import { NodeResizer, Handle, Position } from "@xyflow/react";
import { PiBookOpenText } from "react-icons/pi";
import { useDataContext } from "../../context";

export type DefaultNodeData = {
  label: string;
};

export default function DefaultNode({
  data,
  selected,
}: {
  data: DefaultNodeData;
  selected: boolean;
}) {
  const { notes } = useDataContext();

  const noteExists = notes.some((note) => note === data.label);

  return (
    <div className="node-default" style={{ width: "100%", height: "100%" }}>
      <NodeResizer color="#ff0071" isVisible={selected} />

      <Handle type="target" position={Position.Top} id="tt" />
      <Handle type="target" position={Position.Left} id="tl" />
      <Handle type="target" position={Position.Right} id="tr" />
      <Handle type="target" position={Position.Bottom} id="tb" />

      <div style={{ textAlign: "center" }}>
        {noteExists ? (
          <span>
            <PiBookOpenText className="me-1 mb-1" />
          </span>
        ) : (
          ""
        )}
        {data.label}
      </div>

      <Handle type="source" position={Position.Bottom} id="sb" />
      <Handle type="source" position={Position.Right} id="sr" />
      <Handle type="source" position={Position.Top} id="st" />
      <Handle type="source" position={Position.Left} id="sl" />
    </div>
  );
}
