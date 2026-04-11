import {
  NodeResizer,
  useUpdateNodeInternals,
  Handle,
  Position,
} from "@xyflow/react";
import { PiBookOpenText } from "react-icons/pi";
import { useDataContext, isURL } from "../../context";

export type VideoNodeData = {
  label: string;
  videoUrl: string;
};

export default function VideoNode({
  id,
  data,
  selected,
}: {
  id: string;
  data: VideoNodeData;
  selected: boolean;
}) {
  const { baseURL, notes } = useDataContext();
  const updateNodeInternals = useUpdateNodeInternals();
  const onLoad = () => {
    updateNodeInternals(id);
  };

  const noteExists = notes.some((note) => note === data.label);

  let src = "";
  if (isURL(data.videoUrl)) {
    src = data.videoUrl;
  } else {
    src = baseURL + data.videoUrl;
  }

  return (
    <div className="node-video">
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
        <video
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          onLoad={onLoad}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        >
          <source key={src} src={src} type="video/mp4" />
        </video>
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
