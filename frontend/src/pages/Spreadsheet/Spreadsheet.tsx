import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";

function Spreadsheet() {
  const settings = {
    lang: "en",
    data: [
      {
        name: "Sheet1",
      },
    ],
  };
  return (
    <>
      <Workbook {...settings}></Workbook>
    </>
  );
}

export default Spreadsheet;
