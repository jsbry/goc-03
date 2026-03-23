import { useTranslation } from "react-i18next";
import { Edge } from "@xyflow/react";
import { useDataContext } from "../../context";

export const EditEdge = () => {
  const { t } = useTranslation();
  const { focusEdge, setFocusEdge, setEdges } = useDataContext();

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

  return (
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
  );
};
