import { useState, useEffect, useMemo, useCallback } from "react";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import { GetConstants } from "../wailsjs/go/main/App";
import { DataContext, MyNode } from "./context";
import { Edge } from "@xyflow/react";
import Sidebar from "./components/Sidebar/Sidebar";
import Content from "./components/Content/Content";
import CommentList from "./components/CommentList/CommentList";
import EditNode from "./components/EditNode/EditNode";
import "./App.css";

function App() {
  const [isViewComment, setIsViewComment] = useState<boolean>(true);
  const [isViewEditNode, setIsViewEditNode] = useState<boolean>(true);
  const [pageName, setPageName] = useState<string>("markdown");
  const [workspace, setWorkspace] = useState<string>("");
  const [baseURL, setBaseURL] = useState<string>("");
  const [nodes, setNodes] = useState<MyNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [focusNode, setFocusNode] = useState<MyNode>({} as MyNode);
  const [nodeName, setNodeName] = useState<string>("");

  useEffect(() => {
    async function fetchConstants() {
      const constants = await GetConstants();
      setPageName(constants.PageName);
      setIsViewComment(constants.IsViewComment);
      setIsViewEditNode(constants.IsViewEditNode);
      setWorkspace(constants.Workspace);
      setNodes(JSON.parse(constants.Nodes));
      setEdges(JSON.parse(constants.Edges));
    }
    fetchConstants();
  }, []);

  useEffect(() => {
    EventsOn("isViewComment", (b: boolean) => {
      setIsViewComment(b);
    });
    EventsOn("isViewEditNode", (b: boolean) => {
      setIsViewEditNode(b);
    });
    EventsOn("pageName", (page: string) => {
      setPageName(page);
    });
    EventsOn("workspace", (workspaceName: string) => {
      setWorkspace(workspaceName);
    });
    EventsOn("baseURL", (url: string) => {
      console.log(url);
      setBaseURL(url);
      setFocusNode({} as MyNode);
    });
    EventsOn("nodes", (jsonData: string) => {
      const parsedNodes: MyNode[] = JSON.parse(jsonData);
      setNodes(parsedNodes);
    });
    EventsOn("edges", (jsonData: string) => {
      const parsedEdges: Edge[] = JSON.parse(jsonData);
      setEdges(parsedEdges);
    });

    return () => {
      EventsOff("isViewComment");
      EventsOff("isViewEditNode");
      EventsOff("pageName");
      EventsOff("workspace");
      EventsOff("baseURL");
      EventsOff("nodes");
      EventsOff("edges");
    };
  });

  const setEditContent = useCallback(
    (value: MyNode | ((prev: MyNode) => MyNode)) => {
      setFocusNode((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        setNodeName(next.data?.label || "");
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      baseURL,
      nodes,
      setNodes,
      edges,
      setEdges,
      focusNode,
      setEditContent,
    }),
    [baseURL, nodes, edges, focusNode],
  );

  return (
    <DataContext.Provider value={value}>
      <div id="app" className="h-100">
        <div className="container-fluid h-100">
          <div className="row h-100">
            <Sidebar workspace={workspace}></Sidebar>
            <Content
              pageName={pageName}
              isViewComment={isViewComment}
              isViewEditNode={isViewEditNode}
            ></Content>
            <EditNode isViewEditNode={isViewEditNode}></EditNode>
            <CommentList isViewComment={isViewComment}></CommentList>
          </div>
        </div>
      </div>
    </DataContext.Provider>
  );
}

export default App;
