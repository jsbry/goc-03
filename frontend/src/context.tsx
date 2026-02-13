import { createContext, useContext } from "react";
import { Node, Edge } from "@xyflow/react";

export type ImageNodeData = {
  label: string;
  imageUrl: string;
};
export type MyNode = Node<ImageNodeData>;

export type DataContextType = {
  nodes: MyNode[];
  setNodes: React.Dispatch<React.SetStateAction<MyNode[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
};

export const DataContext = createContext<DataContextType | null>(null);

export const useDataContext = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("DataContext not found");
  return ctx;
};
