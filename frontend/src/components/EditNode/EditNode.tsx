import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Edge } from "@xyflow/react";
import { CiNoWaitingSign } from "react-icons/ci";
import { FaTrashCan } from "react-icons/fa6";
import isEmpty from "lodash/isEmpty";
import {
  OpenFileDialog,
  SaveToAssets,
  SaveToAssetsBase64,
  RemoveAsset,
  RenameMarkdown,
} from "../../../wailsjs/go/main/App";
import {
  MyNode,
  useDataContext,
  isURL,
  isDuplicateName,
  getNodeId,
} from "../../context";

const editNodeSidebarWidth = 210;

function EditNode(props: { isViewEditNode: boolean }) {
  const { isViewEditNode } = props;
  const [width, setWidth] = useState(editNodeSidebarWidth);
  const navRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const { t } = useTranslation();
  const {
    baseURL,
    nodes,
    setNodes,
    setEdges,
    focusNode,
    editFocusNode,
    focusEdge,
    setFocusEdge,
    notes,
  } = useDataContext();

  const [addLabel, setAddLabel] = useState("");

  const addNewNode = useCallback(() => {
    const newNode: MyNode = {
      id: getNodeId(),
      type: "imageNode",
      position: {
        x: 0,
        y: 0,
      },
      data: {
        label: addLabel,
        imageUrl: "",
      },
      origin: [0.5, 0.0],
    };

    setNodes((nds) => [...nds, newNode]);
    setAddLabel("");
  }, [addLabel, setAddLabel, setNodes]);

  useEffect(() => {
    setAddLabel("");
  }, [focusNode]);

  const getImageUrl = () => {
    if ("imageUrl" in focusNode.data && focusNode.data.imageUrl) {
      return isURL(focusNode.data.imageUrl)
        ? focusNode.data.imageUrl
        : baseURL + focusNode.data.imageUrl;
    }
    return "";
  };

  const onNodeLabelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    if (newLabel === "") {
      return;
    }
    if (isDuplicateName(nodes, notes, newLabel)) {
      return;
    }
    await RenameMarkdown(focusNode.data.label, newLabel);

    editFocusNode((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        label: newLabel,
      },
    }));
    setNodes((nds) =>
      nds.map((n) =>
        n.id === focusNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                label: newLabel,
              },
            }
          : n,
      ),
    );
  };

  const onEdgeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    const newFocusEdge = {
      ...focusEdge,
      label: newLabel,
    };

    setFocusEdge(newFocusEdge);
    setEdges((eds) =>
      eds.map((ed: Edge) =>
        ed.id === focusEdge.id
          ? {
              ...ed,
              label: newLabel,
            }
          : ed,
      ),
    );
  };

  const onNodeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    editFocusNode((prev) => ({
      ...prev,
      type: newType,
    }));
    setNodes((nds) =>
      nds.map((n) =>
        n.id === focusNode.id
          ? {
              ...n,
              type: newType,
            }
          : n,
      ),
    );
  };

  const selectFile = async () => {
    const path = await OpenFileDialog();

    await SaveToAssets(path).then((imageUrl) => {
      editFocusNode((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          imageUrl,
        },
      }));
      setNodes((nds) =>
        nds.map((n) =>
          n.id === focusNode.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  imageUrl,
                },
                width: undefined,
                height: undefined,
              }
            : n,
        ),
      );
    });
  };

  const removeFile = async () => {
    if ("imageUrl" in focusNode.data && focusNode.data.imageUrl) {
      if (!isURL(focusNode.data.imageUrl)) {
        if (!confirm(t("Delete Image?"))) {
          return;
        }
        await RemoveAsset(focusNode.data.imageUrl);
      }
    }

    editFocusNode((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        imageUrl: "",
      },
    }));
    setNodes((nds) =>
      nds.map((n) =>
        n.id === focusNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                imageUrl: "",
              },
              width: undefined,
              height: undefined,
            }
          : n,
      ),
    );
  };

  const onPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = async () => {
          await SaveToAssetsBase64(
            focusNode.data.label,
            reader.result as string,
          ).then((imageUrl) => {
            editFocusNode((prev) => ({
              ...prev,
              data: {
                ...prev.data,
                imageUrl,
              },
            }));
            setNodes((nds) =>
              nds.map((n) =>
                n.id === focusNode.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        imageUrl,
                      },
                      width: undefined,
                      height: undefined,
                    }
                  : n,
              ),
            );
          });
        };
        if (file) {
          reader.readAsDataURL(file);
        }
      }
    }
  };

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
    let newWidth = rect.right - e.clientX;
    if (newWidth < editNodeSidebarWidth) {
      newWidth = editNodeSidebarWidth;
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
    <aside
      className={`edit-node-sidebar d-flex flex-column flex-shrink-0 overflow-auto ${isViewEditNode ? "" : "d-none"}`}
      style={{ width: `${width}px` }}
      ref={navRef}
    >
      <div onMouseDown={startResize} className="edit-node-sidebar-resizer" />
      <div className="d-flex justify-content-between align-items-center p-2 mb-2 border-bottom">
        <span className="fw-semibold">
          {isEmpty(focusNode) ? t("Add Node") : t("Edit Node")}
        </span>
        {!isEmpty(focusNode) && (
          <button
            type="button"
            className="btn-close"
            onClick={() => editFocusNode({} as MyNode)}
          />
        )}
      </div>
      {isEmpty(focusNode) ? (
        <>
          <div className="mb-3">
            <label htmlFor="nodeLabelInput" className="form-label">
              {t("Node Label")}
            </label>
            <input
              type="text"
              className="form-control"
              id="nodeLabelInput"
              placeholder={t("Enter node label")}
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="mb-3">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={addNewNode}
              disabled={
                addLabel === "" || isDuplicateName(nodes, notes, addLabel)
              }
            >
              {t("Add Node")}
              {isDuplicateName(nodes, notes, addLabel) && (
                <CiNoWaitingSign className="ms-1" />
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3">
            <label htmlFor="nodeLabelInput" className="form-label">
              {t("Node Label")}
            </label>
            <input
              type="text"
              className="form-control"
              id="nodeLabelInput"
              placeholder={t("Enter node label")}
              value={focusNode.data?.label || ""}
              onChange={onNodeLabelChange}
              autoComplete="off"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="nodeLabelInput" className="form-label">
              {t("Node Image")}
            </label>
            <div className="node-image" style={{ height: "auto" }}>
              <img
                key={getImageUrl()}
                src={getImageUrl()}
                alt={focusNode.data?.label || "Node Image"}
                style={{ width: "100%" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="input-group">
              <button
                className="btn btn-sm btn-outline-secondary mt-2"
                onClick={selectFile}
              >
                {t("Select Image")}
              </button>
              <button
                className="btn btn-sm btn-outline-danger mt-2"
                onClick={removeFile}
              >
                <FaTrashCan />
              </button>
            </div>
            <input
              id="pasteImageInput"
              type="text"
              className="form-control form-control-sm mt-2"
              onPaste={onPaste}
              placeholder={t("Paste Image")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="nodeType" className="form-label">
              {t("Node Type")}
            </label>
            <select
              className="form-select form-select-sm"
              id="nodeType"
              value={focusNode.type}
              onChange={onNodeTypeChange}
            >
              <option value="default">{t("Default Node")}</option>
              <option value="imageNode">{t("Image Node")}</option>
              <option value="input">{t("Input Node")}</option>
              <option value="output">{t("Output Node")}</option>
              <option value="group">{t("Group")}</option>
              <option value="groupNode">{t("Group Node")}</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="position" className="form-label">
              {t("Node Size")}
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text">width</span>
              <input
                type="text"
                className="form-control"
                value={
                  ("width" in focusNode.data && focusNode.data?.width) || 0
                }
                disabled
              />
              <span className="input-group-text">height</span>
              <input
                type="text"
                className="form-control"
                value={
                  ("height" in focusNode.data && focusNode.data?.height) || 0
                }
                disabled
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="position" className="form-label">
              {t("Node Position")}
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text">x</span>
              <input
                type="text"
                className="form-control"
                value={focusNode.position?.x || 0}
                disabled
              />
              <span className="input-group-text">y</span>
              <input
                type="text"
                className="form-control"
                value={focusNode.position?.y || 0}
                disabled
              />
            </div>
          </div>
        </>
      )}

      {!isEmpty(focusEdge) && (
        <>
          <div className="d-flex justify-content-between align-items-center p-2 mb-2 border-bottom">
            <span className="fw-semibold">{t("Edit Edge")}</span>
            <button
              type="button"
              className="btn-close"
              onClick={() => setFocusEdge({} as Edge)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="nodeLabelInput" className="form-label">
              {t("Edge Label")}
            </label>
            <input
              type="text"
              className="form-control"
              id="edgeLabelInput"
              placeholder={t("Enter edge label")}
              value={focusEdge.label?.toString()}
              onChange={onEdgeLabelChange}
              autoComplete="off"
            />
          </div>
        </>
      )}
    </aside>
  );
}

export default EditNode;
