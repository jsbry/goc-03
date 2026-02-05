import Main from "../../pages/Main";

function Content() {
  const renderPage = (param: string) => {
    switch (param) {
      default:
        return <Main></Main>;
    }
  };

  return <main className="main">{renderPage("main")}</main>;
}

export default Content;
