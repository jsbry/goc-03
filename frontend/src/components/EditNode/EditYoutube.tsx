import { useTranslation } from "react-i18next";
import { FaTrashCan } from "react-icons/fa6";

export const EditYoutube = (props: {
  removeFile: () => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}) => {
  const { removeFile, onPaste } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-3">
        <label htmlFor="nodeLabelInput" className="form-label">
          {t("Node Youtube URL")}
        </label>
        <div className="input-group input-group-sm">
          <input
            id="pasteInput"
            type="text"
            className="form-control form-control-sm"
            onPaste={onPaste}
            placeholder={t("Paste YouTube URL")}
          />
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={removeFile}
          >
            <FaTrashCan />
          </button>
        </div>
      </div>
    </>
  );
};
