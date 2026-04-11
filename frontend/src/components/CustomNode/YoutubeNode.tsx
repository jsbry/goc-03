import {
  NodeResizer,
  useUpdateNodeInternals,
  Handle,
  Position,
} from "@xyflow/react";
import { PiBookOpenText } from "react-icons/pi";
import { useDataContext } from "../../context";

export type YoutubeNodeData = {
  label: string;
  youtubeUrl: string;
};

export default function YoutubeNode({
  id,
  data,
  selected,
}: {
  id: string;
  data: YoutubeNodeData;
  selected: boolean;
}) {
  const { notes } = useDataContext();
  const updateNodeInternals = useUpdateNodeInternals();
  const onLoad = () => {
    updateNodeInternals(id);
  };

  const noteExists = notes.some((note) => note === data.label);

  return (
    <div className="node-youtube">
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        keepAspectRatio={true}
        minWidth={50}
        minHeight={50}
      />

      <Handle type="target" position={Position.Top} id="tt" />
      <Handle type="target" position={Position.Left} id="tl" />
      <Handle type="target" position={Position.Right} id="tr" />
      <Handle type="target" position={Position.Bottom} id="tb" />

      <div
        style={{
          flex: 1,
          position: "relative",
        }}
      >
        <iframe
          width="100%"
          height="100%"
          src={data.youtubeUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onLoad={onLoad}
        ></iframe>
      </div>

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
