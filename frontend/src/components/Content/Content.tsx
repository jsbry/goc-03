import Main from "../../pages/Main";

function Content() {
  const renderPage = (param: string) => {
    switch (param) {
      default:
        return <Main></Main>;
    }
  };

  return <main className="main h-100">{renderPage("main")}</main>;
}

export default Content;
