import wcwidth from "wcwidth";

function getDisplayWidth(str: string): number {
  return [...str].reduce((sum, ch) => sum + wcwidth(ch), 0);
}

function padToWidth(str: string, width: number): string {
  const current = getDisplayWidth(str);
  const padding = width - current;
  return str + " ".repeat(Math.max(0, padding));
}

function isTableLine(line: string): boolean {
  return line.trim().startsWith("|");
}

function isSeparatorRow(row: string[]): boolean {
  return row.every(cell => /^:?-+:?$/.test(cell));
}

function buildLeftSeparator(width: number): string {
  const dashCount = Math.max(1, width - 1);
  return ":" + "-".repeat(dashCount);
}

export function formatMarkdownTable(input: string): string {
  const lines = input.split("\n");
  const result: string[] = [];
  let buffer: string[] = [];

  function flushTable() {
    if (buffer.length === 0) return;

    let rows = buffer.map(line =>
      line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map(cell => cell.trim())
    );

    const colCount = Math.max(...rows.map(r => r.length));

    rows.forEach(r => {
      while (r.length < colCount) r.push("");
    });

    let separatorIndex = -1;

    if (rows.length >= 2 && isSeparatorRow(rows[1])) {
      separatorIndex = 1;
    } else {
      separatorIndex = 1;
      rows.splice(1, 0, Array(colCount).fill(":"));
    }

    const colWidths = Array(colCount).fill(0);

    rows.forEach((row, rowIndex) => {
      if (rowIndex === separatorIndex) return;
      row.forEach((cell, i) => {
        colWidths[i] = Math.max(colWidths[i], getDisplayWidth(cell));
      });
    });

    const separatorRow = colWidths.map(w => {
      const effectiveWidth = Math.max(w, 2);
      return buildLeftSeparator(effectiveWidth);
    });

    rows[separatorIndex] = separatorRow;

    separatorRow.forEach((cell, i) => {
      colWidths[i] = Math.max(colWidths[i], getDisplayWidth(cell));
    });

    const formatted = rows.map((row, rowIndex) => {
      if (rowIndex === separatorIndex) {
        const padded = row.map((cell, i) =>
          padToWidth(cell, colWidths[i])
        );
        return "| " + padded.join(" | ") + " |";
      }

      const padded = row.map((cell, i) =>
        padToWidth(cell, colWidths[i])
      );

      return "| " + padded.join(" | ") + " |";
    });

    result.push(...formatted);
    buffer = [];
  }

  for (const line of lines) {
    if (isTableLine(line)) {
      buffer.push(line);
    } else {
      flushTable();
      result.push(line);
    }
  }

  flushTable();
  return result.join("\n");
}
