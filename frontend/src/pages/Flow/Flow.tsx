import { useState, useEffect, useCallback, useRef } from "react";
import {
  SaveNodes,
  SaveEdges,
  RemoveMarkdown,
} from "../../../wailsjs/go/main/App";
import {
  MyNode,
  useDataContext,
  getPairHandle,
  isEqual,
  getNodeId,
} from "../../context";

import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Connection,
  FinalConnectionState,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  Edge,
  NodeChange,
  applyNodeChanges,
  EdgeChange,
  applyEdgeChanges,
  useKeyPress,
} from "@xyflow/react";
import ImageNode from "../../components/CustomNode/ImageNode";
import VideoNode from "../../components/CustomNode/VideoNode";
import YoutubeNode from "../../components/CustomNode/YoutubeNode";
import GroupNode from "../../components/CustomNode/GroupNode";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  imageNode: ImageNode,
  videoNode: VideoNode,
  youtubeNode: YoutubeNode,
  groupNode: GroupNode,
};

const nodeOrigin: [number, number] = [0.5, 0];

type FlowSnapshot = {
  nodes: MyNode[];
  edges: Edge[];
};
const historyMax = 100;

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);

  const {
    pageName,
    nodes,
    setNodes,
    edges,
    setEdges,
    focusNode,
    editFocusNode,
    setFocusEdge,
  } = useDataContext();
  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);
  const { screenToFlowPosition } = useReactFlow();

  const undoHistory = useRef<FlowSnapshot[]>([{ nodes: nodes, edges: edges }]);
  const redoHistory = useRef<FlowSnapshot[]>([]);
  const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false);

  const undoPressed = useKeyPress(["Meta+z", "Strg+z", "Control+z"]);
  const redoPressed = useKeyPress([
    "Meta+y",
    "Strg+y",
    "Control+y",
    "Meta+Shift+z",
    "Strg+Shift+z",
    "Control+Shift+z",
  ]);

  const saveHistory = () => {
    undoHistory.current.push({
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    });
    if (undoHistory.current.length > historyMax) {
      undoHistory.current.shift();
    }
    redoHistory.current = [];
  };

  useEffect(() => {
    if (!undoPressed) {
      return;
    }
    const prev = undoHistory.current.pop();
    if (!prev) return;

    redoHistory.current.push({
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    });
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setIsUndoRedo(true);
  }, [undoPressed]);

  useEffect(() => {
    if (!redoPressed) {
      return;
    }
    const next = redoHistory.current.pop();
    if (!next) return;

    undoHistory.current.push({
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    });
    setNodes(next.nodes);
    setEdges(next.edges);
    setIsUndoRedo(true);
  }, [redoPressed]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        !isEqual(prevNodesRef.current, nodes) ||
        !isEqual(prevEdgesRef.current, edges)
      ) {
        if (!isUndoRedo) {
          saveHistory();
        }
        setIsUndoRedo(false);

        SaveNodes(JSON.stringify(nodes));
        SaveEdges(JSON.stringify(edges));
        prevNodesRef.current = nodes;
        prevEdgesRef.current = edges;
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [nodes, edges]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: MyNode) => {
      editFocusNode(node);
      setFocusEdge({} as Edge);
    },
    [editFocusNode],
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      editFocusNode({} as MyNode);
      setFocusEdge(edge);
    },
    [setFocusEdge],
  );

  const onPaneClick = useCallback(() => {
    editFocusNode({} as MyNode);
    setFocusEdge({} as Edge);
  }, [editFocusNode, setFocusEdge]);

  const onNodesChange = useCallback(
    (changes: NodeChange<MyNode>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((nds) => applyEdgeChanges(changes, nds));
    },
    [setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = { ...params, type: "step", label: "" };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      if (!connectionState.isValid) {
        const id = getNodeId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const newNode: MyNode = {
          id,
          type: "imageNode",
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: {
            label: `Node ${nodes.length + 1}`,
            imageUrl: "",
          },
          origin: [0.5, 0.0],
        };
        setNodes((nds) => nds.concat(newNode));

        const newEdge: Edge = {
          id,
          source: connectionState.fromNode!.id,
          target: id,
          type: "step",
          label: "",
          sourceHandle: connectionState.fromHandle?.id,
          targetHandle: getPairHandle(connectionState.fromHandle?.id),
        };
        setEdges((eds) => eds.concat(newEdge));
      }
    },
    [screenToFlowPosition],
  );

  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: MyNode) => {
      if (node.id === focusNode.id) {
        editFocusNode((prev) => ({
          ...prev,
          position: node.position,
        }));
      }
    },
    [focusNode],
  );

  const onNodesDelete = useCallback(
    async (deleted: MyNode[]) => {
      let remainingNodes = [...nodes];

      let nextEdges = edges;

      for (const node of deleted) {
        editFocusNode({} as MyNode);
        if (node.data) {
          await RemoveMarkdown(node.data.label);
        }

        const incomers = getIncomers(node, remainingNodes, nextEdges);
        const outgoers = getOutgoers(node, remainingNodes, nextEdges);
        const connectedEdges = getConnectedEdges([node], nextEdges);

        const remainingEdges = nextEdges.filter(
          (edge) => !connectedEdges.includes(edge),
        );

        const createdEdges = incomers.flatMap(({ id: source }) =>
          outgoers.map(({ id: target }) => ({
            id: `${source}->${target}`,
            type: "step",
            label: "",
            source,
            target,
          })),
        );

        remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);
        nextEdges = [...remainingEdges, ...createdEdges];
      }

      setEdges(nextEdges);
    },
    [nodes, edges],
  );

  return (
    <div
      className={`h-100 ${pageName === "flow-markdown" ? " w-50" : ""}`}
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeDrag={onNodeDrag}
        fitView
        // fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={[5, 5]}
        minZoom={0.1}
        panActivationKeyCode={null}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

function Flow() {
  return (
    <>
      <ReactFlowProvider>
        <AddNodeOnEdgeDrop />
      </ReactFlowProvider>
    </>
  );
}

export default Flow;
