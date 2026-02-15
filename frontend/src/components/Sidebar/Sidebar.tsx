import { useState, useEffect } from "react";
import { EventsOn, EventsOff } from "../../../wailsjs/runtime/runtime";
import { FaFolderOpen } from "react-icons/fa6";
import { useDataContext, MyNode } from "../../context";

function Sidebar(props: { workspace: string }) {
  const { workspace } = props;
  const {
    baseURL,
    nodes,
    setNodes,
    edges,
    setEdges,
    focusNode,
    setEditContent,
  } = useDataContext();

  return (
    <nav className="sidebar d-flex flex-column flex-shrink-0 bg-light overflow-auto">
      {workspace && (
        <div className="d-flex align-items-center p-2 mb-2 border-bottom">
          <FaFolderOpen className="me-2" />
          <span className="fw-semibold">{workspace}</span>
        </div>
      )}
      <ul className="nav nav-pills flex-column mb-auto">
        {nodes.map((node: MyNode) => (
          <li key={node.id} className="nav-item">
            <a
              href="#"
              className="nav-link link-dark"
              onClick={() => setEditContent(node)}
            >
              {node.data.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
