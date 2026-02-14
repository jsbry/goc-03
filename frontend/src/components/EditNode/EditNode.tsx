import { useDataContext } from "../../context";
import isEmpty from "lodash/isEmpty";

function EditNode(props: { isViewEditNode: boolean }) {
  const { isViewEditNode } = props;

  const { nodes, setNodes, edges, setEdges, focusNode, setFocusNode } =
    useDataContext();

  const onNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
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
            <div
              style={{
                padding: 10,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                width: 180,
              }}
            >
              <img
                src={focusNode.data?.imageUrl || ""}
                alt={focusNode.data?.label || "Node"}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default EditNode;
