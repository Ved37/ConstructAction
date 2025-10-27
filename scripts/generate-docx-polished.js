/*
 Polished Markdown to DOCX generator using the 'docx' package.
 - Title page, Table of Contents, headers/footers with page numbers
 - Styled headings and paragraphs, basic bullets, links, and inline code
 Source: docs/Project_Documentation.md
 Output: docs/Project_Documentation.docx
*/

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import process from "node:process";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  ExternalHyperlink,
  TableOfContents,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, "../docs/Project_Documentation.md");
const outputPath = path.resolve(
  __dirname,
  "../docs/Project_Documentation.docx"
);

function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let buffer = [];

  const flushParagraph = () => {
    if (buffer.length) {
      blocks.push({ type: "p", text: buffer.join(" ") });
      buffer = [];
    }
  };

  let listBuffer = [];
  const flushList = () => {
    if (listBuffer.length) {
      blocks.push({ type: "ul", items: listBuffer.slice() });
      listBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: line.replace(/^###\s+/, "") });
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") });
      continue;
    }
    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h1", text: line.replace(/^#\s+/, "") });
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(line.replace(/^-\s+/, ""));
      continue;
    }
    buffer.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

function inlineRuns(text) {
  // Parse [label](url) and `inline code`
  const parts = [];
  const re = /(\[[^\]]+\]\([^)]*\)|`[^`]+`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      parts.push(new TextRun(text.slice(last, m.index)));
    }
    const token = m[0];
    if (token.startsWith("[")) {
      const mm = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (mm) {
        parts.push(
          new ExternalHyperlink({
            children: [new TextRun({ text: mm[1], style: "Hyperlink" })],
            link: mm[2],
          })
        );
      } else {
        parts.push(new TextRun(token));
      }
    } else if (token.startsWith("`")) {
      const code = token.slice(1, -1);
      parts.push(
        new TextRun({ text: code, font: { name: "Consolas" }, color: "222222" })
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(new TextRun(text.slice(last)));
  if (!parts.length) parts.push(new TextRun(text));
  return parts;
}

function paragraphFromText(text) {
  return new Paragraph({ children: inlineRuns(text), spacing: { after: 160 } });
}

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }
  const md = fs.readFileSync(inputPath, "utf8");
  const blocks = parseMarkdown(md);

  const title =
    blocks.find((b) => b.type === "h1")?.text || "Project Documentation";

  const contentParagraphs = blocks.flatMap((b) => {
    switch (b.type) {
      case "h1":
        return [
          new Paragraph({
            text: b.text,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 160 },
          }),
        ];
      case "h2":
        return [
          new Paragraph({
            text: b.text,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          }),
        ];
      case "h3":
        return [
          new Paragraph({
            text: b.text,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 100 },
          }),
        ];
      case "ul":
        return b.items.map(
          (item) =>
            new Paragraph({
              children: inlineRuns(item),
              bullet: { level: 0 },
              spacing: { after: 60 },
            })
        );
      case "p":
      default:
        return [paragraphFromText(b.text)];
    }
  });

  const header = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: "ConstrucAction", bold: true, color: "2F5496" }),
        ],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: ["Page ", PageNumber.CURRENT] })],
      }),
    ],
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: "111111" },
          paragraph: { spacing: { line: 276 } },
        },
        heading1: {
          run: { size: 48, bold: true, color: "2F5496" },
          paragraph: { spacing: { after: 160 } },
        },
        heading2: {
          run: { size: 32, bold: true, color: "2F5496" },
          paragraph: { spacing: { after: 120 } },
        },
        heading3: {
          run: { size: 26, bold: true, color: "2F5496" },
          paragraph: { spacing: { after: 100 } },
        },
      },
    },
    sections: [
      {
        // Title page
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        headers: { default: header },
        footers: { default: footer },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "ConstrucAction",
                bold: true,
                size: 56,
                color: "2F5496",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: title, size: 40 })],
            spacing: { after: 120 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: new Date().toLocaleDateString() })],
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }),
        ],
      },
      {
        // Table of Contents
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        headers: { default: header },
        footers: { default: footer },
        children: [
          new Paragraph({
            text: "Table of Contents",
            heading: HeadingLevel.HEADING_1,
          }),
          new TableOfContents("", {
            hyperlink: true,
            headingStyleRange: { start: 1, end: 3 },
          }),
        ],
      },
      {
        // Content
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        headers: { default: header },
        footers: { default: footer },
        children: contentParagraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`DOCX written: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
