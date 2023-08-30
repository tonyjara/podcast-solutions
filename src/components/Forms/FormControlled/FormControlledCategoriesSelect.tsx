import { podcastCategories } from "@/lib/Constants";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Podcast } from "@prisma/client";
import type { MultiValue } from "chakra-react-select";
import { Select } from "chakra-react-select";
import React, { CSSProperties } from "react";
import type { Control, ControllerRenderProps } from "react-hook-form";
import { Controller } from "react-hook-form";

interface InputProps {
  control: Control<Podcast>;
  errors: any;
  label: string;
  helperText?: string;
  isClearable?: boolean;
  error?: string;
  optionLabel?: string;
  optionValue?: string;
  disable?: boolean;
}

export interface GroupedOption {
  readonly label: string;
  readonly options: readonly { value: string; label: string }[];
}

const groupStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
const groupBadgeStyles: CSSProperties = {
  backgroundColor: "#EBECF0",
  borderRadius: "2em",
  color: "#172B4D",
  display: "inline-block",
  fontSize: 12,
  fontWeight: "normal",
  lineHeight: "1",
  minWidth: 1,
  padding: "0.16666666666667em 0.5em",
  textAlign: "center",
};

const formatGroupLabel = (data: GroupedOption) => (
  <div style={groupStyles}>
    <span
      style={{
        fontWeight: "bold",
        fontSize: "20px",
      }}
    >
      {data.label}
    </span>
    <span style={groupBadgeStyles}>{data.options.length}</span>
  </div>
);

const FormControlCategoriesSelect = ({
  control,
  errors,
  label,
  helperText,
  isClearable,
  error,
  disable,
}: InputProps) => {
  const handleOnChange = (
    e: MultiValue<any>,
    field: ControllerRenderProps<Podcast, "categories">,
  ) => {
    if (e.length > 2) {
      return;
    }

    field.onChange(e.map((x) => x.value));
  };
  const handleValue = (field: ControllerRenderProps<Podcast, "categories">) => {
    return field.value.map((x) => ({ value: x, label: x }));
  };

  const groupedOptions: readonly GroupedOption[] = Object.keys(
    podcastCategories,
  ).map((key) => {
    return {
      label: `${key}:`,
      //@ts-ignore
      options: podcastCategories[key].map((subCat: string) => ({
        value: subCat,
        label: subCat,
      })),
    };
  });
  return (
    <FormControl isInvalid={!!errors["categories"] || !!error}>
      <FormLabel fontSize={"md"}>{label}</FormLabel>
      <Controller
        control={control}
        name={"categories"}
        render={({ field }) => (
          <Select
            isDisabled={disable}
            instanceId={"categories"}
            options={groupedOptions as any}
            onChange={(e) => {
              handleOnChange(e, field);
            }}
            value={handleValue(field)}
            noOptionsMessage={() => "No options."}
            placeholder=""
            isClearable={isClearable}
            isMulti={true}
            classNamePrefix="myDropDown"
            formatGroupLabel={formatGroupLabel}
          />
        )}
      />
      {!errors["categories"] ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : (
        <FormErrorMessage>
          {errors["categories"].length
            ? errors["categories"].at(0)?.message
            : ""}
        </FormErrorMessage>
      )}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default FormControlCategoriesSelect;
