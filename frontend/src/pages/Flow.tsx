import { useEffect, useCallback, useRef } from "react";
import { EventsOn, EventsOff } from "../../wailsjs/runtime/runtime";
import { SaveNodes, SaveEdges } from "../../wailsjs/go/main/App";
import { MyNode, useDataContext } from "../context";
import isEqual from "lodash/isEqual";

import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
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
import ImageNode from "../components/ImageNode/ImageNode";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  imageNode: ImageNode,
};

let id: number = 1;
const getId = () => `${id++}`;
const nodeOrigin: [number, number] = [0.5, 0];

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);

  const { nodes, setNodes, edges, setEdges } = useDataContext();
  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (nodes.length === 0) {
        return;
      }

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
      if (edges.length === 0) {
        return;
      }

      if (!isEqual(prevEdgesRef.current, edges)) {
        SaveEdges(JSON.stringify(edges));
        prevEdgesRef.current = edges;
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [edges]);

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
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      if (!connectionState.isValid) {
        const id = getId();
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
        };
        setEdges((eds) => eds.concat(newEdge));
      }
    },
    [screenToFlowPosition],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      let remainingNodes = [...nodes];
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, remainingNodes, acc);
          const outgoers = getOutgoers(node, remainingNodes, acc);
          const connectedEdges = getConnectedEdges([node], acc);

          const remainingEdges = acc.filter(
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

          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
  );

  return (
    <div className="h-100" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
    <div className="h-100">
      <ReactFlowProvider>
        <AddNodeOnEdgeDrop />
      </ReactFlowProvider>
    </div>
  );
}

export default Flow;
