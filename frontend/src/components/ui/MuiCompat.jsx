import React, { forwardRef } from "react";
import {
  Button,
  Checkbox,
  InputBase,
  NativeSelect,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TextareaAutosize,
} from "@mui/material";

export {
  Button as MuiButtonMigration,
  NativeSelect as MuiNativeSelectMigration,
  Radio as MuiRadioMigration,
  Table as MuiTableMigration,
  TableBody as MuiTableBodyMigration,
  TableCell as MuiTableCellMigration,
  TableFooter as MuiTableFooterMigration,
  TableHead as MuiTableHeadMigration,
  TableRow as MuiTableRowMigration,
  TextareaAutosize as MuiTextareaAutosizeMigration,
};

const inputAttributes = new Set([
  "accept", "capture", "checked", "defaultChecked", "required", "size", "form", "formAction",
  "formEncType", "formMethod", "formNoValidate", "formTarget", "list",
  "max", "maxLength", "min", "minLength", "multiple", "pattern", "src",
  "step", "width", "height",
]);

const mergeClassNames = (...names) => names.filter(Boolean).join(" ");

export const MuiInputMigration = forwardRef(function MuiInputMigration(props, ref) {
  const { className, inputProps = {}, type = "text", ...rest } = props;
  const forwarded = {};
  const native = { ...inputProps };

  for (const [key, value] of Object.entries(rest)) {
    if (inputAttributes.has(key) || key.startsWith("aria-") || key.startsWith("data-")) native[key] = value;
    else forwarded[key] = value;
  }

  native.className = mergeClassNames(native.className, className);

  if (type === "checkbox") {
    const { checked, defaultChecked, value, ...checkboxProps } = forwarded;
    const { required, ...checkboxInputProps } = native;
    return (
      <Checkbox
        {...checkboxProps}
        className={className}
        checked={checked ?? native.checked}
        defaultChecked={defaultChecked ?? native.defaultChecked}
        value={value}
        required={required}
        inputRef={ref}
        inputProps={checkboxInputProps}
        size="small"
      />
    );
  }

  if (type === "radio") {
    const { checked, defaultChecked, value, ...radioProps } = forwarded;
    const { required, ...radioInputProps } = native;
    return (
      <Radio
        {...radioProps}
        className={className}
        checked={checked ?? native.checked}
        defaultChecked={defaultChecked ?? native.defaultChecked}
        value={value}
        required={required}
        inputRef={ref}
        inputProps={radioInputProps}
        size="small"
      />
    );
  }

  return (
    <InputBase
      {...forwarded}
      ref={undefined}
      inputRef={ref}
      className={className}
      type={type}
      inputProps={native}
    />
  );
});

export const MuiSelectMigration = forwardRef(function MuiSelectMigration(props, ref) {
  const { className, inputProps = {}, ...rest } = props;
  return (
    <NativeSelect
      {...rest}
      ref={ref}
      className={className}
      inputProps={{ ...inputProps, className: mergeClassNames(inputProps.className, className) }}
    />
  );
});
