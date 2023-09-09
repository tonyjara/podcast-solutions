import {
  Image,
  Flex,
  useColorModeValue,
  IconButton,
  useColorMode,
  HStack,
  Button,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FiMenu } from "react-icons/fi";
import NavbarProfileSection from "./NavbarProfileSection";
import Link from "next/link";
import { podcastBlogUrl } from "@/lib/Constants";

interface MobileProps {
  onOpen: () => void;
  authenticated: boolean;
}
const MyTopBar = ({ onOpen, authenticated }: MobileProps) => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const logo =
    colorMode === "light"
      ? "/assets/logo/black-logo.png"
      : "/assets/logo/white-logo.png";

  return (
    <Flex
      id="top"
      position={"fixed"}
      width="100%"
      zIndex={2}
      px={{ base: 4, md: 4 }}
      height="65px"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{
        base: "space-between",
        md: "space-between",
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <IconButton
          hideFrom={"md"}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<FiMenu />}
        />
        <Image
          onClick={() => router.push("/")}
          ml={{ base: "20px", md: "10px" }}
          src={logo}
          alt="logo"
          width={"30px"}
          height={"30px"}
          cursor="pointer"
        />
      </div>
      <Flex alignItems={"center"}>
        {!authenticated && (
          <HStack
            spacing={1}
            mr={1}
            display={{
              base: "none",
              md: "inline-flex",
            }}
          >
            {/* <Button variant="ghost">Features</Button> */}
            <Button as={Link} href={"/pricing"} variant="ghost">
              Pricing
            </Button>
            <Button
              as={Link}
              target="_blank"
              href={podcastBlogUrl}
              variant="ghost"
            >
              Blog
            </Button>
            {/* <Button variant="ghost">Company</Button> */}
            <Button as={Link} href={"/signin"} variant="ghost">
              Sign in
            </Button>
          </HStack>
        )}
        <NavbarProfileSection />
      </Flex>
    </Flex>
  );
};

export default MyTopBar;
