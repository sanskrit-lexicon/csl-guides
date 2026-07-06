// Renders a `:::table` directive containing a fenced ```rst-table block into a
// real mdast <table>, by shelling out to Pandoc (the same tool docx-to-md.md uses
// to emit these tables from Word). RST grid/simple tables express merged cells
// that GFM pipe tables cannot represent losslessly — this directive is the
// escape hatch for those, not a replacement for ordinary pipe tables.
//
// Usage in a .mdx file:
//
//   :::table
//   ```rst-table
//   +-------+-------+
//   | A     | B     |
//   +=======+=======+
//   | 1     | 2     |
//   +-------+-------+
//   ```
//   :::
//
// Requires `pandoc` on PATH at build time (see csl-guides/CLAUDE.md).
import {execFileSync} from 'node:child_process';
import {unified} from 'unified';
import rehypeParse from 'rehype-parse';
import {toMdast} from 'hast-util-to-mdast';
import {visit} from 'unist-util-visit';

export default function remarkRstTableDirective() {
  return (tree, file) => {
    visit(tree, (node, index, parent) => {
      const isTableDirective =
        (node.type === 'containerDirective' || node.type === 'leafDirective') &&
        node.name === 'table';
      if (!isTableDirective || !parent || typeof index !== 'number') {
        return;
      }

      const codeChild = node.children?.find(
        (child) => child.type === 'code' && child.lang === 'rst-table'
      );
      if (!codeChild) {
        throw new Error(
          `${file.path ?? '(unknown file)'}: ':::table' directive must contain a ` +
            "```rst-table fenced code block"
        );
      }

      let html;
      try {
        html = execFileSync('pandoc', ['--from', 'rst', '--to', 'html5'], {
          input: codeChild.value,
          encoding: 'utf-8',
        });
      } catch (err) {
        throw new Error(
          `${file.path ?? '(unknown file)'}: pandoc failed to render an RST table ` +
            `(is pandoc on PATH?): ${err.message}`
        );
      }

      const hast = unified().use(rehypeParse, {fragment: true}).parse(html);
      const mdast = toMdast(hast);
      const tableNodes = mdast.children.filter((child) => child.type === 'table');
      if (!tableNodes.length) {
        throw new Error(
          `${file.path ?? '(unknown file)'}: pandoc output for a ':::table' block ` +
            'did not contain a <table> — check the RST source is valid'
        );
      }

      parent.children.splice(index, 1, ...tableNodes);
      return index + tableNodes.length;
    });
  };
}
