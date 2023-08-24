import { useState, useEffect, useCallback, useRef } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes, EditorState } from "lexical";
import { useDebouncedCallback } from "use-debounce";

function useDebouncedLexicalOnChange<T>(
  getEditorState: (editorState: EditorState) => T,
  callback: (value: T) => void,
  delay: number,
) {
  const lastPayloadRef = useRef<T | null>(null);
  const callbackRef = useRef<(arg: T) => void | null>(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const callCallbackWithLastPayload = useCallback(() => {
    if (lastPayloadRef.current) {
      callbackRef.current?.(lastPayloadRef.current);
    }
  }, []);

  const call = useDebouncedCallback(callCallbackWithLastPayload, delay);
  const onChange = useCallback(
    (editorState: any) => {
      editorState.read(() => {
        lastPayloadRef.current = getEditorState(editorState);
        call();
      });
    },
    [call, getEditorState],
  );
  return onChange;
}

interface Props {
  value: string;
  initialHtml?: string;
  onHtmlChanged: (html: string) => void;
}

const DebouncedHtmlPlugin = ({ value, initialHtml, onHtmlChanged }: Props) => {
  const [editor] = useLexicalComposerContext();

  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (!initialHtml || !isFirstRender) return;

    setIsFirstRender(false);

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      $insertNodes(nodes);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEditorState = (editorState: EditorState) =>
    editorState.read(() => $generateHtmlFromNodes(editor));

  /* const debouncedOnChange = useCallback( */
  /*   (value: any) => { */
  /*     onHtmlChanged(value); */
  /*   }, */
  /*   [onHtmlChanged], */
  /* ); */
  /**/
  /* const onChange = useDebouncedLexicalOnChange( */
  /*   getEditorState, */
  /*   debouncedOnChange, */
  /*   1000, */
  /* ); */
  const onChange = (editorState: any) => {
    const html = editorState.read(() => {
      onHtmlChanged(getEditorState(editorState));
    });
    /* console.log(html); */

    return html;
  };

  return <OnChangePlugin onChange={onChange} />;
};

export default DebouncedHtmlPlugin;
