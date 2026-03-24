import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaTrashCan } from "react-icons/fa6";
import isEmpty from "lodash/isEmpty";
import {
  OpenFileDialog,
  SaveToAssets,
  SaveToAssetsBase64,
  RemoveAsset,
  RenameMarkdown,
} from "../../../wailsjs/go/main/App";
import { MyNode, useDataContext, isURL, isDuplicateName } from "../../context";
import { AddNode } from "./AddNode";
import { EditImage } from "./EditImage";
import { EditEdge } from "./EditEdge";

const editNodeSidebarWidth = 210;

const keyMap: Record<string, string> = {
  imageNode: "imageUrl",
  videoNode: "videoUrl",
  youtubeNode: "youtubeUrl",
};

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
    focusNode,
    editFocusNode,
    focusEdge,
    notes,
  } = useDataContext();

  const getUrl = () => {
    if ("imageUrl" in focusNode.data && focusNode.data.imageUrl) {
      return isURL(focusNode.data.imageUrl)
        ? focusNode.data.imageUrl
        : baseURL + focusNode.data.imageUrl;
    }
    if ("videoUrl" in focusNode.data && focusNode.data.videoUrl) {
      return isURL(focusNode.data.videoUrl)
        ? focusNode.data.videoUrl
        : baseURL + focusNode.data.videoUrl;
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
    const key = keyMap[focusNode.type || ""];
    const path = await OpenFileDialog(focusNode.type || "");

    await SaveToAssets(path).then((imageUrl) => {
      editFocusNode((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [key]: imageUrl,
        },
      }));
      setNodes((nds) =>
        nds.map((n) =>
          n.id === focusNode.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  [key]: imageUrl,
                },
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
            }
          : n,
      ),
    );
  };

  const onPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const key = keyMap[focusNode.type || ""];
    const pasteData = e.clipboardData.getData("text");
    if (isURL(pasteData)) {
      editFocusNode((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [key]: pasteData,
        },
      }));
      setNodes((nds) =>
        nds.map((n) =>
          n.id === focusNode.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  [key]: pasteData,
                },
              }
            : n,
        ),
      );
      return;
    }
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
        <AddNode />
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
          {focusNode.type === "imageNode" && (
            <EditImage
              getUrl={getUrl}
              selectFile={selectFile}
              removeFile={removeFile}
              onPaste={onPaste}
            />
          )}
          {focusNode.type === "videoNode" && (
            <div className="mb-3">
              <label htmlFor="nodeLabelInput" className="form-label">
                {t("Node Video")}
              </label>
              <div className="node-video" style={{ height: "auto" }}>
                <video
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                >
                  <source key={getUrl()} src={getUrl()} type="video/mp4" />
                </video>
              </div>
            </div>
          )}
          {focusNode.type === "videoNode" && (
            <div className="mb-3">
              <div className="input-group">
                <button
                  className="btn btn-sm btn-outline-secondary mt-2"
                  onClick={selectFile}
                >
                  {t("Select Video")}
                </button>
                <button
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={removeFile}
                >
                  <FaTrashCan />
                </button>
              </div>
              <input
                id="pasteInput"
                type="text"
                className="form-control form-control-sm mt-2"
                onPaste={onPaste}
                placeholder={t("Paste Video URL")}
              />
            </div>
          )}
          {focusNode.type === "youtubeNode" && (
            <div className="mb-3">
              <label htmlFor="nodeLabelInput" className="form-label">
                {t("Node Youtube URL")}
              </label>
              <input
                id="pasteInput"
                type="text"
                className="form-control form-control-sm"
                onPaste={onPaste}
                placeholder={t("Paste YouTube URL")}
              />
            </div>
          )}
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
              <option value="videoNode">{t("Video Node")}</option>
              <option value="youtubeNode">{t("YouTube Node")}</option>
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
                  (focusNode.measured &&
                    "width" in focusNode.measured &&
                    focusNode.measured.width) ||
                  0
                }
                disabled
              />
              <span className="input-group-text">height</span>
              <input
                type="text"
                className="form-control"
                value={
                  (focusNode.measured &&
                    "height" in focusNode.measured &&
                    focusNode.measured.height) ||
                  0
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

      {!isEmpty(focusEdge) && <EditEdge />}
    </aside>
  );
}

export default EditNode;
