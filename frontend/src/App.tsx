import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Content from "./components/Content/Content";
import "./App.css";

function App() {
  return (
    <div id="App">
      <div className="container-fluid">
        <div className="row">
          <Sidebar></Sidebar>
          <Content></Content>
        </div>
      </div>
    </div>
  );
}

export default App;
