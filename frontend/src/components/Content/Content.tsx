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
        <Modal.Body>
          <h5>{t("Help.Flow")}</h5>
          <ul>
            <li>
              {t("Help.Add Node/Edit Node")}
              <ul>
                <li>{t("Help.Add Node with Label")}</li>
                <li>{t("Help.Edit Label and Image")}</li>
              </ul>
            </li>
          </ul>
          <h5>{t("Help.Markdown")}</h5>
          <ul>
            <li>
              {t("Help.Add Note")}
              <ul>
                <li>{t("Help.Add Markdown file")}</li>
              </ul>
            </li>
            <li>
              {t("Help.Add Comment/Edit Comment")}
              <ul>
                <li>{t("Help.Comment on selected text")}</li>
              </ul>
            </li>
            <li>
              Shift+Alt+F
              <ul>
                <li>{t("Help.Table Format")}</li>
              </ul>
            </li>
          </ul>
          <h5>{t("Help.Shortcut")}</h5>
          <ul>
            <li>
              Ctrl+o
              <ul>
                <li>{t("Help.Open Workspace Dialog")}</li>
              </ul>
            </li>
            <li>
              Ctrl+q
              <ul>
                <li>{t("Help.Close the application")}</li>
              </ul>
            </li>
            <li>
              Ctrl+n
              <ul>
                <li>{t("Help.Switch to Flow")}</li>
              </ul>
            </li>
            <li>
              Ctrl+m
              <ul>
                <li>{t("Help.Switch to Markdown")}</li>
              </ul>
            </li>
            <li>
              Ctrl+1
              <ul>
                <li>{t("Help.Switch to Preview Only")}</li>
              </ul>
            </li>
            <li>
              Ctrl+2
              <ul>
                <li>{t("Help.Switch to Markdown Only")}</li>
              </ul>
            </li>
            <li>
              Ctrl+3
              <ul>
                <li>{t("Help.Switch to Both")}</li>
              </ul>
            </li>
            <li>
              Ctrl+w
              <ul>
                <li>{t("Help.Show/Hide Comments")}</li>
              </ul>
            </li>
            <li>
              Ctrl+e
              <ul>
                <li>{t("Help.Show/Hide Edit Node")}</li>
              </ul>
            </li>
            <li>
              F1
              <ul>
                <li>{t("Help.Help")}</li>
              </ul>
            </li>
          </ul>
        </Modal.Body>
      </Modal>
    </main>
  );
}

export default Content;
