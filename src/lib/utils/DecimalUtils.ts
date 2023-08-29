import Decimal from "decimal.js";

export const decimalDivBy100 = (str: string | null | undefined) => {
  return new Decimal(str ?? "0").div(100).toString();
};

export const decimalTimes100 = (str: string | null | undefined) => {
  return new Decimal(str ?? "0").times(100).toString();
};
