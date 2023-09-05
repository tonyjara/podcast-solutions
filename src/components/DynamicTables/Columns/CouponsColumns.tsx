import { createColumnHelper } from "@tanstack/react-table";
import { Prisma } from "@prisma/client";
import NumberCell from "../DynamicCells/NumberCell";
import BooleanCell from "../DynamicCells/BooleanCell";
import DateCell from "../DynamicCells/DateCell";
import TextCell from "../DynamicCells/TextCell";

type CouponsWithSubscriptionUser = Prisma.CouponsGetPayload<{
  include: {
    subscription: {
      select: {
        user: { select: { account: { select: { email: true } } } };
      };
    };
  };
}>;

const columnHelper = createColumnHelper<CouponsWithSubscriptionUser>();

export const couponsColumns = () => [
  columnHelper.accessor("createdAt", {
    cell: (x) => <DateCell date={x.getValue()} />,
    header: "Created At",
    sortingFn: "datetime",
  }),

  columnHelper.accessor("chatInputCredits", {
    cell: (x) => <NumberCell value={x.getValue()} />,
    header: "Chat I. Credits",
    sortingFn: "text",
  }),
  columnHelper.accessor("chatOutputCredits", {
    cell: (x) => <NumberCell value={x.getValue()} />,
    header: "Chat O. Credits",
    sortingFn: "text",
  }),

  columnHelper.accessor("transcriptionMinutes", {
    cell: (x) => <NumberCell value={x.getValue()} />,
    header: "Transcription M.",
    sortingFn: "text",
  }),

  columnHelper.accessor("hasBeenClaimed", {
    cell: (x) => <BooleanCell isActive={x.getValue()} />,
    header: "Claimed",
  }),

  columnHelper.display({
    cell: (x) => {
      const userEmail = x.row.original?.subscription?.user.account.email ?? "-";
      return <TextCell text={userEmail} />;
    },
    header: "Claimed By",
    sortingFn: "text",
  }),
  columnHelper.accessor("expirationDate", {
    cell: (x) =>
      x.getValue() ? <DateCell date={x.getValue()!} /> : <TextCell text="-" />,
    header: "Expiration Date",
    sortingFn: "datetime",
  }),

  columnHelper.accessor("couponCode", {
    cell: (x) => <TextCell text={x.getValue()} />,
    header: "Coupon Code",
    sortingFn: "text",
  }),
];
