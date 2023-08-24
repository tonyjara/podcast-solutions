import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";
import clsx from "clsx";
import React from "react";
import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaUnderline,
} from "react-icons/fa";
import { ToolbarActions } from "./plugins/ToolbarActions";
import { Box, Icon } from "@chakra-ui/react";

const LexicalToolbar = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isStrikethrough, setIsStrikethrough] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsUnderline(selection.hasFormat("underline"));
    }
  }, [editor]);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
    );
  }, [updateToolbar, editor]);

  return (
    <Box
      gap={"2px"}
      className="min-w-52 z-20 flex h-10 bg-gray-700  px-2 py-2"
      /* className="min-w-52 fixed bottom-8 left-1/2 z-20 mb-4 flex h-10 -translate-x-1/2 transform items-center space-x-2 bg-[#1b2733] px-2 py-2 shadow" */
    >
      <button
        className={clsx(
          "px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
          isBold ? "bg-gray-500" : "bg-transparent",
        )}
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
      >
        <FaBold className="h-3.5 w-3.5 text-white" />
      </button>
      <span className="mx-2 block h-full w-[1px] bg-gray-600"></span>
      <button
        className={clsx(
          "px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
          isBold ? "bg-gray-500" : "bg-transparent",
        )}
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
      >
        <FaBold className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        className={clsx(
          "px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
          isStrikethrough ? "bg-gray-500" : "bg-transparent",
        )}
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
      >
        <FaStrikethrough className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        className={clsx(
          "px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
          isItalic ? "bg-gray-500" : "bg-transparent",
        )}
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
      >
        <FaItalic className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        className={clsx(
          "px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
          isUnderline ? "bg-gray-500" : "bg-transparent",
        )}
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
      >
        <FaUnderline className="h-3.5 w-3.5 text-white" />
      </button>

      <span className="mx-2 block h-full w-[1px] bg-gray-600"></span>

      <button
        className={clsx(
          "bg-transparent px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
        )}
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
      >
        <FaAlignLeft className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        className={clsx(
          "bg-transparent px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
        )}
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
      >
        <FaAlignCenter className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        className={clsx(
          "bg-transparent px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
        )}
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
      >
        <FaAlignRight className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        className={clsx(
          "bg-transparent px-1 transition-colors duration-100 ease-in hover:bg-gray-600",
        )}
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
      >
        <FaAlignJustify className="h-3.5 w-3.5 text-white" />
      </button>

      <span className="mx-2 block h-full w-[1px] bg-gray-600"></span>

      <ToolbarActions />
    </Box>
  );
};

export default LexicalToolbar;
