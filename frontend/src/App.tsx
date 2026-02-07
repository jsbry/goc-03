import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Content from "./components/Content/Content";
import CommentList from "./components/CommentList/CommentList";
import "./App.css";

function App() {
  return (
    <div id="app" className="h-100">
      <div className="container-fluid h-100">
        <div className="row h-100">
          <Sidebar></Sidebar>
          <Content></Content>
          <CommentList></CommentList>
        </div>
      </div>
    </div>
  );
}

export default App;
