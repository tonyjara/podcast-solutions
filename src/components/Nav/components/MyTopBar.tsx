import {
  Image,
  Flex,
  useColorModeValue,
  IconButton,
  useColorMode,
  Button,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FiMenu } from "react-icons/fi";
import NavbarProfileSection from "./NavbarProfileSection";
import Link from "next/link";

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
      position={"fixed"}
      width="100%"
      zIndex={1}
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
        {!authenticated && (
          <Image
            onClick={() => router.push("/")}
            ml={authenticated ? "80px" : undefined}
            display={{ base: authenticated ? "none" : "flex", md: "flex" }}
            src={logo}
            alt="logo"
            width={"30px"}
            height={"30px"}
            cursor="pointer"
            mr="10px"
          />
        )}
        {authenticated && (
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={onOpen}
            variant="outline"
            aria-label="open menu"
            icon={<FiMenu />}
          />
        )}
      </div>
      <Flex alignItems={"center"}>
        {!authenticated && (
          <ChakraLink href={"/signin"} as={Link}>
            Sign In
          </ChakraLink>
        )}
        <NavbarProfileSection />
      </Flex>
    </Flex>
  );
};

export default MyTopBar;
