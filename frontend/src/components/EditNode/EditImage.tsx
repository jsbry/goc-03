import { useTranslation } from "react-i18next";
import { FaTrashCan } from "react-icons/fa6";
import { useDataContext } from "../../context";

export const EditImage = (props: {
  getUrl: () => string;
  selectFile: () => void;
  removeFile: () => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}) => {
  const { getUrl, selectFile, removeFile, onPaste } = props;
  const { t } = useTranslation();
  const { focusNode } = useDataContext();

  return (
    <>
      <div className="mb-3">
        <label htmlFor="nodeLabelInput" className="form-label">
          {t("Node Image")}
        </label>
        <div className="node-image" style={{ height: "auto" }}>
          <img
            key={getUrl()}
            src={getUrl()}
            alt={focusNode.data?.label || "Node Image"}
            style={{ width: "100%" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>
      <div className="mb-3">
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
          id="pasteInput"
          type="text"
          className="form-control form-control-sm mt-2"
          onPaste={onPaste}
          placeholder={t("Paste Image or URL")}
        />
      </div>
    </>
  );
};
