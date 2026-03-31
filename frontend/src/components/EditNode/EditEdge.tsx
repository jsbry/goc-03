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

  const onEdgeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    const newFocusEdge = {
      ...focusEdge,
      type: newType,
    };

    setFocusEdge(newFocusEdge);
    setEdges((eds) =>
      eds.map((ed: Edge) =>
        ed.id === focusEdge.id
          ? {
              ...ed,
              type: newType,
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
        <label htmlFor="edgeLabelInput" className="form-label">
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
      <div className="mb-3">
        <label htmlFor="edgeTypeInput" className="form-label">
          {t("Edge Type")}
        </label>
        <select
          className="form-select form-select-sm"
          id="edgeTypeInput"
          value={focusEdge.type}
          onChange={onEdgeTypeChange}
        >
          <option value="default">{t("default")}</option>
          <option value="straight">{t("straight")}</option>
          <option value="step">{t("step")}</option>
          <option value="smoothstep">{t("smoothstep")}</option>
          <option value="simplebezier">{t("simplebezier")}</option>
        </select>
      </div>
    </>
  );
};
