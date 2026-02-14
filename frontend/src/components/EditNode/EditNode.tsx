import { useState, useCallback } from "react";
import isEmpty from "lodash/isEmpty";
import { OpenFileDialog, SaveToAssets } from "../../../wailsjs/go/main/App";
import { MyNode, useDataContext, isURL, getNodeId } from "../../context";

function EditNode(props: { isViewEditNode: boolean }) {
  const { isViewEditNode } = props;

  const { baseURL, nodes, setNodes, edges, setEdges, focusNode, setFocusNode } =
    useDataContext();

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

  const onNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newLabel = e.target.value;
    if (newLabel === "") {
      newLabel = "Node " + focusNode.id;
    }
    setFocusNode((prev) => ({
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
      setFocusNode((prev) => ({
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
      <div className="d-flex align-items-center p-2 mb-2 border-bottom">
        <span className="fw-semibold">
          {isEmpty(focusNode) ? "Add Node" : "Edit Node"}
        </span>
      </div>
      {isEmpty(focusNode) ? (
        <div>
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
              disabled={addLabel.trim() === ""}
            >
              Add Node
            </button>
          </div>
        </div>
      ) : (
        <div>
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
                src={
                  isURL(focusNode.data?.imageUrl || "")
                    ? focusNode.data?.imageUrl
                    : baseURL + focusNode.data?.imageUrl
                }
                alt={focusNode.data?.label || "Node Image"}
                style={{ width: "100%" }}
              />
            </div>
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={selectFile}
            >
              Change Image
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default EditNode;
