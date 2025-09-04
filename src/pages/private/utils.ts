import dayjs from "dayjs";
import { CustomOptionProps } from "../../styled/CustomAutoComplete";
import { Product, ProductType, DiscountType } from "../../types/common";
import { IdNamePair } from "./Stocks";

export const transformIdNamePair = (idNamePairs: IdNamePair[]) => {
  return idNamePairs.map((pair) => ({
    id: pair._id!,
    value: pair.name,
  }));
};

export const transformIdValuePair = (idValuePair: CustomOptionProps) => {
  return {
    _id: idValuePair.id,
    name: idValuePair.value,
  };
};

export const initialProductData: Product = {
  product_code: "",
  name: "",
  quantity: 0,
  purchase_date: dayjs().format("YYYY-MM-DDTHH:mm"),
  repair_count: 0,
  available_stock: 0,
  price: 0,
  unit: {
    _id: "",
    name: "",
  },
  category: {
    _id: "",
    name: "",
  },
  type: ProductType.RENTAL,
  rent_per_unit: 0,
  discount: 0,
  discount_type: DiscountType.PERCENT,
};
