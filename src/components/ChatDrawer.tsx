import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  Icon,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { SiOpenai } from "react-icons/si";
import { ChatGPT } from "./ChatGPT/ChatGPT";
import { Episode } from "@prisma/client";
import { trpcClient } from "@/utils/api";
import { handleUseMutationAlerts } from "./Toasts & Alerts/MyToast";
import { ChatGPTMessage } from "./ChatGPT/ChatLine";

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: "assistant",
    content: "Hi! I can assist you with generating the summary, and show notes",
  },
];
const ChatDrawer = ({ episode }: { episode: Episode | undefined | null }) => {
  const context = trpcClient.useContext();
  const [showButtonText, setShowButtonText] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages);
  const toolbarBg = useColorModeValue("teal.300", "gray.800");

  const { isOpen, onToggle, onClose } = useDisclosure();

  const { mutate: clearHistory } =
    trpcClient.chatGPT.clearEpisodeChat.useMutation(
      handleUseMutationAlerts({
        successText: "Chat history cleared",
        callback: () => {
          context.chatGPT.invalidate();
          setMessages(initialMessages);
        },
      }),
    );
  const handleCopyTranscription = () => {
    if (!episode?.transcription.length) return;
    setInput((x) => x + episode.transcription);
  };

  const handleClearHistory = () => {
    if (!episode) return;
    clearHistory({ episodeId: episode.id });
  };

  return (
    <div>
      <Button
        borderLeftRadius={"full"}
        borderRightRadius={"none"}
        position={"fixed"}
        right={"0"}
        bottom={"15"}
        onClick={onToggle}
        backgroundColor={"orange.400"}
        leftIcon={<SiOpenai />}
        onMouseEnter={() => setShowButtonText(true)}
        onMouseLeave={() => setShowButtonText(false)}
        _hover={{ backgroundColor: "orange.300" }}
      >
        {showButtonText && "Chat GPT"}
      </Button>
      <Drawer
        size={{ base: "full", md: "md" }}
        placement={"right"}
        onClose={onClose}
        isOpen={isOpen}
      >
        <DrawerContent>
          <DrawerHeader alignItems={"center"} borderBottomWidth="1px">
            <Icon mr={"10px"} as={SiOpenai} w={6} h={6} />
            Chat GPT
            <DrawerCloseButton />
          </DrawerHeader>

          <Box backgroundColor={toolbarBg} p="10px">
            <Button
              onClick={handleCopyTranscription}
              size={"sm"}
              alignSelf={"start"}
            >
              Paste Transcription
            </Button>
            <Button onClick={handleClearHistory} ml={"10px"} size={"sm"}>
              Clear history
            </Button>
          </Box>
          <DrawerBody p="0px">
            <ChatGPT
              input={input}
              setInput={setInput}
              episodeId={episode?.id}
              messages={messages}
              setMessages={setMessages}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>{" "}
    </div>
  );
};

export default ChatDrawer;
