import { Text, Flex, VStack, IconButton } from "@chakra-ui/react";
import React, { useRef } from "react";
import { FaSave } from "react-icons/fa";
import FormControlledText from "./FormControlled/FormControlledText";
import { trpcClient } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { handleUseMutationAlerts } from "../Toasts & Alerts/MyToast";
import Stripe from "stripe";
import FormControlledSwitch from "./FormControlled/FormControlledSwitch";
import {
  PSStripePriceEdit,
  validateStripePriceEdit,
} from "../Validations/StripePriceEdit.validate";
import { decimalDivBy100 } from "@/lib/utils/DecimalUtils";
import { StripePriceTag } from "@prisma/client";
import FormControlledSelect from "./FormControlled/FormControlledSelect";

const StripePricesEditForm = ({
  price,
  isDefault,
}: {
  price: Stripe.Price;
  isDefault: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const trpcContext = trpcClient.useContext();

  const defaultValues: PSStripePriceEdit = {
    id: price.id,
    nickName: price.nickname ?? "",
    active: price.active,
    sortOrder: price.metadata?.sortOrder ?? "0",
    tag: (price.metadata?.tag as StripePriceTag) ?? "PLAN_FEE",
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PSStripePriceEdit>({
    defaultValues,
    resolver: zodResolver(validateStripePriceEdit),
  });
  const { mutate: update, isLoading: isUpdating } =
    trpcClient.stripe.editPrice.useMutation(
      handleUseMutationAlerts({
        successText: "Price updated successfully",
        callback: () => {
          trpcContext.invalidate();
        },
      }),
    );
  const submitFunc = async (data: PSStripePriceEdit) => {
    update(data);
  };

  const handlePriceDisplay = () => {
    if (price.unit_amount) {
      return price.unit_amount / 100;
    }
    return decimalDivBy100(price.unit_amount_decimal);
  };

  return (
    <Flex
      ref={ref}
      mb="10px"
      w="100%"
      justifyContent={"space-evenly"}
      key={price.id}
    >
      <form
        style={{ width: "100%" }}
        onSubmit={handleSubmit(submitFunc)}
        noValidate
      >
        <VStack
          /* minW={{ base: "300px", md: "400px", lg: "500px" }} */
          w="100%"
          p={"10px"}
          borderRadius={"md"}
          borderWidth={"thin"}
          borderColor={"gray.500"}
          borderStyle={"solid"}
        >
          <Flex
            w="100%"
            pointerEvents={isUpdating ? "none" : undefined}
            justifyContent={"space-between"}
            alignItems={"center"}
            gap={"20px"}
          >
            <Text fontSize={"xl"} fontWeight={"bold"}>
              {handlePriceDisplay()} $
            </Text>
            {isDefault && <Text color={"orange"}>DEFAULT</Text>}
            <IconButton
              aria-label="save changes"
              size={"sm"}
              icon={<FaSave />}
              onClick={() => handleSubmit(submitFunc)()}
            />
          </Flex>
          {/* <Text py="10px">Id: {price.id}</Text> */}
          <FormControlledSwitch
            control={control}
            errors={errors}
            name="active"
            label="Active"
          />{" "}
          <FormControlledText
            control={control}
            errors={errors}
            name="nickName"
            label="NickName"
          />
          <FormControlledText
            control={control}
            errors={errors}
            name="sortOrder"
            label="Sort Order"
          />
          <FormControlledSelect
            control={control}
            errors={errors}
            name="tag"
            label="Tag"
            options={Object.values(StripePriceTag).map((tag) => ({
              value: tag,
              label: tag,
            }))}
          />
        </VStack>
      </form>
    </Flex>
  );
};

export default StripePricesEditForm;
