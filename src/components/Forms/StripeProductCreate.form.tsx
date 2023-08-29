import { trpcClient } from "@/utils/api";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Button,
  Flex,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { handleUseMutationAlerts } from "../Toasts & Alerts/MyToast";
import FormControlledText from "./FormControlled/FormControlledText";
import FormControlledSelect from "./FormControlled/FormControlledSelect";
import {
  PSStripeProductCreate,
  defaultPSStripeProductCreate,
  validateStripeProductCreate,
} from "../Validations/StripeProductCreate.validate";
import { PlanType } from "@prisma/client";

const StripeProductCreateFrom = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const trpcContext = trpcClient.useContext();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PSStripeProductCreate>({
    defaultValues: defaultPSStripeProductCreate,
    resolver: zodResolver(validateStripeProductCreate),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const { mutate, isLoading } = trpcClient.stripe.createProduct.useMutation(
    handleUseMutationAlerts({
      successText: "Product created",
      callback: () => {
        trpcContext.invalidate();
        handleClose();
      },
    }),
  );
  const submitFunc = async (data: PSStripeProductCreate) => {
    mutate(data);
  };

  return (
    <Modal
      blockScrollOnMount={false}
      onClose={handleClose}
      size={"3xl"}
      isOpen={isOpen}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Stripe Price</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(submitFunc)} noValidate>
            <Flex flexDir={"column"} gap={5}>
              <FormControlledText
                control={control}
                errors={errors}
                name="prodName"
                label="Product Name"
              />
              <FormControlledText
                control={control}
                errors={errors}
                name="prodDescription"
                label="Product description"
                isTextArea
              />

              <FormControlledText
                control={control}
                errors={errors}
                name="features"
                label="Features"
                isTextArea
              />

              <FormControlledText
                control={control}
                errors={errors}
                name="payAsYouGo"
                label="Pay as you go"
                isTextArea
              />

              <FormControlledText
                control={control}
                errors={errors}
                name="unit_amount_decimal"
                label="Unit Amount Decimal"
                helperText="Enter amount normally, we will convert it to decimal for you"
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
                name="interval"
                label="Billing Interval"
                options={[
                  { value: "day", label: "Day" },
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                  { value: "year", label: "Year" },
                ]}
              />
              <FormControlledSelect
                control={control}
                errors={errors}
                name="usage_type"
                label="Usage Type"
                options={[
                  { value: "metered", label: "Metered" },
                  { value: "licensed", label: "Licensed" },
                ]}
              />

              <FormControlledSelect
                control={control}
                errors={errors}
                name="planType"
                label="Plan Type"
                options={Object.values(PlanType).map((value) => ({
                  value,
                  label: value,
                }))}
              />

              <Button
                type="submit"
                isLoading={isLoading || isSubmitting}
                size="lg"
                alignSelf={"flex-end"}
              >
                Create
              </Button>
            </Flex>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StripeProductCreateFrom;
