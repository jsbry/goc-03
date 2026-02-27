import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Edge } from "@xyflow/react";
import { CiNoWaitingSign } from "react-icons/ci";
import isEmpty from "lodash/isEmpty";
import {
  OpenFileDialog,
  SaveToAssets,
  RenameMarkdown,
} from "../../../wailsjs/go/main/App";
import {
  MyNode,
  useDataContext,
  isURL,
  isDuplicateName,
  getNodeId,
} from "../../context";

function EditNode(props: { isViewEditNode: boolean }) {
  const { isViewEditNode } = props;
  const { t } = useTranslation();
  const {
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

  return (
    <aside
      className={`edit-node-sidebar d-flex flex-column flex-shrink-0 overflow-auto ${isViewEditNode ? "" : "d-none"}`}
    >
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
                key={
                  isURL(focusNode.data?.imageUrl || "")
                    ? focusNode.data?.imageUrl
                    : baseURL + focusNode.data?.imageUrl
                }
                src={
                  isURL(focusNode.data?.imageUrl || "")
                    ? focusNode.data?.imageUrl
                    : baseURL + focusNode.data?.imageUrl
                }
                alt={focusNode.data?.label || "Node Image"}
                style={{ width: "100%" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={selectFile}
            >
              {t("Change Image")}
            </button>
          </div>
          <div className="mb-3"></div>
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
