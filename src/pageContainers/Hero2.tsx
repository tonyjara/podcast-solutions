import {
    Text,
    Image,
    Box,
    useColorModeValue,
    Icon,
    chakra,
} from "@chakra-ui/react";
import Link from "next/link";

const HeroPage2 = () => {
    const bg = useColorModeValue("white", "gray.800");
    const mobilePic = "/assets/hero/hero-mobile2.jpeg";
    const desktopPic = "/assets/hero/hero-desktop2.jpeg";
    return (
        <Box minH={"81vh"}>
            <Box
                pos="relative"
                overflow="hidden"
                bg={bg}
                pb={{ base: 10, md: 0 }}
                my={{ base: 0, md: 10 }}
            >
                <Box maxW="7xl" mx="auto">
                    <Box
                        pos="relative"
                        pb={{
                            base: 8,
                            sm: 16,
                            md: 20,
                            lg: 28,
                            xl: 32,
                        }}
                        maxW={{
                            lg: "2xl",
                        }}
                        w={{
                            lg: "full",
                        }}
                        zIndex={1}
                        bg={bg}
                        border="solid 1px transparent"
                    >
                        <Icon
                            display={{
                                base: "none",
                                lg: "block",
                            }}
                            position="absolute"
                            right={0}
                            top={0}
                            bottom={0}
                            h="full"
                            w={48}
                            color={bg}
                            transform="translateX(50%)"
                            fill="currentColor"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polygon points="50,0 100,0 50,100 0,100" />
                        </Icon>
                        <Box
                            mx="auto"
                            maxW={{
                                base: "7xl",
                            }}
                            px={{
                                base: 4,
                                sm: 6,
                                lg: 8,
                            }}
                            mt={{
                                base: 10,
                                sm: 12,
                                md: 16,
                                lg: 20,
                                xl: 28,
                            }}
                        >
                            <Box
                                w="full"
                                textAlign={{
                                    sm: "center",
                                    lg: "left",
                                }}
                                justifyContent="center"
                                alignItems="center"
                            >
                                <chakra.h1
                                    fontSize={{
                                        base: "4xl",
                                        sm: "5xl",
                                        md: "6xl",
                                        xl: "7xl",
                                    }}
                                    letterSpacing="tight"
                                    lineHeight="short"
                                    fontWeight="extrabold"
                                    color="gray.900"
                                    _dark={{
                                        color: "white",
                                    }}
                                >
                                    <chakra.span
                                        display={{
                                            base: "block",
                                            /* xl: "inline", */
                                        }}
                                    >
                                        Podcasting{" "}
                                    </chakra.span>
                                    <chakra.span
                                        display={{
                                            base: "block",
                                            xl: "inline",
                                        }}
                                        color="brand.500"
                                        _dark={{
                                            color: "brand.400",
                                        }}
                                    >
                                        made easy
                                    </chakra.span>
                                </chakra.h1>
                                <chakra.p
                                    mt={{
                                        base: 3,
                                        sm: 5,
                                        md: 5,
                                    }}
                                    fontSize={{
                                        sm: "lg",
                                        md: "xl",
                                    }}
                                    maxW={{
                                        sm: "xl",
                                    }}
                                    mx={{
                                        sm: "auto",
                                        lg: 0,
                                    }}
                                    fontWeight="medium"
                                /* color="gray.500" */
                                >
                                    Host your podcast, manage your episodes, schedule uploads,
                                    transcribe your audio, generate AI content and more.{" "}
                                </chakra.p>
                                <Box
                                    mt={{
                                        base: 5,
                                        sm: 8,
                                    }}
                                    display={{
                                        sm: "flex",
                                    }}
                                    justifyContent={{
                                        sm: "center",
                                        lg: "start",
                                    }}
                                    fontWeight="extrabold"
                                /* fontFamily="fantasy" */
                                >
                                    <Box rounded="full" shadow="md">
                                        <chakra.a
                                            as={Link}
                                            href={"/signup"}
                                            w="full"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            border="solid 1px transparent"
                                            fontSize={{
                                                base: "md",
                                                md: "lg",
                                            }}
                                            rounded="md"
                                            color="#0f0e0d"
                                            bg="brand.500"
                                            _dark={{
                                                bg: "brand.400",
                                                color: "gray.900",
                                            }}
                                            _hover={{
                                                bg: "brand.600",
                                            }}
                                            px={{
                                                base: 8,
                                                md: 10,
                                            }}
                                            py={{
                                                base: 3,
                                                md: 4,
                                            }}
                                            cursor="pointer"
                                        >
                                            Get Started for Free
                                        </chakra.a>
                                    </Box>
                                </Box>
                                <Text
                                    mt={"10px"}
                                    textDecor={"underline"}
                                    fontWeight={"bold"}
                                    fontStyle={"italic"}
                                >
                                    No credit card required
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box
                    position={{
                        lg: "absolute",
                    }}
                    top={{
                        lg: 0,
                    }}
                    bottom={{
                        lg: 0,
                    }}
                    right={{
                        lg: 0,
                    }}
                    w={{
                        lg: "50%",
                    }}
                    border="solid 1px transparent"
                >
                    <Image
                        px={{ base: 4 }}
                        h={[56, 72, 96, "full"]}
                        w="full"
                        fit="cover"
                        src={mobilePic}
                        alt="Hero image"
                        loading="lazy"
                        hideFrom={"lg"}
                    />

                    <Image
                        px={{ base: 4 }}
                        h={[56, 72, 96, "full"]}
                        w="full"
                        fit="cover"
                        src={desktopPic}
                        alt="Hero image"
                        loading="lazy"
                        hideBelow={"lg"}
                    />
                </Box>
            </Box>
        </Box>
    );
};
export default HeroPage2;
