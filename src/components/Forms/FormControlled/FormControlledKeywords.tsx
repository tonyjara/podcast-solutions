import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Episode } from "@prisma/client";
import { Select } from "chakra-react-select";
import React, { CSSProperties, useRef, useState } from "react";
import type { Control, ControllerRenderProps } from "react-hook-form";
import { Controller } from "react-hook-form";
import toast from "react-hot-toast";

interface InputProps {
  control: Control<Episode>;
  errors: any;
  label?: string;
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

const FormControlledKeywords = ({
  control,
  errors,
  label,
  helperText,
  isClearable,
  error,
  disable,
}: InputProps) => {
  const [inputValue, setInputValue] = useState("");
  const handleValue = (field: ControllerRenderProps<Episode, "keywords">) => {
    return field.value.length
      ? field.value?.split(",").map((x) => ({ value: x, label: x }))
      : undefined;
  };

  const ref = useRef(null);
  return (
    <FormControl isInvalid={!!errors["keywords"] || !!error}>
      <FormLabel fontSize={"md"}>{label}</FormLabel>
      <Controller
        control={control}
        name={"keywords"}
        render={({ field }) => {
          return (
            <Select
              ref={ref}
              isDisabled={disable}
              instanceId={"categories"}
              options={
                field.value?.length
                  ? field.value.split(",").map((x) => ({ value: x, label: x }))
                  : []
              }
              onChange={(e) => {
                if (!e.length) return field.onChange("");
                return field.onChange(e.map((x) => x.value).join(","));
              }}
              value={handleValue(field)}
              noOptionsMessage={() => "No options."}
              placeholder=""
              isClearable={isClearable}
              isMulti={true}
              classNamePrefix="myDropDown"
              inputValue={inputValue}
              onInputChange={(e) => {
                return setInputValue(e);
              }}
              menuIsOpen={false}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  if (field.value.includes(e.target.value)) return;
                  const keywordsLength = field.value.split(",").length;
                  if (keywordsLength >= 12) {
                    return toast.error("You can only add 12 keywords");
                  }

                  if (field.value?.length) {
                    setInputValue("");
                    return field.onChange(`${field.value},${e.target.value}`);
                  }
                  setInputValue("");
                  return field.onChange(e.target.value);
                }
              }}
              formatGroupLabel={formatGroupLabel}
            />
          );
        }}
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

export default FormControlledKeywords;
