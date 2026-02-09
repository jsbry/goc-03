import { useState, useEffect } from "react";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import { GetConstants } from "../wailsjs/go/main/App";
import Sidebar from "./components/Sidebar/Sidebar";
import Content from "./components/Content/Content";
import CommentList from "./components/CommentList/CommentList";
import "./App.css";

function App() {
  const [isViewComment, setIsViewComment] = useState(true);
  const [pageName, setPageName] = useState("markdown");

  useEffect(() => {
    async function fetchConstants() {
      const constants = await GetConstants();
      setPageName(constants.PageName);
      setIsViewComment(constants.IsViewComment);
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

    return () => {
      EventsOff("isViewComment");
      EventsOff("pageName");
    };
  });

  return (
    <div id="app" className="h-100">
      <div className="container-fluid h-100">
        <div className="row h-100">
          <Sidebar></Sidebar>
          <Content pageName={pageName} isViewComment={isViewComment}></Content>
          <CommentList isViewComment={isViewComment}></CommentList>
        </div>
      </div>
    </div>
  );
}

export default App;
