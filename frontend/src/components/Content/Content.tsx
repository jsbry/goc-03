import { useState, useEffect } from "react";
import { EventsOn, EventsOff } from "../../../wailsjs/runtime/runtime";
import Modal from "react-bootstrap/Modal";
import Markdown from "../../pages/Markdown/Markdown";
import Flow from "../../pages/Flow/Flow";

function Content(props: {
  pageName: string;
  isViewComment: boolean;
  isViewEditNode: boolean;
}) {
  const { pageName, isViewComment, isViewEditNode } = props;

  const [helpShow, setHelpShow] = useState<boolean>(false);
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
        return <Markdown></Markdown>;
      default:
        return <Markdown></Markdown>;
    }
  };

  return (
    <main
      className="main h-100"
      style={
        !isViewComment && !isViewEditNode ? { width: `calc(100% - 210px)` } : {}
      }
    >
      {renderPage(pageName)}

      <Modal show={helpShow} onHide={handleHelpClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>Text</Modal.Body>
      </Modal>
    </main>
  );
}

export default Content;
