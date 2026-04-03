import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaFolderOpen, FaPlus, FaTrashCan } from "react-icons/fa6";
import { CiNoWaitingSign } from "react-icons/ci";
import {
  PiGenderNeuter,
  PiFlowArrow,
  PiBook,
  PiBookOpenText,
} from "react-icons/pi";
import { useDataContext, MyNode, isDuplicateName } from "../../context";
import { RemoveMarkdown, RenameMarkdown } from "../../../wailsjs/go/main/App";

const sidebarWidth = 210;

function Sidebar(props: { workspace: string }) {
  const { workspace } = props;
  const { t } = useTranslation();
  const {
    nodes,
    editFocusNode,
    focusContent,
    notes,
    setNotes,
    focusNote,
    editFocusNote,
  } = useDataContext();

  const [addNote, setAddNote] = useState("");
  const [editNote, setEditNote] = useState("");
  const [width, setWidth] = useState(sidebarWidth);
  const navRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    setEditNote(focusNote);
  }, [focusNote]);

  useEffect(() => {
    changeNote(editNote);
  }, [editNote]);

  const onNoteChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNote = e.target.value;
    if (newNote === "") {
      return;
    }
    if (isDuplicateName(nodes, notes, newNote)) {
      return;
    }
    setEditNote(newNote);
  };

  const changeNote = async (value: string) => {
    const newNote = value;
    if (newNote === "") {
      return;
    }
    if (isDuplicateName(nodes, notes, newNote)) {
      return;
    }
    await RenameMarkdown(focusNote, newNote);

    editFocusNote(newNote);
    setNotes((nts) => nts.map((n) => (n === focusNote ? newNote : n)));
  };

  const removeNote = useCallback(async () => {
    if (!confirm(t("Delete file.md?", { name: focusNote }))) {
      return;
    }
    editFocusNote("");
    await RemoveMarkdown(focusNote);
    setNotes((nts) => nts.filter((note) => note !== focusNote));
  }, [notes, focusNote]);

  const addNewNote = useCallback(() => {
    if (isDuplicateName(nodes, notes, addNote)) {
      return;
    }
    if (editFocusNote(addNote)) {
      setNotes((nts) => [...nts, addNote]);
      setAddNote("");
    }
  }, [nodes, notes, addNote, setAddNote, setNotes]);

  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    document.body.classList.add("no-select");
    isResizing.current = true;
  };

  const stopResize = () => {
    isResizing.current = false;
    document.body.classList.remove("no-select");
  };

  const resize = (e: MouseEvent) => {
    if (!isResizing.current || !navRef.current) return;

    const rect = navRef.current.getBoundingClientRect();
    let newWidth = e.clientX - rect.left;
    if (newWidth < sidebarWidth) {
      newWidth = sidebarWidth;
    }
    setWidth(newWidth);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, []);

  return (
    <nav
      className="sidebar d-flex flex-column flex-shrink-0 bg-light overflow-auto"
      style={{ width: `${width}px` }}
      ref={navRef}
    >
      <div onMouseDown={startResize} className="sidebar-resizer" />
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
              className={`nav-link nav-link-text ${focusContent === node.data.label ? "active" : "link-dark"}`}
              onClick={() => editFocusNode(node)}
            >
              {focusContent === node.data.label ? (
                <PiFlowArrow className="me-2" />
              ) : (
                <PiGenderNeuter className="me-2" />
              )}
              {node.data.label}
            </a>
          </li>
        ))}
      </ul>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {notes.map((note, i) => {
          const exists = nodes.some((node) => node.data.label === note);
          if (exists) {
            return null;
          }
          return (
            <li key={i} className="nav-item">
              <a
                href="#"
                className={`nav-link nav-link-text ${focusContent === note ? "active" : "link-dark"}`}
                onClick={() => editFocusNote(note)}
              >
                {focusContent === note ? (
                  <PiBookOpenText className="me-2" />
                ) : (
                  <PiBook className="me-2" />
                )}
                {note}
              </a>
            </li>
          );
        })}
      </ul>
      <div className="d-flex justify-content-between align-items-center p-2 mb-2 input-group">
        {focusNote === "" ? (
          <>
            <input
              type="text"
              className="form-control"
              placeholder={t("Enter note")}
              value={addNote}
              onChange={(e) => setAddNote(e.target.value)}
              autoComplete="off"
            />
            <button
              className="btn btn-outline-primary"
              type="button"
              onClick={addNewNote}
              disabled={
                addNote === "" || isDuplicateName(nodes, notes, addNote)
                  ? true
                  : false
              }
            >
              {!isDuplicateName(nodes, notes, addNote) ? (
                <FaPlus />
              ) : (
                <CiNoWaitingSign />
              )}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              className="form-control"
              placeholder={t("Enter note")}
              value={editNote}
              onChange={onNoteChange}
              autoComplete="off"
            />
            <button
              className="btn btn-outline-danger"
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
