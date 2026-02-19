import { useState, useEffect, useCallback } from "react";
import { FaFolderOpen, FaPlus, FaTrashCan } from "react-icons/fa6";
import { PiFlowArrow, PiBookOpenText } from "react-icons/pi";
import { EventsOn, EventsOff } from "../../../wailsjs/runtime/runtime";
import { useDataContext, MyNode } from "../../context";
import { RemoveMarkdown, RenameMarkdown } from "../../../wailsjs/go/main/App";

function Sidebar(props: { workspace: string }) {
  const { workspace } = props;
  const {
    baseURL,
    nodes,
    setNodes,
    edges,
    setEdges,
    focusNode,
    editFocusNode,
    content,
    setContent,
    focusContent,
    setFocusContent,
    notes,
    setNotes,
    focusNote,
    editFocusNote,
  } = useDataContext();

  const [addNote, setAddNote] = useState("");

  const onNoteChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let newNote = e.target.value;
    if (newNote === "") {
      return;
    }
    await RenameMarkdown(focusNote, newNote);

    editFocusNote(newNote);
    setNotes((nts) => nts.map((n) => (n === focusNote ? newNote : n)));
  };

  const removeNote = useCallback(async () => {
    if (!confirm('Delete "' + focusNote + '.md"?')) {
      return;
    }
    editFocusNote("");
    await RemoveMarkdown(focusNote);
    setNotes((nts) => nts.filter((note) => note !== focusNote));
  }, [notes, focusNote]);

  const addNewNote = useCallback(() => {
    const newNote: string = addNote;

    setNotes((nts) => [...nts, newNote]);
    setAddNote("");
  }, [addNote, setAddNote, setNotes]);

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
              className={`nav-link ${focusContent === node.data.label ? "active" : "link-dark"}`}
              onClick={() => editFocusNode(node)}
            >
              <PiFlowArrow className="me-2" />
              {node.data.label}
            </a>
          </li>
        ))}
      </ul>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {notes.map((note, i) => (
          <li key={i} className="nav-item">
            <a
              href="#"
              className={`nav-link ${focusContent === note ? "active" : "link-dark"}`}
              onClick={() => editFocusNote(note)}
            >
              <PiBookOpenText className="me-2" />
              {note}
            </a>
          </li>
        ))}
      </ul>
      <div className="d-flex justify-content-between align-items-center p-2 mb-2 input-group">
        {focusNote === "" ? (
          <>
            <input
              type="text"
              className="form-control"
              placeholder="Enter note"
              value={addNote}
              onChange={(e) => setAddNote(e.target.value)}
              autoComplete="off"
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={addNewNote}
            >
              <FaPlus />
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              className="form-control"
              placeholder="Enter note"
              value={focusNote}
              onChange={onNoteChange}
              autoComplete="off"
            />
            <button
              className="btn btn-danger"
              type="button"
              onClick={removeNote}
            >
              <FaTrashCan />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Sidebar;
