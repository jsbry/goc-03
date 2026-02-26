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
  setNodeId,
  getNodeId,
} from "../../context";
import isEqual from "lodash/isEqual";

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
  Node,
  Edge,
  NodeChange,
  applyNodeChanges,
  EdgeChange,
  applyEdgeChanges,
  useKeyPress,
} from "@xyflow/react";
import ImageNode from "../../components/ImageNode/ImageNode";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  imageNode: ImageNode,
};

const nodeOrigin: [number, number] = [0.5, 0];

const historyMax = 100;

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);

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
  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);
  const { screenToFlowPosition } = useReactFlow();

  const nodeUndoHistory = useRef<MyNode[][]>([]);
  const edgeUndoHistory = useRef<Edge[][]>([]);
  const nodeRedoHistory = useRef<MyNode[][]>([]);
  const edgeRedoHistory = useRef<Edge[][]>([]);
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

  useEffect(() => {
    if (!undoPressed) {
      return;
    }

    setIsUndoRedo(true);
    const latestNodes = nodeUndoHistory.current.pop();
    const latestEdges = edgeUndoHistory.current.pop();
    if (latestNodes) {
      setNodes(latestNodes);
      nodeRedoHistory.current.push(latestNodes);
    }
    if (latestEdges) {
      setEdges(latestEdges);
      edgeRedoHistory.current.push(latestEdges);
    }
  }, [
    undoPressed,
    nodeUndoHistory,
    edgeUndoHistory,
    nodeRedoHistory,
    edgeRedoHistory,
  ]);

  useEffect(() => {
    if (!redoPressed) {
      return;
    }

    setIsUndoRedo(true);
    const latestNodes = nodeRedoHistory.current.pop();
    const latestEdges = edgeRedoHistory.current.pop();
    if (latestNodes) {
      setNodes(latestNodes);
      nodeUndoHistory.current.push(latestNodes);
    }
    if (latestEdges) {
      setEdges(latestEdges);
      edgeUndoHistory.current.push(latestEdges);
    }
  }, [
    redoPressed,
    nodeUndoHistory,
    edgeUndoHistory,
    nodeRedoHistory,
    edgeRedoHistory,
  ]);

  useEffect(() => {
    setNodeId(nodes);
  }, [nodes]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        !isEqual(prevNodesRef.current, nodes) ||
        !isEqual(prevEdgesRef.current, edges)
      ) {
        if (!isUndoRedo) {
          nodeUndoHistory.current.push(prevNodesRef.current);
          edgeUndoHistory.current.push(prevEdgesRef.current);
        }
        setIsUndoRedo(false);
        if (nodeUndoHistory.current.length > historyMax) {
          nodeUndoHistory.current.shift();
        }
        if (edgeUndoHistory.current.length > historyMax) {
          edgeUndoHistory.current.shift();
        }

        SaveNodes(JSON.stringify(nodes));
        SaveEdges(JSON.stringify(edges));
        prevNodesRef.current = nodes;
        prevEdgesRef.current = edges;
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [nodes, edges, isUndoRedo]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     if (!isEqual(prevNodesRef.current, nodes)) {
  //       SaveNodes(JSON.stringify(nodes));
  //       prevNodesRef.current = nodes;
  //     }
  //   }, 3000);

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [nodes]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     if (!isEqual(prevEdgesRef.current, edges)) {
  //       SaveEdges(JSON.stringify(edges));
  //       prevEdgesRef.current = edges;
  //     }
  //   }, 3000);

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [edges]);

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
      nodeRedoHistory.current = [];
    },
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((nds) => applyEdgeChanges(changes, nds));
      edgeRedoHistory.current = [];
    },
    [setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = { ...params, type: "step", label: "" };
      setEdges((eds) => addEdge(edge, eds));
      edgeRedoHistory.current = [];
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
            label: `Node ${id}`,
            imageUrl: "https://picsum.photos/200/300",
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

        nodeRedoHistory.current = [];
        edgeRedoHistory.current = [];
      }
    },
    [screenToFlowPosition],
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
    <div className="h-100" ref={reactFlowWrapper}>
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
        fitView
        // fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
        nodeTypes={nodeTypes}
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
