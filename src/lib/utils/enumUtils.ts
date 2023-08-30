import { StripePriceTag } from "@prisma/client";

export const prettyPriceTags = (tag: StripePriceTag | string) => {
  switch (tag) {
    case "PLAN_FEE":
      return "Plan Fee";
    case "CHAT_INPUT":
      return "Chat Input";
    case "CHAT_OUTPUT":
      return "Chat Output";
    case "TRANSCRIPTION_MINUTE":
      return "Transcription Minute";
    case "STORAGE_PER_GB":
      return "Storage Per GB";
    default:
      return "Unknown";
  }
};
