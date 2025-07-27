import {
  ValueFormatterParams,
  ValueGetterParams,
  ValueSetterParams,
} from "ag-grid-community";

export const gstAmountGetter = (params: ValueGetterParams) => {
  const amount = Number(params.data.amount ?? 0);
  const gstPercent = Number(params.data.gst_percent ?? 0);
  return parseFloat(((amount * gstPercent) / 100).toFixed(2));
};

export const gstPercentSetter = (params: ValueSetterParams): boolean => {
  const newValue = Number(params.newValue ?? 0);
  if (isNaN(newValue)) return false;

  if (params.data.gst_percent !== newValue) {
    params.data.gst_percent = newValue;
    return true;
  }
  return false;
};

export const gstAmountSetter = (params: ValueSetterParams): boolean => {
  const newGstAmount = Number(params.newValue ?? 0);
  const baseAmount = Number(params.data.amount ?? 0);

  if (isNaN(newGstAmount) || baseAmount === 0) return false;

  const newGstPercent = parseFloat(
    ((newGstAmount / baseAmount) * 100).toFixed(2)
  );

  if (params.data.gst_percent !== newGstPercent) {
    params.data.gst_percent = newGstPercent;
    return true;
  }

  return false;
};

export const currencyFormatter = (params: ValueFormatterParams) => {
  const value = parseFloat(params.value ?? 0);
  if (isNaN(value)) return "";
  return `₹${value.toFixed(2)}`;
};
