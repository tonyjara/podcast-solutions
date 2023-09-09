import { HStack, Tooltip, Icon, useToast, Text } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import React from "react";
import { FiLink } from "react-icons/fi";
import {
  WhatsappShareButton,
  TwitterShareButton,
  FacebookShareButton,
} from "react-share";
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
interface props {
  title: string;
}

const ShareButtons = (props: props) => {
  const { title } = props;
  const pathname = usePathname();
  const toast = useToast();

  const WEBPAGE_URL = `${WEB_URL}${pathname}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(WEBPAGE_URL);
    toast({
      title: "Link copied on clipboard!",
      status: "success",
      isClosable: true,
      duration: 2000,
      position: "top",
    });
  };
  return (
    <HStack alignItems={"center"} spacing={5}>
      <Text fontSize={"xl"}>Share: </Text>
      <Tooltip hasArrow label="Share on whatsapp." bg="gray.300" color="black">
        <WhatsappShareButton url={WEBPAGE_URL} title={title} separator=":: ">
          {/* <WhatsappIcon /> */}
          <FaWhatsapp fontSize={"30px"} />
        </WhatsappShareButton>
      </Tooltip>
      <Tooltip hasArrow label="Share on twitter." bg="gray.300" color="black">
        <TwitterShareButton url={WEBPAGE_URL} title={title}>
          {/* <TwitterIcon round size={25} /> */}
          <FaTwitter fontSize={"30px"} />
        </TwitterShareButton>
      </Tooltip>
      <Tooltip hasArrow label="Share on Facebook." bg="gray.300" color="black">
        <FacebookShareButton url={WEBPAGE_URL} title={title}>
          {/* <FacebookIcon round size={25} /> */}
          <FaFacebook fontSize={"30px"} />
        </FacebookShareButton>
      </Tooltip>
      <Tooltip hasArrow label="Copy link." bg="gray.300" color="black">
        <div style={{ marginTop: "-3px" }}>
          <Icon
            onClick={handleCopyLink}
            cursor={"pointer"}
            boxSize={"20px"}
            as={FiLink}
          />
        </div>
      </Tooltip>
    </HStack>
  );
};

export default ShareButtons;
