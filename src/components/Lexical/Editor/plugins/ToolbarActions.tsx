import { useEffect, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  $getRoot,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";

import { useEditorHistoryState } from "../context/EditorHistoryState";
import clsx from "clsx";
import { FaUndo, FaRedo, FaTrash } from "react-icons/fa";

export function ToolbarActions() {
  const [editor] = useLexicalComposerContext();
  const { historyState } = useEditorHistoryState();

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const { undoStack, redoStack } = historyState ?? {};
  const [hasUndo, setHasUndo] = useState(undoStack?.length !== 0);
  const [hasRedo, setHasRedo] = useState(redoStack?.length !== 0);

  const MandatoryPlugins = useMemo(() => {
    return <ClearEditorPlugin />;
  }, []);

  useEffect(
    function checkEditorEmptyState() {
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          if (children.length > 1) {
            setIsEditorEmpty(false);
            return;
          }

          if ($isParagraphNode(children[0])) {
            setIsEditorEmpty(children[0].getChildren().length === 0);
          } else {
            setIsEditorEmpty(false);
          }
        });
      });
    },
    [editor],
  );

  useEffect(
    function checkEditorHistoryActions() {
      return editor.registerUpdateListener(() => {
        setHasRedo(redoStack?.length !== 0);
        setHasUndo(undoStack?.length !== 0);
      });
    },
    [editor, undoStack, redoStack],
  );

  return (
    <>
      {MandatoryPlugins}
      <button
        disabled={!hasUndo}
        className={clsx(
          "bg-transparent px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
        )}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
      >
        <FaUndo className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        disabled={!hasRedo}
        className={clsx(
          "bg-transparent px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
        )}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
      >
        <FaRedo className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        disabled={isEditorEmpty}
        className={clsx(
          "bg-transparent px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
        )}
        onClick={() => {
          editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        }}
      >
        <FaTrash className="h-3.5 w-3.5 text-white" />
      </button>
    </>
  );
}
