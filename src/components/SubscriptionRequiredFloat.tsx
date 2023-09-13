import { Text, Box, Flex, Icon, Button } from "@chakra-ui/react"
import Link from "next/link"
import React, { useState } from "react"
import { BiCrown } from "react-icons/bi"

const SubscriptionRequiredFloat = ({
    isFreeTrial,
}: {
    isFreeTrial: boolean
}) => {
    const [show, setShow] = useState(true)
    return (
        <Box
            display={isFreeTrial && show ? "block" : "none"}
            backgroundColor={"yellow.100"}
            position={"fixed"}
            p="10px"
            left={{ base: "10%", md: "20%" }}
            top={"80px"}
            zIndex={1000}
            borderRadius={"md"}
        >
            <Flex gap={"10px"} alignItems={"center"}>
                <Icon as={BiCrown} color={"black"} />
                <Text fontWeight={"xl"} color={"black"}>
                    You require a subscription to activate this website
                </Text>
            </Flex>

            <Flex mt={"10px"} gap={"10px"} alignItems={"center"}>
                <Button
                    as={Link}
                    href={"/home/plans"}
                    size="sm"
                    style={{ fontWeight: "bold" }}
                >
                    Start for free!
                </Button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        setShow(false)
                    }}
                    size={"sm"}
                    bg={"gray.400"}
                >
                    Dismiss{" "}
                </Button>
            </Flex>
        </Box>
    )
}

export default SubscriptionRequiredFloat
