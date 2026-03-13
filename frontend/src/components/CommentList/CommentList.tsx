import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { FaRegEdit } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { SaveComments } from "../../../wailsjs/go/main/App";
import {
  useDataContext,
  CommentData,
  setCommentId,
  getCommentId,
} from "../../context";

const commentsSidebarWidth = 210;

function CommentList(props: { isViewComment: boolean }) {
  const { isViewComment } = props;
  const [addComment, setAddComment] = useState("");
  const [width, setWidth] = useState(commentsSidebarWidth);
  const navRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const { t } = useTranslation();
  const {
    nodes,
    focusContent,
    comments,
    setComments,
    focusComment,
    setFocusComment,
  } = useDataContext();

  const prevCommentsRef = useRef(comments);

  useEffect(() => {
    setCommentId(comments);
  }, [nodes]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isEqual(prevCommentsRef.current, comments)) {
        SaveComments(JSON.stringify(comments));
        prevCommentsRef.current = comments;
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [comments]);

  const addNewComment = useCallback(() => {
    if (addComment === "") {
      return;
    }
    const newComment: CommentData = {
      id: getCommentId(),
      filename: focusComment.filename,
      start: focusComment.start,
      end: focusComment.end,
      selectedText: focusComment.selectedText,
      content: addComment,
    };
    setComments((comments) => [...comments, newComment]);
    setAddComment("");
    setFocusComment(newComment);
  }, [addComment, setAddComment, setComments]);

  const onContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newContent = e.target.value;
    if (newContent === "") {
      return;
    }
    setFocusComment({ ...focusComment, content: newContent });
    setComments((comments) =>
      comments.map((c) =>
        c.id === focusComment.id ? { ...c, content: newContent } : c,
      ),
    );
  };

  const deleteComment = useCallback(
    (comment: CommentData) => {
      if (!confirm(t("Delete Comment?"))) {
        return;
      }
      setComments((comments) => {
        const next = comments.filter((c) => c.id !== comment.id);
        return next;
      });
      setFocusComment({} as CommentData);
    },
    [setComments],
  );

  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    document.body.classList.add("no-select");
    isResizing.current = true;
  };

  const stopResize = () => {
    isResizing.current = false;
    document.body.classList.remove("no-select");
  };

  const resize = (e: MouseEvent) => {
    if (!isResizing.current || !navRef.current) return;

    let newWidth = window.innerWidth - e.clientX;
    if (newWidth < commentsSidebarWidth) {
      newWidth = commentsSidebarWidth;
    }
    setWidth(newWidth);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, []);

  return (
    <aside
      className={`comments-sidebar d-flex flex-column flex-shrink-0 bg-light overflow-auto ${isViewComment ? "" : "d-none"}`}
      style={{ width: `${width}px` }}
      ref={navRef}
    >
      <div onMouseDown={startResize} className="comments-sidebar-resizer" />
      <div className="d-flex align-items-center p-2 mb-2 border-bottom">
        <span className="fw-semibold">{t("Comments")}</span>
      </div>
      {!isEmpty(focusComment) && focusComment.id === 0 ? (
        <>
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center comment-line-number">
                <span className="fw-semibold p-1">
                  {t("Line")}:
                  {focusComment.start === focusComment.end
                    ? focusComment.start
                    : `${focusComment.start}-${focusComment.end}`}
                </span>
                {!isEmpty(focusComment) && (
                  <button
                    type="button"
                    className="btn-close p-1"
                    onClick={() => setFocusComment({} as CommentData)}
                  />
                )}
              </div>

              <pre className="comment-selected">
                {focusComment.selectedText.slice(0, 50)}
              </pre>
              <textarea
                id="comment-content-area"
                className="form-control mt-2"
                rows={5}
                value={addComment}
                onChange={(e) => setAddComment(e.target.value)}
              ></textarea>
              <button
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={addNewComment}
              >
                {t("Add Comment")}
              </button>
            </div>
          </div>
          <hr />
        </>
      ) : !isEmpty(focusComment) && focusComment.id ? (
        <>
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center comment-line-number">
                <span className="fw-semibold p-1">
                  {t("Line")}:
                  {focusComment.start === focusComment.end
                    ? focusComment.start
                    : `${focusComment.start}-${focusComment.end}`}
                </span>
                {!isEmpty(focusComment) && (
                  <button
                    type="button"
                    className="btn-close p-1"
                    onClick={() => setFocusComment({} as CommentData)}
                  />
                )}
              </div>

              <pre className="comment-selected">
                {focusComment.selectedText.slice(0, 50)}
              </pre>
              <textarea
                id="comment-content-area"
                className="form-control mt-2"
                rows={5}
                value={focusComment.content}
                onChange={onContentChange}
              ></textarea>
            </div>
          </div>
          <hr />
        </>
      ) : null}
      {comments.map((c, i) => {
        if (c.filename == focusContent) {
          return (
            <div className="card mb-3" key={i}>
              <div className="card-body">
                <div className="d-flex comment-line-number">
                  <span className="fw-semibold p-1">
                    {t("Line")}:
                    {c.start === c.end ? c.start : `${c.start}-${c.end}`}
                  </span>
                  <div className="ms-auto btn-comment-line p-1">
                    <FaRegEdit
                      className="me-2"
                      onClick={() => setFocusComment(c)}
                    />
                    <FaTrashCan onClick={() => deleteComment(c)} />
                  </div>
                </div>
                <pre className="comment-selected">
                  {c.selectedText.slice(0, 50)}
                </pre>
                <p className="comment-content p-1">{c.content}</p>
              </div>
            </div>
          );
        }
      })}
    </aside>
  );
}

export default CommentList;
