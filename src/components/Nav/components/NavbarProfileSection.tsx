import { EditIcon, EmailIcon, MoonIcon, SunIcon } from "@chakra-ui/icons"
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
} from "@chakra-ui/react"
import { RxAvatar } from "react-icons/rx"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import React from "react"
import { signOut } from "next-auth/react"
import { BiLogOutCircle } from "react-icons/bi"

const NavbarProfileSection = () => {
    const router = useRouter()
    const { colorMode, toggleColorMode } = useColorMode()

    const { data } = useSession()
    const handleSignout = () => {
        router.push("/")
        signOut()
    }

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
            {data && (
                <Flex pl={"10px"} alignItems={"center"}>
                    <Menu>
                        <MenuButton
                            py={2}
                            transition="all 0.3s"
                            _focus={{ boxShadow: "none" }}
                        >
                            <Avatar
                                size={"sm"}
                                src={data?.user.image ?? undefined}
                            />
                        </MenuButton>
                        <Portal>
                            <MenuList>
                                <MenuItem
                                    pointerEvents={"none"}
                                    icon={<RxAvatar />}
                                >
                                    {data?.user.firstName} {data?.user.lastName}{" "}
                                </MenuItem>

                                <MenuItem
                                    pointerEvents={"none"}
                                    icon={<EmailIcon />}
                                >
                                    {data?.user.email}
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem
                                    icon={<EditIcon />}
                                    onClick={() =>
                                        router.push("/home/settings")
                                    }
                                >
                                    My Profile
                                </MenuItem>

                                <MenuDivider />
                                <MenuItem
                                    icon={<BiLogOutCircle />}
                                    onClick={handleSignout}
                                >
                                    Logout
                                </MenuItem>
                            </MenuList>
                        </Portal>
                    </Menu>
                </Flex>
            )}
        </Flex>
    )
}

export default NavbarProfileSection
