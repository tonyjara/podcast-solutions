import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Podcast } from "@prisma/client";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { validatePodcastEdit } from "../Validations/PodcastEdit.validate";
import { useSession } from "next-auth/react";
import FormControlledSelect from "./FormControlled/FormControlledSelect";
import { languageOptions } from "@/lib/Constants";
import FormControlledImageUpload from "./FormControlled/FormControlledImageUpload";
import FormControlledSwitch from "./FormControlled/FormControlledSwitch";
import FormControlledDatePicker from "./FormControlled/FormControlledDatePicker";
import FormControlledCategoriesSelect from "./FormControlled/FormControlledCategoriesSelect";
import FormControlledRichTextBlock from "./FormControlled/FormControlledRichTextBlock";

const PodcastEditForm = ({
  podcast,
  onClose,
}: {
  podcast: Podcast;
  onClose: () => void;
}) => {
  const trpcContext = trpcClient.useContext();
  const user = useSession().data?.user;
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Podcast>({
    defaultValues: podcast,
    resolver: zodResolver(validatePodcastEdit),
  });

  const { mutate, isLoading } = trpcClient.podcast.editPodcast.useMutation(
    handleUseMutationAlerts({
      successText: "Podcast edited",
      callback: () => {
        onClose();
        reset();
        trpcContext.invalidate();
      },
    }),
  );

  const { mutate: mutatePreferences, isLoading: isLoadingUpdate } =
    trpcClient.users.updateMyPreferences.useMutation({
      onSuccess: () => {
        trpcContext.invalidate();
      },
    });

  const { data: prefs } = trpcClient.users.getMyPreferences.useQuery();

  const submitFunc = async (data: Podcast) => {
    mutate(data);
  };

  const slug = useWatch({ control, name: "slug" });

  const handleClose = () => {
    if (!prefs?.hasSeenOnboarding) {
      mutatePreferences({
        hasSeenOnboarding: true,
        selectedPodcastId: podcast.id,
      });
    }
    onClose();
  };

  return (
    <form
      style={{ height: "100%" }}
      onSubmit={handleSubmit(submitFunc)}
      noValidate
    >
      <Flex flexDir={"column"} gap={5} py={"10px"}>
        {!podcast.active && !prefs?.hasSeenOnboarding ? (
          <Heading fontSize={"4xl"}>Tell us more about your podcast</Heading>
        ) : (
          <Heading fontSize={"4xl"}>Edit your podcast details</Heading>
        )}
        {!podcast.active && !prefs?.hasSeenOnboarding && (
          <Text color={"orange.300"}>
            If you do not wish to publish your podcast through our platform and
            you just want to use our services you can skip this step.
          </Text>
        )}

        {/* Replaced with status */}
        {/* <FormControlledSwitch */}
        {/*   control={control} */}
        {/*   errors={errors} */}
        {/*   name="active" */}
        {/*   label={podcastActive ? "Published" : "Inactive"} */}
        {/*   helperText="Flip the switch to publish/unpublish your podcast." */}
        {/* /> */}

        <FormControlledDatePicker
          control={control}
          errors={errors}
          name="publishedAt"
          maxW={"200px"}
          label="Publication date"
        />
        <Text color={"gray.500"} mt={"-20px"}>
          The date when your podcast was first published. If you select a future
          date the publication will be scheduled.
        </Text>

        {user && (
          <FormControlledImageUpload
            control={control}
            imageName={`${slug}-podcast-image`}
            errors={errors}
            name="imageUrl"
            label="Podcast Image"
            setValue={setValue}
            helperText="The image must be at least 1400 x 1400 pixels and at most 3000 x 3000 pixels, in JPEG or PNG format, and in the RGB color space with a minimum size of 500KB and a maximum size of 10MB."
            userId={user.id}
            minW={1400}
          />
        )}
        <FormControlledText
          control={control}
          errors={errors}
          name="name"
          label="Podcast Name"
        />
        <FormControlledText
          control={control}
          errors={errors}
          name="email"
          label="Email"
        />

        <FormControlledText
          control={control}
          errors={errors}
          name="author"
          label="Author"
        />
        <FormControlledCategoriesSelect
          control={control}
          errors={errors}
          label="Category"
          helperText="Select up to 2 categories"
        />

        <FormControlledSelect
          control={control}
          errors={errors}
          name="language"
          label="Language"
          options={languageOptions}
        />

        {/* <FormControlledText */}
        {/*   control={control} */}
        {/*   errors={errors} */}
        {/*   name="description" */}
        {/*   label="Description" */}
        {/*   isTextArea */}
        {/* /> */}

        <FormControlledRichTextBlock
          control={control}
          errors={errors}
          name="description"
          label={"Description"}
        />
        <FormControlledSwitch
          control={control}
          errors={errors}
          name="explicit"
          label="Does the podcast have explicit content?"
          helperText="It is required to label your podcast as explicit if it contains explicit content. However you can also edit this per-show."
        />
        <Flex justifyContent={"space-between"} width={"100%"}>
          <Button
            disabled={isSubmitting || isLoadingUpdate}
            onClick={handleClose}
            size={"lg"}
          >
            {prefs?.hasSeenOnboarding ? "Cancel" : "Skip for now"}
          </Button>
          <Button
            type="submit"
            size={"lg"}
            isLoading={isSubmitting || isLoading}
          >
            Save
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default PodcastEditForm;
