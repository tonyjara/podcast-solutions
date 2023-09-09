import {
  Button,
  Drawer,
  DrawerContent,
  Image,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { useColorModeValue, Flex, CloseButton, Box } from "@chakra-ui/react";
import PodcastSelect from "@/components/Selects/PodcastSelect";
import Link from "next/link";
import { podcastBlogUrl } from "@/lib/Constants";
interface SidebarProps {
  onClose: () => void;
  isOpen: boolean;
}

const UnauthenticatedMobileSideBar = ({ onClose, isOpen }: SidebarProps) => {
  const { colorMode } = useColorMode();
  const logo =
    colorMode === "light"
      ? "/assets/logo/black-logo.png"
      : "/assets/logo/white-logo.png";
  return (
    <Drawer
      autoFocus={false}
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      returnFocusOnClose={false}
      onOverlayClick={onClose}
      size="full"
    >
      <DrawerContent>
        <Box
          zIndex={2}
          transition="0.2s ease"
          bg={useColorModeValue("white", "gray.900")}
          borderRight="1px"
          borderRightColor={useColorModeValue("gray.200", "gray.700")}
          w={"full"}
          pos="fixed"
          h="full"
          overflowY={"auto"}
          display={{ base: "block", md: "none" }}
        >
          <Flex
            h="20"
            alignItems="center"
            mx="24px"
            justifyContent="space-between"
          >
            {/* TEXT SHOWN ONLY ON DESKTOP */}
            <Link href={"/home"}>
              <Image
                boxSize={"30px"}
                objectFit="cover"
                src={logo}
                alt="Logo image"
                onClick={onClose}
              />
            </Link>

            <CloseButton onClick={onClose} />
          </Flex>
          <VStack
            top={0}
            left={0}
            right={0}
            flexDirection="column"
            p={2}
            pb={4}
            m={2}
            spacing={3}
            rounded="sm"
            shadow="sm"
          >
            <Button
              onClick={onClose}
              w="full"
              as={Link}
              href={"/"}
              variant="ghost"
            >
              Home
            </Button>
            <Button
              onClick={onClose}
              w="full"
              as={Link}
              href={"/pricing"}
              variant="ghost"
            >
              Pricing
            </Button>
            <Button
              onClick={onClose}
              as={Link}
              w="full"
              target="_blank"
              href={podcastBlogUrl}
              variant="ghost"
            >
              Blog
            </Button>
            <Button
              onClick={onClose}
              as={Link}
              w="full"
              href={"/signin"}
              variant="ghost"
            >
              Sign in
            </Button>
          </VStack>
        </Box>
      </DrawerContent>
    </Drawer>
  );
};

export default UnauthenticatedMobileSideBar;
