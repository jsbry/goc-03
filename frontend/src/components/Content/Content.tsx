import Markdown from "../../pages/Markdown";
import Flow from "../../pages/Flow";

function Content(props: { pageName: string; isViewComment: boolean }) {
  const { pageName, isViewComment } = props;

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
      style={!isViewComment ? { width: `calc(100% - 210px)` } : {}}
    >
      {renderPage(pageName)}
    </main>
  );
}

export default Content;
