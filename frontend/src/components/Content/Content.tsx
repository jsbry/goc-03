import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EventsOn, EventsOff } from "../../../wailsjs/runtime/runtime";
import Markdown from "../../pages/Markdown/Markdown";
import Flow from "../../pages/Flow/Flow";
import HelpModal from "./HelpModal";
import NotificationToast from "./NotificationToast";
import { RemoveUnusedAssets } from "../../../wailsjs/go/main/App";

function Content(props: {
  pageName: string;
  markdownView: string;
  fmWidth: number;
}) {
  const { pageName, markdownView, fmWidth } = props;
  const [helpShow, setHelpShow] = useState<boolean>(false);
  const [toastShow, setToastShow] = useState<boolean>(false);
  const [assetsRemoved, setAssetsRemoved] = useState<number>(0);
  const { t } = useTranslation();

  const handleHelpClose = () => {
    setHelpShow(false);
  };

  useEffect(() => {
    EventsOn("help", (v: boolean) => {
      setHelpShow(v);
    });
    EventsOn("deleteUnusedAssets", () => {
      if (confirm("delete unused assets?")) {
        RemoveUnusedAssets();
      }
    });
    EventsOn("assetsRemoved", (v: number) => {
      setToastShow(true);
      setAssetsRemoved(v);
    });

    return () => {
      EventsOff("help");
      EventsOff("deleteUnusedAssets");
      EventsOff("assetsRemoved");
    };
  });

  const renderPage = (param: string) => {
    switch (param) {
      case "flow":
        return <Flow></Flow>;
      case "markdown":
        return <Markdown markdownView={markdownView}></Markdown>;
      case "flow-markdown":
        let flowWidth = "50%";
        let markdownWidth = "50%";
        switch (fmWidth) {
          case 3:
            flowWidth = "30%";
            markdownWidth = "70%";
          case 4:
            flowWidth = "40%";
            markdownWidth = "60%";
            break;
          case 5:
            flowWidth = "50%";
            markdownWidth = "50%";
            break;
          case 6:
            flowWidth = "60%";
            markdownWidth = "40%";
            break;
          case 7:
            flowWidth = "70%";
            markdownWidth = "30%";
            break;
        }
        return (
          <>
            <div style={{ width: flowWidth }}>
              <Flow></Flow>
            </div>
            <div style={{ width: markdownWidth }}>
              <Markdown markdownView={markdownView}></Markdown>
            </div>
          </>
        );
      default:
        return <Markdown markdownView={markdownView}></Markdown>;
    }
  };

  return (
    <main
      className={
        "main h-100 " + (pageName === "flow-markdown" ? "main-flex" : "")
      }
    >
      {renderPage(pageName)}

      <HelpModal helpShow={helpShow} handleHelpClose={handleHelpClose} />
      <NotificationToast
        toastShow={toastShow}
        handleToastClose={() => setToastShow(false)}
        title={t("Notification")}
        body={t("Removed {{count}} unused assets.", { count: assetsRemoved })}
      />
    </main>
  );
}

export default Content;
