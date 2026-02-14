import { OpenFileDialog, SaveToAssets } from "../../../wailsjs/go/main/App";
import isEmpty from "lodash/isEmpty";
import { useDataContext, isURL } from "../../context";

function EditNode(props: { isViewEditNode: boolean }) {
  const { isViewEditNode } = props;

  const { baseURL, nodes, setNodes, edges, setEdges, focusNode, setFocusNode } =
    useDataContext();

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
        <span className="fw-semibold">Edit Node</span>
      </div>
      {isEmpty(focusNode) ? (
        <div>No node selected</div>
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
