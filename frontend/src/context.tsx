import { createContext, useContext } from "react";
import { Node, Edge } from "@xyflow/react";

export type ImageNodeData = {
  label: string;
  imageUrl: string;
};
export type MyNode = Node<ImageNodeData>;

export type CommentData = {
  id: number;
  filename: string;
  start: number;
  end: number;
  selectedText: string;
  content: string;
};

export type DataContextType = {
  baseURL: string;
  nodes: MyNode[];
  setNodes: React.Dispatch<React.SetStateAction<MyNode[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  focusNode: MyNode;
  editFocusNode: (node: MyNode | ((prev: MyNode) => MyNode)) => void;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  focusContent: string;
  setFocusContent: React.Dispatch<React.SetStateAction<string>>;
  notes: string[];
  setNotes: React.Dispatch<React.SetStateAction<string[]>>;
  focusNote: string;
  editFocusNote: (note: string) => void;
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

let nodeId: number = 1;

export function getNodeId(): string {
  return `${nodeId++}`;
}

export function setNodeId(nodes: MyNode[]) {
  if (nodes.length > 0) {
    const maxId = Math.max(...nodes.map((n) => parseInt(n.id)));
    nodeId = maxId + 1;
  } else {
    nodeId = 1;
  }
}

let commentId: number = 1;

export function getCommentId(): number {
  return commentId++;
}

export function setCommentId(comments: CommentData[]) {
  if (comments.length > 0) {
    const maxId = Math.max(...comments.map((c) => c.id));
    commentId = maxId + 1;
  } else {
    commentId = 1;
  }
}
