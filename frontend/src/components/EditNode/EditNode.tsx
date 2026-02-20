import { useState, useEffect, useCallback } from "react";
import isEmpty from "lodash/isEmpty";
import {
  OpenFileDialog,
  SaveToAssets,
  RenameMarkdown,
} from "../../../wailsjs/go/main/App";
import { MyNode, useDataContext, isURL, getNodeId } from "../../context";

function EditNode(props: { isViewEditNode: boolean }) {
  const { isViewEditNode } = props;

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
    let newLabel = e.target.value;
    if (newLabel === "") {
      newLabel = "Node " + focusNode.id;
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
              }
            : n,
        ),
      );
    });
  };

  return (
    <aside
      className={`edit-node-sidebar d-flex flex-column flex-shrink-0 bg-light overflow-auto ${isViewEditNode ? "" : "d-none"}`}
    >
      <div className="d-flex justify-content-between align-items-center p-2 mb-2 border-bottom">
        <span className="fw-semibold">
          {isEmpty(focusNode) ? "Add Node" : "Edit Node"}
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
              Node Label
            </label>
            <input
              type="text"
              className="form-control"
              id="nodeLabelInput"
              placeholder="Enter node label"
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="mb-3">
            <button
              className="btn btn-sm btn-primary"
              onClick={addNewNode}
              disabled={
                addLabel.trim() === "" ||
                nodes.some(
                  (node: MyNode) => node.data.label === addLabel.trim(),
                )
              }
            >
              Add Node
              {nodes.some(
                (node: MyNode) => node.data.label === addLabel.trim(),
              ) && <>(duplicate!)</>}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3">
            <label htmlFor="nodeLabelInput" className="form-label">
              Node Label
            </label>
            <input
              type="text"
              className="form-control"
              id="nodeLabelInput"
              placeholder="Enter node label"
              value={focusNode.data?.label || ""}
              onChange={onNodeLabelChange}
              autoComplete="off"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="nodeLabelInput" className="form-label">
              Node Image
            </label>
            <div className="node-image">
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
              Change Image
            </button>
          </div>
          <div className="mb-3"></div>
        </>
      )}
    </aside>
  );
}

export default EditNode;
