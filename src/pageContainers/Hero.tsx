import {
  Flex,
  Container,
  Heading,
  Stack,
  Text,
  Button,
} from "@chakra-ui/react";
import Art2 from "@/public/assets/hero/podcast_art_2.svg";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Hero() {
  const router = useRouter();
  const navigateToStartup = () => {
    router.push("/signup");
  };
  return (
    <Container maxW={"5xl"}>
      <Stack
        textAlign={"center"}
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}
      >
        <Heading
          fontWeight={600}
          fontSize={{ base: "3xl", sm: "4xl", md: "6xl" }}
          lineHeight={"110%"}
        >
          Podcasting{" "}
          <Text as={"span"} color={"brand.500"}>
            made easy
          </Text>
        </Heading>
        <Text color={"gray.500"} maxW={"3xl"}>
          Don&apos;t waste your time with tasks that can easily be automated,
          find editors, transcribe your podcasts, generate shownotes, one click
          uploads to podcasting platforms, scheduled uploads, just one click
          away.{" "}
        </Text>
        <Stack spacing={6} direction={"row"}>
          <Button
            rounded={"full"}
            px={6}
            colorScheme={"brand"}
            bg={"brand.400"}
            _hover={{ bg: "brand.500" }}
            onClick={navigateToStartup}
          >
            Get started
          </Button>
          <Button rounded={"full"} px={6}>
            Learn more
          </Button>
        </Stack>
        {/* <Flex w={"full"}> */}
        {/*   <Image src={Art1} priority alt="Podcast Art 1" /> */}
        {/* </Flex> */}
        <Flex w={"full"}>
          <Image src={Art2} priority alt="Podcast Art 2" />
        </Flex>
      </Stack>
    </Container>
  );
}
