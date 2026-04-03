import { createContext, useContext } from "react";
import { v7 as uuidv7 } from "uuid";
import { Node, Edge } from "@xyflow/react";
import { ImageNodeData } from "./components/CustomNode/ImageNode";
import { VideoNodeData } from "./components/CustomNode/VideoNode";
import { YoutubeNodeData } from "./components/CustomNode/YoutubeNode";
import { GroupNodeData } from "./components/CustomNode/GroupNode";

export type MyNode = Node<
  ImageNodeData | VideoNodeData | YoutubeNodeData | GroupNodeData
>;

export type CommentData = {
  id: string;
  filename: string;
  start: number;
  end: number;
  selectedText: string;
  content: string;
};

export type DataContextType = {
  baseURL: string;
  pageName: string;
  nodes: MyNode[];
  setNodes: React.Dispatch<React.SetStateAction<MyNode[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  focusNode: MyNode;
  editFocusNode: (node: MyNode | ((prev: MyNode) => MyNode)) => void;
  focusEdge: Edge;
  setFocusEdge: React.Dispatch<React.SetStateAction<Edge>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  focusContent: string;
  setFocusContent: React.Dispatch<React.SetStateAction<string>>;
  notes: string[];
  setNotes: React.Dispatch<React.SetStateAction<string[]>>;
  focusNote: string;
  editFocusNote: (note: string) => boolean;
  comments: CommentData[];
  setComments: React.Dispatch<React.SetStateAction<CommentData[]>>;
  focusComment: CommentData;
  setFocusComment: React.Dispatch<React.SetStateAction<CommentData>>;
};

export const DataContext = createContext<DataContextType | null>(null);

export const useDataContext = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("DataContext not found");
  return ctx;
};

export function getPairHandle(id: string | null | undefined): string {
  switch (id) {
    case "sb":
      return "tt";
    case "sr":
      return "tl";
    case "st":
      return "tb";
    case "sl":
      return "tr";
  }
  return "tt";
}

export function isURL(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

export function isDuplicateName(
  nodes: MyNode[],
  notes: string[],
  name: string,
): boolean {
  if (nodes.some((node) => node.data.label === name)) {
    return true;
  }
  if (notes.some((note) => note === name)) {
    return true;
  }

  return false;
}

export function isEmpty(value: any): boolean {
  if (value == null) {
    return true;
  }
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  return false;
}

export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !isEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return a === b;
}

export function getNodeId(): string {
  return uuidv7();
}

export function getCommentId(): string {
  return uuidv7();
}
