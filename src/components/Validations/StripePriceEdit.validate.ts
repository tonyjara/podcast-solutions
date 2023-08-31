import { StripePriceTag } from "@prisma/client";
import * as z from "zod";

export interface PSStripePriceEdit {
  id: string;
  nickName: string;
  active: boolean;
  sortOrder: string;
  tag: StripePriceTag;
}

export const validateStripePriceEdit: z.ZodType<PSStripePriceEdit> = z.lazy(
  () =>
    z.object({
      id: z.string().min(1),
      nickName: z.string().min(1),
      active: z.boolean(),
      sortOrder: z.string(),
      tag: z.nativeEnum(StripePriceTag),
    }),
  //TODO add super redfine when isHostedByPS is true, to check for blobName
);

export const DefaultPSStripeProductValues: PSStripePriceEdit = {
  id: "",
  nickName: "",
  active: true,
  sortOrder: "0",
  tag: "CHAT_INPUT",
};
