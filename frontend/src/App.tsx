import { useState, useEffect, useMemo, useCallback } from "react";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import {
  GetConstants,
  OpenMarkdown,
  SaveMarkdown,
} from "../wailsjs/go/main/App";
import { DataContext, MyNode, CommentData } from "./context";
import { Edge } from "@xyflow/react";
import i18n from "i18next";
import Sidebar from "./components/Sidebar/Sidebar";
import Content from "./components/Content/Content";
import CommentList from "./components/CommentList/CommentList";
import EditNode from "./components/EditNode/EditNode";

import "./App.css";

function App() {
  const [isViewComment, setIsViewComment] = useState<boolean>(true);
  const [isViewEditNode, setIsViewEditNode] = useState<boolean>(true);
  const [lng, setLng] = useState<string>("en");
  const [pageName, setPageName] = useState<string>("markdown");
  const [workspace, setWorkspace] = useState<string>("");
  const [baseURL, setBaseURL] = useState<string>("");
  const [nodes, setNodes] = useState<MyNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [focusNode, setFocusNode] = useState<MyNode>({} as MyNode);
  const [focusEdge, setFocusEdge] = useState<Edge>({} as Edge);
  const [content, setContent] = useState<string>("");
  const [focusContent, setFocusContent] = useState<string>("");
  const [notes, setNotes] = useState<string[]>([]);
  const [focusNote, setFocusNote] = useState<string>("");
  const [comments, setComments] = useState<CommentData[]>([]);
  const [focusComment, setFocusComment] = useState<CommentData>(
    {} as CommentData,
  );

  useEffect(() => {
    async function fetchConstants() {
      const constants = await GetConstants();

      setLng(constants.Language);
      setPageName(constants.PageName);
      setIsViewComment(constants.IsViewComment);
      setIsViewEditNode(constants.IsViewEditNode);
      setWorkspace(constants.Workspace);
      setNodes(JSON.parse(constants.Nodes));
      setEdges(JSON.parse(constants.Edges));
      setNotes(JSON.parse(constants.Notes));
      setComments(JSON.parse(constants.Comments));
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
    EventsOn("lng", (lng: string) => {
      setLng(lng);
    });
    EventsOn("pageName", (page: string) => {
      setPageName(page);
    });
    EventsOn("workspace", (workspaceName: string) => {
      setWorkspace(workspaceName);
    });
    EventsOn("baseURL", (url: string) => {
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
    EventsOn("content", (content: string) => {
      setContent(content);
    });
    EventsOn("notes", (jsonData: string) => {
      const notes: string[] = JSON.parse(jsonData);
      setNotes(notes);
    });
    EventsOn("comments", (jsonData: string) => {
      const comments: CommentData[] = JSON.parse(jsonData);
      setComments(comments);
    });

    return () => {
      EventsOff("isViewComment");
      EventsOff("isViewEditNode");
      EventsOff("lng");
      EventsOff("pageName");
      EventsOff("workspace");
      EventsOff("baseURL");
      EventsOff("nodes");
      EventsOff("edges");
      EventsOff("content");
      EventsOff("notes");
      EventsOff("comments");
    };
  });

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (focusContent !== "") {
        SaveMarkdown(focusContent, content);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [focusContent, content]);

  const editFocusNode = useCallback(
    (value: MyNode | ((prev: MyNode) => MyNode)) => {
      setFocusNode((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        if (next.data) {
          OpenMarkdown(next.data.label);
          setFocusNote("");
          setFocusContent(next.data.label);
          setFocusComment({} as CommentData);
        } else {
          setFocusNote("");
          setContent("");
          setFocusContent("");
          setFocusComment({} as CommentData);
        }
        return next;
      });
    },
    [],
  );

  const editFocusNote = useCallback(
    (value: string) => {
      if (value !== "" && focusNote !== value) {
        setFocusNote(value);
        OpenMarkdown(value);
        setFocusContent(value);
        setFocusComment({} as CommentData);
      } else {
        setFocusNote("");
        setContent("");
        setFocusContent("");
        setFocusComment({} as CommentData);
      }
    },
    [focusNote],
  );

  const value = useMemo(
    () => ({
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
    }),
    [
      baseURL,
      nodes,
      edges,
      focusNode,
      focusEdge,
      content,
      focusContent,
      notes,
      focusNote,
      comments,
      focusComment,
    ],
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
