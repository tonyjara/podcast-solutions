import { trpcClient } from "@/utils/api";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Text,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { FiBell } from "react-icons/fi";

const NotificationIcon = () => {
  const router = useRouter();
  const user = useSession().data?.user;
  // const context = trpcClient.useContext();
  const backgroundColor = useColorModeValue(
    "#EDF2F7",
    "RGBA(255, 255, 255, 0.1)"
  );
  // const { data: notifications } =
  //   trpcClient.notifications.getMyNotifications.useQuery(undefined, {
  //     enabled: !!user,
  //   });
  // const { mutate } =
  //   trpcClient.notifications.markMyNotificationsSeen.useMutation({
  //     onSuccess: () => {
  //       context.notifications.invalidate();
  //     },
  //   });

  // const unseenNotifications = notifications?.some((x) => x && !x.seen);

  const handleMarkSeen = () => {
    // mutate();
  };

  return (
    <Menu>
      <MenuButton
        p={"14px"}
        borderRadius="8px"
        transition="all 0.3s"
        _focus={{ boxShadow: "none" }}
        _hover={{ backgroundColor }}
        onClick={handleMarkSeen}
      >
        {/* {unseenNotifications && (
          <div
            style={{
              position: 'absolute',
              borderRadius: '20px',
              marginTop: '10px',
              marginLeft: '10px',
              width: '10px',
              height: '10px',
              backgroundColor: 'orange',
            }}
          ></div>
        )} */}
        <FiBell fontSize={"20px"} />
      </MenuButton>

      <MenuList maxW={{ base: "250px", md: "500px" }}>
        {/* {notifications?.map((x) => (
          <MenuItem
            my={'10px'}
            onClick={() => x.url.length && router.push(x.url)}
            key={x.id}
          >
            <Flex flexDir={'column'}>
              <Text whiteSpace={'break-spaces'} fontWeight={'bold'}>
                {x.title}
              </Text>
              <Text whiteSpace={'break-spaces'}>{x.message}</Text>
              <Divider my={'10px'} />
            </Flex>
          </MenuItem>
        ))} */}
      </MenuList>
    </Menu>
  );
};

export default NotificationIcon;
