import { useState, useEffect, useRef, useCallback } from "react";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import {
  SaveComments,
  // RemoveComments,
} from "../../../wailsjs/go/main/App";
import { useDataContext, CommentData } from "../../context";

function CommentList(props: { isViewComment: boolean }) {
  const { isViewComment } = props;
  const [addComment, setAddComment] = useState("");

  const {
    baseURL,
    nodes,
    setNodes,
    edges,
    setEdges,
    focusNode,
    editFocusNode,
    content,
    setContent,
    focusContent,
    setFocusContent,
    notes,
    setNotes,
    focusNote,
    editFocusNote,
    comments,
    setComments,
    focusComment,
    setFocusComment,
  } = useDataContext();

  const prevCommentsRef = useRef(comments);

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
      filename: focusComment.filename,
      start: focusComment.start,
      end: focusComment.end,
      selectedText: focusComment.selectedText,
      content: addComment,
    };
    setComments((comments) => [...comments, newComment]);
    setAddComment("");
  }, [addComment, setAddComment, setComments]);

  return (
    <aside
      className={`comments-sidebar d-flex flex-column flex-shrink-0 bg-light overflow-auto ${isViewComment ? "" : "d-none"}`}
    >
      <div className="d-flex align-items-center p-2 mb-2 border-bottom">
        <span className="fw-semibold">Comments</span>
      </div>
      {!isEmpty(focusComment) ? (
        <>
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center comment-line-number">
                <span className="fw-semibold ">
                  Line:
                  {focusComment.start === focusComment.end
                    ? focusComment.start
                    : `${focusComment.start}-${focusComment.end}`}
                </span>
                {!isEmpty(focusComment) && (
                  <button
                    type="button"
                    className="btn-sm btn-close"
                    onClick={() => setFocusComment({} as CommentData)}
                  />
                )}
              </div>

              <pre className="comment-selected">
                {focusComment.selectedText.slice(0, 50)}
              </pre>
              <textarea
                id="comment-content"
                name="comment-content"
                className="form-control mt-2"
                rows={5}
                value={addComment}
                onChange={(e) => setAddComment(e.target.value)}
              ></textarea>
              <button
                className="btn btn-sm btn-primary mt-2"
                onClick={addNewComment}
              >
                Add Comment
              </button>
            </div>
          </div>
          <hr />
        </>
      ) : null}
      {comments.map((c, index) => (
        <div className="card mb-3" key={index}>
          <div className="card-body">
            <span className="comment-line-number">
              Line:
              {c.start === c.end ? c.start : `${c.start}-${c.end}`}
            </span>
            <pre className="comment-selected">
              {c.selectedText.slice(0, 50)}
            </pre>
            <span className="comment-content">{c.content}</span>
          </div>
        </div>
      ))}
    </aside>
  );
}

export default CommentList;
