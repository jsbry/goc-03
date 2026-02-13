import { useState, useEffect, useMemo } from "react";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import { GetConstants } from "../wailsjs/go/main/App";
import { DataContext, MyNode } from "./context";
import { Edge } from "@xyflow/react";
import Sidebar from "./components/Sidebar/Sidebar";
import Content from "./components/Content/Content";
import CommentList from "./components/CommentList/CommentList";
import "./App.css";

function App() {
  const [isViewComment, setIsViewComment] = useState<boolean>(true);
  const [pageName, setPageName] = useState<string>("markdown");
  const [workspace, setWorkspace] = useState<string>("");
  const [nodes, setNodes] = useState<MyNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    async function fetchConstants() {
      const constants = await GetConstants();
      setPageName(constants.PageName);
      setIsViewComment(constants.IsViewComment);
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
    EventsOn("pageName", (page: string) => {
      setPageName(page);
    });
    EventsOn("workspace", (workspaceName: string) => {
      setWorkspace(workspaceName);
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
      EventsOff("pageName");
      EventsOff("workspace");
      EventsOff("nodes");
      EventsOff("edges");
    };
  });

  const value = useMemo(
    () => ({ nodes, setNodes, edges, setEdges }),
    [nodes, edges],
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
            ></Content>
            <CommentList isViewComment={isViewComment}></CommentList>
          </div>
        </div>
      </div>
    </DataContext.Provider>
  );
}

export default App;
