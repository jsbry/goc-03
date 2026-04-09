import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CiNoWaitingSign } from "react-icons/ci";
import {
  MyNode,
  useDataContext,
  isDuplicateName,
  getNodeId,
} from "../../context";

export const AddNode = () => {
  const { t } = useTranslation();
  const { nodes, setNodes, focusNode, notes } = useDataContext();

  const [addLabel, setAddLabel] = useState("");

  const addNewNode = useCallback(() => {
    const newNode: MyNode = {
      id: getNodeId(),
      type: "defaultNode",
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

  return (
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
          disabled={addLabel === "" || isDuplicateName(nodes, notes, addLabel)}
        >
          {t("Add Node")}
          {isDuplicateName(nodes, notes, addLabel) && (
            <CiNoWaitingSign className="ms-1" />
          )}
        </button>
      </div>
    </>
  );
};
