import { useTranslation } from "react-i18next";
import { FaTrashCan } from "react-icons/fa6";

export const EditVideo = (props: {
  getUrl: () => string;
  selectFile: () => void;
  removeFile: () => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}) => {
  const { getUrl, selectFile, removeFile, onPaste } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-3">
        <label htmlFor="nodeLabelInput" className="form-label">
          {t("Node Video")}
        </label>
        <div className="node-video" style={{ height: "auto" }}>
          {getUrl() && (
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
          )}
        </div>
      </div>
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
    </>
  );
};
