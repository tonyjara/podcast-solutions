import type { ReactNode } from "react";
import { useEffect } from "react";
import { useState } from "react";
import React from "react";
import { Box, useDisclosure } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import DesktopSidebar from "./Desktop/DesktopSidebar";
import MobileSidebar from "./Mobile/MobileSidebar";
import MyTopBar from "./components/MyTopBar";
import useDidMountEffect from "@/lib/hooks/useDidMountEffect";

export default function DrawerWithTopBar({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { status } = useSession();
  const authenticated = status === "authenticated";
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const isMinimized = JSON.parse(
      localStorage.getItem("sidebarToggle") ?? "false",
    );
    setMinimized(isMinimized);

    return () => {};
  }, []);

  useDidMountEffect(() => {
    localStorage.setItem("sidebarToggle", JSON.stringify(minimized));
    return () => {};
  }, [minimized]);

  return (
    <Box
      overflow={"hidden"}
      minH="100vh"
      /* bg={useColorModeValue("gray.100", "gray.900")} */
    >
      {authenticated && (
        <div>
          <DesktopSidebar minimized={minimized} setMinimized={setMinimized} />
          <MobileSidebar isOpen={isOpen} onClose={onClose} />
        </div>
      )}

      <MyTopBar authenticated={authenticated} onOpen={onOpen} />

      <Box
        //MOBILE
        display={{ base: "block", md: "none" }}
        overflow="hidden"
        transition="0.2s ease"
        pt={"75px"}
        px={"10px"}
      >
        {children}
      </Box>

      <Box
        //DESKTOP
        display={{ base: "none", md: "block" }}
        transition="0.2s ease"
        pt={"75px"}
        px={"10px"}
        ml={!authenticated ? { base: 0 } : { base: 0, md: minimized ? 20 : 60 }}
      >
        {children}
      </Box>
    </Box>
  );
}
