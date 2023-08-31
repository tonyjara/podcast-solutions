import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";

const validateName = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 character")
    .max(100, "Name must be less than 100 characters"),
});
interface props {
  goBack: () => void;
}

const PodcastNameForm = (props: props) => {
  const trpcContext = trpcClient.useContext();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string }>({
    defaultValues: { name: "" },
    resolver: zodResolver(validateName),
  });
  const { mutate } = trpcClient.podcast.createPodcastWithName.useMutation(
    handleUseMutationAlerts({
      successText: "Podcast created",
      callback: () => {
        trpcContext.invalidate();
      },
    }),
  );
  const submitFunc = async (data: { name: string }) => {
    mutate(data);
  };

  const name = useWatch({ control, name: "name" });

  return (
    <form onSubmit={handleSubmit(submitFunc)} noValidate>
      <Flex flexDir={"column"} gap={5}>
        <Heading fontSize={"4xl"}>Welcome to Podcast Solutions</Heading>
        <Text>
          Pick a unique name that describes your podcast, you can change this
          any time.
        </Text>
        <FormControlledText
          control={control}
          errors={errors}
          name="name"
          label="Podcast Name"
          autoFocus={true}
        />
        <Text fontSize={"xl"}>
          This is how your feed URL will look like:{" "}
          <Text as={"code"}>
            https://podcastsolutions.org/rss/
            <Text as={"span"} color={"green"}>
              {slugify(name, { lower: true })}
            </Text>
          </Text>
        </Text>
        <Text color="red.300">This url cannot be changed later.</Text>

        <Flex justifyContent={"space-between"}>
          <Button
            onClick={props.goBack}
            isLoading={isSubmitting}
            size="lg"
            alignSelf={"flex-end"}
          >
            Prev
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            colorScheme="green"
            size="lg"
            alignSelf={"flex-end"}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default PodcastNameForm;
