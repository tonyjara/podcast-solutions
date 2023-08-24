/** Sort queries the prisma way for tables */
export const handleSortEpisodes = ({
  input,
}: {
  input: {
    sorting?:
      | {
          id: string;
          desc: boolean;
        }[]
      | null
      | undefined;
    pageIndex?: number | null | undefined;
    pageSize?: number | null | undefined;
  };
}) => {
  if (input.sorting && input.sorting[0]) {
    const prop = input.sorting[0];

    //Escape hatch for complex sort columns
    if (prop.id === "no-global-sort") return { createdAt: "desc" };
    if (prop.id.includes("_")) {
      const split = prop.id.split("_");
      return {
        [split[0] as string]: {
          [split[1] as string]: prop.desc ? "desc" : "asc",
        },
      };
    }
    return { [prop.id]: prop.desc ? "desc" : "asc" };
  }
  return { releaseDate: "desc" } as any;
};
