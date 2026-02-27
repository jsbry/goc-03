import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import { EventsOn, EventsOff } from "../../../wailsjs/runtime/runtime";
import Markdown from "../../pages/Markdown/Markdown";
import Flow from "../../pages/Flow/Flow";

function Content(props: { pageName: string; markdownView: string }) {
  const { pageName, markdownView } = props;
  const [helpShow, setHelpShow] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleHelpClose = () => {
    setHelpShow(false);
  };

  useEffect(() => {
    EventsOn("help", (v: boolean) => {
      setHelpShow(v);
    });

    return () => {
      EventsOff("help");
    };
  });

  const renderPage = (param: string) => {
    switch (param) {
      case "flow":
        return <Flow></Flow>;
      case "markdown":
        return <Markdown markdownView={markdownView}></Markdown>;
      default:
        return <Markdown markdownView={markdownView}></Markdown>;
    }
  };

  return (
    <main className="main h-100">
      {renderPage(pageName)}

      <Modal show={helpShow} onHide={handleHelpClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t("Help")}</Modal.Title>
        </Modal.Header>
        <Modal.Body></Modal.Body>
      </Modal>
    </main>
  );
}

export default Content;
