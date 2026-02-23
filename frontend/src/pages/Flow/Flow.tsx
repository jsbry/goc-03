import { useEffect, useCallback, useRef } from "react";
import {
  SaveNodes,
  SaveEdges,
  RemoveMarkdown,
} from "../../../wailsjs/go/main/App";
import { MyNode, useDataContext, setNodeId, getNodeId } from "../../context";
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
} from "@xyflow/react";
import ImageNode from "../../components/ImageNode/ImageNode";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  imageNode: ImageNode,
};

const nodeOrigin: [number, number] = [0.5, 0];

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

  useEffect(() => {
    setNodeId(nodes);
  }, [nodes]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isEqual(prevNodesRef.current, nodes)) {
        SaveNodes(JSON.stringify(nodes));
        prevNodesRef.current = nodes;
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [nodes]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isEqual(prevEdgesRef.current, edges)) {
        SaveEdges(JSON.stringify(edges));
        prevEdgesRef.current = edges;
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [edges]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: MyNode) => {
      editFocusNode(node);
    },
    [editFocusNode],
  );

  const onPaneClick = useCallback(() => {
    editFocusNode({} as MyNode);
  }, [editFocusNode]);

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
      const edge = { ...params, type: "step", label: "test" };
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
          label: "test",
        };
        setEdges((eds) => eds.concat(newEdge));
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
        onPaneClick={onPaneClick}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        fitView
        fitViewOptions={{ padding: 2 }}
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
