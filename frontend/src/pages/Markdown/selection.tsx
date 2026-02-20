/**
 * Portions of this file are derived from:
 * https://github.com/ryo-manba/md-review
 *
 * Copyright (c) 2025 Ryo Matsukawa
 * Licensed under the MIT License.
 */
import { Components } from "react-markdown";

export const componentsWithLinePosition: Components = {
  code: ({ node, className, children, ...props }: any) => (
    <code
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </code>
  ),
  p: ({ node, className, children, ...props }: any) => (
    <p
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </p>
  ),
  h1: ({ node, className, children, ...props }: any) => (
    <h1
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, className, children, ...props }: any) => (
    <h2
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, className, children, ...props }: any) => (
    <h3
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ node, className, children, ...props }: any) => (
    <h4
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ node, className, children, ...props }: any) => (
    <h5
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ node, className, children, ...props }: any) => (
    <h6
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </h6>
  ),
  li: ({ node, className, children, ...props }: any) => (
    <li
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </li>
  ),
  blockquote: ({ node, className, children, ...props }: any) => (
    <blockquote
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </blockquote>
  ),
  pre: ({ node, className, children, ...props }: any) => (
    <pre
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </pre>
  ),
  td: ({ node, className, children, ...props }: any) => (
    <td
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </td>
  ),
  th: ({ node, className, children, ...props }: any) => (
    <th
      className={className}
      data-line-start={node?.position?.start?.line}
      {...props}
    >
      {children}
    </th>
  ),
};

export function getSelectionLineRange(
  sel: Selection,
): { startLine: number; endLine: number } | null {
  if (sel.isCollapsed) return null;

  const { anchorNode, anchorOffset, focusNode, focusOffset } = sel;
  if (!anchorNode || !focusNode) return null;

  const anchorLine = getLineAtSelectionPoint(anchorNode, anchorOffset);
  const focusLine = getLineAtSelectionPoint(focusNode, focusOffset);

  if (anchorLine == null || focusLine == null) return null;

  const startLine = Math.min(anchorLine, focusLine);
  let endLine = Math.max(anchorLine, focusLine);

  const selectedText = sel.toString();
  if (selectedText.endsWith("\n") && startLine < endLine) {
    const trimmedText = selectedText.replace(/\n+$/, "");
    const actualNewlines = (trimmedText.match(/\n/g) || []).length;
    endLine = startLine + actualNewlines;
  }

  return { startLine, endLine };
}

function getLineAtSelectionPoint(
  node: Node,
  intraOffset: number,
): number | null {
  let el: HTMLElement | null =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as HTMLElement);

  while (el && !el.hasAttribute("data-line-start")) {
    el = el.parentElement;
  }
  if (!el) return null;

  const startLine = Number(el.getAttribute("data-line-start"));
  if (!Number.isFinite(startLine)) return null;

  const text = node.nodeType === Node.TEXT_NODE ? (node as Text).data : "";
  const fragment = text.slice(0, intraOffset);
  const extraNewlines = (fragment.match(/\n/g) || []).length;

  return startLine + extraNewlines;
}
