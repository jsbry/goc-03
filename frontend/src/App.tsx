import { useState, useEffect } from "react";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import Sidebar from "./components/Sidebar/Sidebar";
import Content from "./components/Content/Content";
import CommentList from "./components/CommentList/CommentList";
import "./App.css";

function App() {
  const [isViewComment, setIsViewComment] = useState(true);
  useEffect(() => {
    EventsOn("isViewComment", (b: boolean) => {
      setIsViewComment(b);
    });

    return () => {
      EventsOff("isViewComment");
    };
  });

  return (
    <div id="app" className="h-100">
      <div className="container-fluid h-100">
        <div className="row h-100">
          <Sidebar></Sidebar>
          <Content></Content>
          <CommentList isViewComment={isViewComment}></CommentList>
        </div>
      </div>
    </div>
  );
}

export default App;
