import { CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { isValidUrl } from "./utils/url";
import { AutoLinkPlugin } from "./plugins/AutoLink";
import { EditLinkPlugin } from "./plugins/EditLink";
import { FloatingMenuPlugin } from "./plugins/FloatingMenu";
import { LocalStoragePlugin } from "./plugins/LocalStorage";
import { OpenLinkPlugin } from "./plugins/OpenLink";
import {
  EditorHistoryStateContext,
  useEditorHistoryState,
} from "./context/EditorHistoryState";
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import DebouncedHtmlPlugin from "./plugins/DebouncedLexicalHtmlPlugin";
import LexicalToolbar from "./LexicalToolbar";
import clsx from "clsx";

export const EDITOR_NAMESPACE = "lexical-editor"; //Used for local storage

const EDITOR_NODES = [
  AutoLinkNode,
  CodeNode,
  HeadingNode,
  LinkNode,
  ListNode,
  ListItemNode,
  QuoteNode,
];

interface InputProps<T extends FieldValues> {
  control: Control<T>;
  errors: any;
  name: Path<T>;
  label: string;
  isRequired?: boolean;
  helperText?: string;
  maxLength?: number;
  hidden?: boolean;
  autoFocus?: boolean;
  className?: string;
}
type LexicalConfig = Parameters<typeof LexicalComposer>["0"]["initialConfig"];

export function FormControlledLexicalRichHtml<T extends FieldValues>(
  props: InputProps<T>,
) {
  const { helperText, label, hidden, name, errors, control, isRequired } =
    props;
  const { historyState } = useEditorHistoryState();

  const config: LexicalConfig = {
    namespace: EDITOR_NAMESPACE,
    nodes: EDITOR_NODES,
    /* editorState: "", */
    theme: {
      root: "p-4 border-slate-500 border-2 rounded h-auto min-h-[200px] focus:outline-none focus-visible:border-black",
      link: "cursor-pointer",
      text: {
        bold: "font-semibold",
        underline: "underline decoration-wavy",
        italic: "italic",
        strikethrough: "line-through",
        underlineStrikethrough: "underlined-line-through",
      },
    },
    onError: (error) => {
      console.error(error);
    },
  };
  const splitName = name.split(".");
  const reduceErrors = splitName.reduce((acc: any, curr: any) => {
    if (!acc[curr]) return acc;
    if (isNaN(curr)) {
      return acc[curr];
    }
    return acc[parseInt(curr)];
  }, errors);

  return (
    <FormControl
      isRequired={isRequired}
      hidden={hidden}
      isInvalid={!!reduceErrors.message}
    >
      <FormLabel fontSize={"md"}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          /* config.content = field.value; */
          return (
            <Box
              /* id="editor-wrapper" */
              className={clsx(
                props.className,
                "prose prose-slate relative w-full bg-white prose-headings:mb-4 prose-headings:mt-2 prose-p:my-0",
              )}
            >
              <EditorHistoryStateContext>
                <LexicalComposer initialConfig={config}>
                  <LexicalToolbar />
                  {/* Official Plugins */}
                  <RichTextPlugin
                    contentEditable={<ContentEditable spellCheck={false} />}
                    placeholder={
                      <div className="absolute left-[1.125rem] top-[1.125rem] opacity-50">
                        Start writing...
                      </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <HistoryPlugin externalHistoryState={historyState} />
                  <ListPlugin />
                  <LinkPlugin validateUrl={isValidUrl} />
                  {/* Custom Plugins */}
                  <AutoLinkPlugin />
                  <EditLinkPlugin />
                  {/* <FloatingMenuPlugin /> */}
                  <LocalStoragePlugin namespace={EDITOR_NAMESPACE} />
                  <OpenLinkPlugin />
                  <DebouncedHtmlPlugin
                    onHtmlChanged={(html) => {
                      field.onChange(html);
                    }}
                    initialHtml={field.value}
                    value={field.value}
                  />
                </LexicalComposer>
              </EditorHistoryStateContext>
            </Box>
          );
        }}
      />
      {/* {error && <FormErrorMessage>{error}</FormErrorMessage>} */}
      {!reduceErrors.message ? (
        <FormHelperText color={"gray.500"}>{helperText}</FormHelperText>
      ) : (
        <FormErrorMessage>{reduceErrors.message}</FormErrorMessage>
      )}
    </FormControl>
  );
}
