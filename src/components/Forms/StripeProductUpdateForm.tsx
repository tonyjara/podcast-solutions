import { trpcClient } from "@/utils/api";
import {
  Button,
  Flex,
  IconButton,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";
import { FaSave } from "react-icons/fa";
import PricingCard from "../Cards/PricingCard";
import { handleUseMutationAlerts } from "../Toasts & Alerts/MyToast";
import Stripe from "stripe";
import FormControlledText from "./FormControlled/FormControlledText";
import {
  PSStripeProductUpdate,
  validatePSStripeProductUpdate,
} from "../Validations/StripeProductUpdate.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import CollapsableContainer from "../CollapsableContainer";
import StripePricesEditForm from "./StripePricesEdit.form";
import FormControlledSwitch from "./FormControlled/FormControlledSwitch";
import { BiPlus } from "react-icons/bi";
import StripePriceCreateForm from "./StripePriceCreate.form";
import { PlanType } from "@prisma/client";
import FormControlledSelect from "./FormControlled/FormControlledSelect";

const StripeProductUpdateForm = ({
  prices,
  product,
}: {
  product: Stripe.Product;
  prices: Stripe.Price[];
}) => {
  const trpcContext = trpcClient.useContext();
  const { onOpen, isOpen, onClose } = useDisclosure();

  const defaultValues: PSStripeProductUpdate = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product?.description ?? "",
    features: product.metadata.features ?? "",
    payAsYouGo: product.metadata.payAsYouGo ?? "",
    sortOrder: product.metadata.sortOrder ?? "",
    planType: (product.metadata.planType as PlanType) ?? "",
  };

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PSStripeProductUpdate>({
    defaultValues,
    resolver: zodResolver(validatePSStripeProductUpdate),
  });
  const { mutate: update, isLoading: isUpdating } =
    trpcClient.stripe.editProduct.useMutation(
      handleUseMutationAlerts({
        successText: "Product updated successfully",
        callback: () => {
          trpcContext.invalidate();
        },
      }),
    );
  const submitFunc = async (data: PSStripeProductUpdate) => {
    update(data);
  };

  const features = product.metadata?.features;
  const payAsYouGo = product.metadata?.payAsYouGo;
  return (
    <Flex
      flexDir={{ base: "column", md: "row" }}
      w="100%"
      justifyContent={"space-around"}
      key={product.id}
    >
      <Flex w="full" flexDir={"column"} maxW={"500px"}>
        <form
          style={{ width: "100%" }}
          onSubmit={handleSubmit(submitFunc)}
          noValidate
        >
          <CollapsableContainer
            startCollapsed
            title={`Product N. ${product.metadata?.sortOrder ?? "-"}`}
          >
            <VStack w="100%">
              <Flex
                w="100%"
                pointerEvents={isUpdating ? "none" : undefined}
                justifyContent={"end"}
                gap={"20px"}
              >
                <IconButton
                  isDisabled={isSubmitting}
                  aria-label="save changes"
                  icon={<FaSave />}
                  type="submit"
                />

                {/* STRIPE PRODUCTS CANNOT BE DELETED */}
                {/* <AreYouSureButton */}
                {/*     modalContent="This action cannot be undone" */}
                {/*     confirmAction={() => deleteProduct({ id: product.id })} */}
                {/*     customButton={ */}
                {/*         <IconButton */}
                {/*             aria-label="delete product" */}
                {/*             icon={<FaTrash />} */}
                {/*         /> */}
                {/*     } */}
                {/* /> */}
              </Flex>
              <Flex gap={"10px"} py="10px">
                <Text>Id: {product.id}</Text>
                <Text>
                  Default price Id: {product?.default_price?.toString() ?? ""}
                </Text>
              </Flex>
              <FormControlledSwitch
                control={control}
                errors={errors}
                name="active"
                label="Active"
              />

              <FormControlledText
                control={control}
                errors={errors}
                name="name"
                label="Name"
              />
              <FormControlledText
                control={control}
                errors={errors}
                isTextArea
                name="description"
                label="Description"
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
                helperText="Used to supplement prices non default prices"
                isTextArea
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
              <FormControlledText
                control={control}
                errors={errors}
                name="sortOrder"
                label="Sort order"
              />
            </VStack>
          </CollapsableContainer>
        </form>
        <CollapsableContainer
          titleComponents={
            <Button onClick={onOpen} leftIcon={<BiPlus />}>
              Add
            </Button>
          }
          startCollapsed
          title="Prices"
        >
          {prices
            .sort(
              (a, b) =>
                parseInt(a.metadata?.sortOrder ?? "0") -
                parseInt(b.metadata?.sortOrder ?? "0"),
            )
            .map((price) => {
              return (
                <StripePricesEditForm
                  key={price.id}
                  price={price}
                  isDefault={price.id === product.default_price}
                />
              );
            })}
        </CollapsableContainer>
      </Flex>
      <PricingCard
        /* popular={i === 1} */
        autenticated={true}
        payAsYouGo={payAsYouGo ? payAsYouGo.split(",") : []}
        handleCheckout={() => {
          if (!product.default_price || !product.id) return;
          /* return handleCheckout(product.id, product.default_price); */
        }}
        description={product.description ?? ""}
        /* autenticated={authenticated} */
        defaultPriceId={product.default_price?.toString() ?? ""}
        prices={prices}
        title={product.name}
        features={features ? features.split(",") : []}
      />
      <StripePriceCreateForm
        product={product}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Flex>
  );
};

export default StripeProductUpdateForm;
