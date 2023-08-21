import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Flex,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  Portal,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { signOut } from "next-auth/react";
import NotificationIcon from "./NotificationIcon";

const NavbarProfileSection = () => {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();

  const { data } = useSession();

  return (
    <Flex gap={{ base: "0", md: "1" }}>
      <IconButton
        size="lg"
        variant="ghost"
        onClick={toggleColorMode}
        aria-label="change color theme"
        icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
      />

      {/* <NotificationIcon /> */}
      <Flex pl={"10px"} alignItems={"center"}>
        <Menu>
          {data && (
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <Avatar size={"sm"} src={data?.user.image ?? undefined} />
            </MenuButton>
          )}
          <Portal>
            <MenuList>
              <MenuItem>
                {data?.user.firstName} {data?.user.lastName}{" "}
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={() => router.push("/home/settings")}>
                My Account
              </MenuItem>

              <MenuDivider />
              <MenuItem onClick={() => signOut()}>Logout</MenuItem>
            </MenuList>
          </Portal>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default NavbarProfileSection;
