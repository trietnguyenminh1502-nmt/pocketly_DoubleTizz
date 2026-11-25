const isRow = (s) => /^\s*\|.*\|\s*$/.test(s);
const isSep = (s) => /^\s*\|?[\s:|-]*-{2,}[\s:|-]*\|?\s*$/.test(s);
const cells = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

export function normalizeBotText(raw = "") {
  let text = raw
    .replace(/(\d)\uFE0F?\u20E3/gu, "$1.")
    .replace(/[\p{Extended_Pictographic}\uFE0F\u20E3]/gu, "");

  // Tách các hàng bảng bị dính trên một dòng
  text = text
    .split("\n")
    .map((line) =>
      /^\s*\|/.test(line) || /\|\s*:?-{3,}/.test(line)
        ? line.replace(/\|\s+\|(?=\s*\S)/g, "|\n|")
        : line
    )
    .join("\n");

  // Đổi mỗi khối bảng thành danh sách gạch đầu dòng
  const lines = text.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; ) {
    if (!isRow(lines[i])) { out.push(lines[i++]); continue; }
    const rows = [];
    while (i < lines.length && isRow(lines[i])) rows.push(lines[i++]);
    out.push("");
    rows.filter((r) => !isSep(r)).slice(1).forEach((r) => {
      const [name, ...rest] = cells(r);
      const detail = rest
        .map((c) => c.split(/<br\s*\/?>/i).join("; "))
        .filter(Boolean)
        .join(" · ");
      out.push(`- **${name}**: ${detail}`);
    });
    out.push("");
  }

  return out.join("\n").replace(/<br\s*\/?>/gi, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
