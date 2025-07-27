import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import {
  BillingMode,
  DepositType,
  PaymentStatus,
  ProductDetails,
  RentalOrderInfo,
} from "../types/order";
import dayjs from "dayjs";
import { ProductType } from "../types/common";
import {
  calculateDiscountAmount,
  calculateProductRent,
} from "../services/utility_functions";

function numberToWordsIndian(num: number) {
  if (typeof num !== "number" || isNaN(num)) return "Invalid number";

  const singleDigits = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];

  const doubleDigits = [
    "",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tensMultiple = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  // Helper to convert 2-digit numbers
  function getTwoDigitWords(n: number) {
    if (n < 10) return singleDigits[n];
    if (n < 20) return doubleDigits[n - 9];
    return (
      tensMultiple[Math.floor(n / 10)] +
      (n % 10 !== 0 ? " " + singleDigits[n % 10] : "")
    );
  }

  // Convert to words
  function convertToWords(n: number) {
    if (n === 0) return "Zero";

    const parts = [];

    parts.push(n % 100); // last 2 digits (units)
    n = Math.floor(n / 100);

    parts.push(n % 10); // hundreds
    n = Math.floor(n / 10);

    for (let i = 0; i < 3 && n > 0; i++) {
      parts.push(n % 100); // thousands, lakhs, crores
      n = Math.floor(n / 100);
    }

    let finalWords = "";

    const unitNames = ["", "Thousand", "Lakh", "Crore"];
    const pos = parts.length - 1;

    for (let i = pos; i >= 0; i--) {
      const val = parts[i];
      if (val === 0) continue;

      if (i === 1) {
        finalWords += singleDigits[val] + " Hundred ";
      } else if (i === 0) {
        finalWords += (finalWords ? "and " : "") + getTwoDigitWords(val) + " ";
      } else {
        finalWords += getTwoDigitWords(val) + " " + unitNames[i - 1] + " ";
      }
    }

    return finalWords.trim() + " Rupees Only /-";
  }

  return convertToWords(Math.floor(num));
}

interface InvoiceRentalOrder {
  data: RentalOrderInfo;
}

const Invoice = ({ data }: InvoiceRentalOrder) => {
  const calculateRentAfterGST = (rent: number, gst: number) => {
    if (data.billing_mode === BillingMode.RETAIL) {
      console.log(gst);
      const exclusiveAmount = rent / (1 + gst / 100);
      return Math.round(exclusiveAmount * 100) / 100;
    } else {
      return rent;
    }
  };

  const updatedProducts =
    data.billing_mode === BillingMode.RETAIL && data.product_details
      ? data.product_details.map((product: ProductDetails) => ({
          ...product,
          rent_per_unit: calculateRentAfterGST(product.rent_per_unit, data.gst),
        }))
      : data.product_details;

  const calcTotal = () => {
    const finalAmount = calcFinalAmount();
    const roundOff = data.round_off || 0;
    const discountAmount = data.discount_amount || 0;
    const gstAmount = calculateDiscountAmount(
      data.gst || 0,
      finalAmount - discountAmount
    );
    return parseFloat(
      (finalAmount - discountAmount + gstAmount + roundOff).toFixed(2)
    );
  };

  const depositTotal = () => {
    return parseFloat(
      data.deposits
        .reduce(
          (total: number, deposit: DepositType) => total + deposit.amount,
          0
        )
        .toFixed(2)
    );
  };

  const calcFinalAmount = () => {
    if (data.type === ProductType.RENTAL && updatedProducts.length > 0) {
      const total = updatedProducts.reduce((sum, prod) => {
        return sum + calculateProductRent(prod);
      }, 0);

      return parseFloat(total.toFixed(2));
    }
    return 0;
  };

  const gstAmount = (
    (calcFinalAmount() - data.discount_amount) *
    data.gst *
    0.01
  ).toFixed(2);

  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "white",
      fontSize: 10,
      padding: 10,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    image: {
      width: 120,
      height: 90,
      marginRight: 10,
    },
    ownerDetails: {
      flexDirection: "column",
      flexGrow: 1,
      width: 100,
    },
    title: {
      fontSize: 12,
      fontWeight: "bold",
      marginBottom: 4,
    },
    ownerAddress: {
      marginBottom: 2,
    },
    totalAmount: {
      height: "100%",
      flexDirection: "column",
      justifyContent: "flex-end",
    },
    invoiceDetails: {
      borderRadius: "5px",
      backgroundColor: "#f4f4f4",
      padding: 5,
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      overflow: "hidden",
    },
    detailContainer: {
      width: 300,
      padding: 10,
    },
    tableField: {
      flexDirection: "column",
      marginBottom: "8px",
    },
    fieldTitle: {
      fontWeight: "bold",
      color: "#4f4f4f",
      marginBottom: "3px",
    },
    fieldValue: {
      color: "black",
      fontSize: "12px",
      marginBottom: "3px",
    },
    OrderSummaryContainer: {
      padding: 10,
      flexDirection: "column",
      gap: 5,
    },
    orderWrapper: {
      flexDirection: "column",
      gap: 5,
    },
    tableContainer: {
      flexDirection: "column",
      gap: 0,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#f4f4f4",
      padding: 5,
    },
    tableRow: {
      flexDirection: "row",
      height: 30,
      padding: 5,
      borderBottom: "1px solid #f4f4f4",
    },
    tableColumn: {
      fontSize: 10,
      color: "#4f4f4f",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    productColumn: {
      fontSize: 10,
      color: "black",
      display: "flex",
      justifyContent: "center",
      textAlign: "center",
      alignItems: "center",
    },
    calculationWrapper: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    calculationContainer: {
      flexDirection: "column",
      gap: 3,
    },
    section: {
      flexDirection: "column",
      gap: 6,
      width: 200,
      fontSize: 10,
    },
    gridRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    labelColumn: {
      flexDirection: "column",
      gap: 4,
      color: "#6B7280",
    },
    valueColumn: {
      flexDirection: "column",
      gap: 4,
      color: "#6B7280",
      alignItems: "flex-end",
      textAlign: "right",
    },
    inputSim: {
      minWidth: 50,
      backgroundColor: "#E5E7EB",
      paddingHorizontal: 4,
      borderBottom: "1 solid #000",
      textAlign: "right",
    },
    divider: {
      borderTop: "1 solid #E5E7EB",
      marginVertical: 2,
    },
    smallNote: {
      fontSize: 8,
      textAlign: "right",
      color: "#6B7280",
    },
    balanceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    boldText: {
      fontWeight: "bold",
      color: "#000",
    },
    selectSim: {
      fontSize: 10,
      padding: 2,
    },
    footerRow: {
      marginTop: 10,
      flexDirection: "row",
      width: "100%",
    },
    signatureContainer: {
      width: 150,
      flexDirection: "column",
      gap: 3,
    },
    signatureHeader: {
      flexDirection: "row",
      gap: 5,
      color: "#4f4f4f",
    },
    signImage: {
      width: 150,
      height: 80,
    },
    signatureFooter: {
      width: 150,
      textAlign: "center",
    },
    amountTextContainer: {
      width: 440,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    thankYouText: {
      fontSize: 10,
      fontWeight: "bold",
      textAlign: "center",
    },
    footerNoteText: {
      fontSize: 8,
      textAlign: "center",
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <Image src="/named-logo.png" style={styles.image} />
          <View style={styles.ownerDetails}>
            <Text style={styles.title}>MANI POWER TOOLS</Text>
            <Text style={styles.ownerAddress}>
              No. 1/290, Angalamman Koil Street, Padur,
            </Text>
            <Text style={styles.ownerAddress}>
              Chengalpattu, Chennai - 603103, Tamil Nadu
            </Text>
            <Text style={styles.ownerAddress}>
              Mobile No - 8428429153 , 9042439153
            </Text>
            <Text style={[styles.ownerAddress, { fontWeight: "bold" }]}>
              manipowertools9153@gmail.com
            </Text>
            <Text style={[styles.ownerAddress, { fontWeight: "bold" }]}>
              GST No - 33FGDPP7447A1ZI
            </Text>
          </View>
          <View style={styles.totalAmount}>
            <Text style={{ color: "#4f4f4f" }}>
              Total Amount (
              {Math.abs(calcTotal()) -
                data.deposits.reduce(
                  (total, deposit) => total + deposit.amount,
                  0
                ) <
              0
                ? "CR"
                : "DR"}
              )
            </Text>
            <Text
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                marginTop: "3px",
              }}
            >
              Rs.{" "}
              {(
                Math.abs(
                  calcTotal() -
                    data.deposits.reduce(
                      (total, deposit) => total + deposit.amount,
                      0
                    )
                ) || 0
              ).toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.invoiceDetails}>
          <View style={styles.detailContainer}>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Invoice No:</Text>
              <Text style={styles.fieldValue}>{data.order_id}</Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Bill Date:</Text>
              <Text style={styles.fieldValue}>
                {dayjs(data.in_date).format("DD-MM-YYYY")}
              </Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Ref PO No && PO Date:</Text>
              <Text style={styles.fieldValue}>-</Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Billing Address:</Text>
              <Text style={styles.fieldValue}>{data.customer.name}</Text>
              <Text style={styles.fieldValue}>{data.customer.address}</Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: "10px",
                    color: "#4f4f4f",
                  }}
                >
                  Pincode -{" "}
                </Text>
                {data.customer.pincode}
              </Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: "10px",
                    color: "#4f4f4f",
                  }}
                >
                  Mobile -{" "}
                </Text>
                {data.customer.personal_number}
              </Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: "10px",
                    color: "#4f4f4f",
                  }}
                >
                  GSTIN -{" "}
                </Text>
                {data.customer.gstin}
              </Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Ref DC No:</Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: "10px",
                    color: "#4f4f4f",
                  }}
                >
                  Outward:{" "}
                </Text>
                -
              </Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: "10px",
                    color: "#4f4f4f",
                  }}
                >
                  Inward:{" "}
                </Text>
                -
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.detailContainer,
              { justifyContent: "space-between" },
            ]}
          >
            <View>
              <View style={styles.tableField}>
                <Text style={styles.fieldTitle}>Event/Supply Start Date:</Text>
                <Text style={styles.fieldValue}>
                  {dayjs(data.out_date).format("DD-MM-YYYY HH:mm:ss")}
                </Text>
              </View>
              <View style={styles.tableField}>
                <Text style={styles.fieldTitle}>Event/Supply End Date:</Text>
                <Text style={styles.fieldValue}>
                  {dayjs(data.in_date).format("DD-MM-YYYY HH:mm:ss")}
                </Text>
              </View>
              <View style={styles.tableField}>
                <Text style={styles.fieldTitle}>Event Address:</Text>
                <Text style={styles.fieldValue}>{data.event_address}</Text>
              </View>
              {/* <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: "10px",
                    color: "#4f4f4f",
                  }}
                >
                  Pincode -{" "}
                </Text>
                {data.event_pincode}
              </Text> */}
            </View>

            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Ref E-way Bill No:</Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: "10px",
                    color: "#4f4f4f",
                  }}
                >
                  Outward:{" "}
                </Text>
                -
              </Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: "10px",
                    color: "#4f4f4f",
                  }}
                >
                  Inward:{" "}
                </Text>
                -
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.OrderSummaryContainer}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Order Summary
          </Text>
          <View style={styles.orderWrapper}>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableColumn, { width: 30 }]}>NO</Text>
                <Text
                  style={[
                    styles.tableColumn,
                    {
                      width: 300,
                      textAlign: "left",
                    },
                  ]}
                >
                  ARTICLE
                </Text>
                <Text style={[styles.tableColumn, { width: 70 }]}>
                  QUANTITY
                </Text>
                <Text style={[styles.tableColumn, { width: 80 }]}>
                  UNIT PRICE
                </Text>
                <Text style={[styles.tableColumn, { width: 80 }]}>
                  FINAL AMOUNT
                </Text>
              </View>
              {updatedProducts.map((product: ProductDetails, index: number) => (
                <View key={product._id} style={styles.tableRow}>
                  <Text style={[styles.productColumn, { width: 30 }]}>
                    {index + 1}
                  </Text>
                  <View>
                    <Text
                      style={[
                        styles.productColumn,
                        {
                          width: 300,
                          paddingBottom: 5,
                          textAlign: "left",
                        },
                      ]}
                    >
                      {product.name}
                    </Text>
                    <Text
                      style={[
                        styles.productColumn,
                        {
                          width: 300,
                          textAlign: "left",
                          color: "#4f4f4f",
                        },
                      ]}
                    >
                      {product.category}
                    </Text>
                  </View>
                  <Text style={[styles.productColumn, { width: 70 }]}>
                    {product.order_quantity} Unit(s)
                  </Text>
                  <Text style={[styles.productColumn, { width: 80 }]}>
                    Rs. {product.rent_per_unit}
                  </Text>
                  <Text style={[styles.productColumn, { width: 80 }]}>
                    Rs. {parseFloat(calculateProductRent(product).toFixed(2))}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.calculationWrapper}>
              <View style={styles.calculationContainer}>
                <View style={styles.section}>
                  {/* Grid Columns */}
                  <View style={styles.gridRow}>
                    {/* Left Column Labels */}
                    <View style={styles.labelColumn}>
                      <Text>Total Amount</Text>
                      <Text>Discount</Text>
                      <Text>Discount Amount</Text>
                      <Text>GST</Text>
                      <Text>Round Off</Text>
                      <Text style={styles.boldText}>Net Total</Text>
                      <Text style={styles.boldText}>Caution Deposit</Text>
                    </View>

                    {/* Right Column Values */}
                    <View style={styles.valueColumn}>
                      <Text>Rs. {calcFinalAmount().toFixed(2)}</Text>
                      <Text>{data.discount?.toFixed(2)}%</Text>
                      <Text>Rs. {data.discount_amount?.toFixed(2)}</Text>
                      <Text>Rs. {gstAmount}</Text>
                      <Text>Rs. {data.round_off?.toFixed(2)}</Text>
                      <Text style={styles.boldText}>
                        Rs. {Math.abs(calcTotal()).toFixed(2)}
                      </Text>
                      <Text style={[styles.boldText, { color: "red" }]}>
                        Rs. {depositTotal().toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Final total and mode */}
                  <View style={styles.balanceRow}>
                    <View style={{ flexDirection: "column", gap: 4 }}>
                      {/* <Text>Outstanding Amount</Text> */}
                      <Text>
                        {calcTotal() -
                          data.deposits.reduce(
                            (total, deposit) => total + deposit.amount,
                            0
                          ) <
                        0
                          ? "Outstanding (Refund)"
                          : "Outstanding (Balance)"}
                      </Text>
                      <Text>Mode</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "column",
                        gap: 4,
                        alignItems: "flex-end",
                      }}
                    >
                      <Text style={[styles.boldText, { color: "red" }]}>
                        Rs.{" "}
                        {(data.status === PaymentStatus.PAID
                          ? 0
                          : Math.abs(
                              calcTotal() -
                                data.deposits.reduce(
                                  (total, deposit) => total + deposit.amount,
                                  0
                                )
                            )
                        ).toFixed(2)}
                      </Text>
                      {/* <Text> </Text> */}
                      <Text style={styles.selectSim}>
                        {data.payment_mode.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View wrap={false} break>
              <View style={styles.footerRow}>
                <View style={styles.amountTextContainer}>
                  <Text style={{ fontSize: 12, marginBottom: 2 }}>
                    Amount in words:
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: "bold" }}>
                    {numberToWordsIndian(
                      Math.abs(
                        calcTotal() -
                          data.deposits.reduce(
                            (total, deposit) => total + deposit.amount,
                            0
                          )
                      ) || 0
                    )}
                  </Text>
                </View>
                <View style={styles.signatureContainer}>
                  <View style={styles.signatureHeader}>
                    <Text style={{ fontSize: 12 }}>For</Text>
                    <Text
                      style={{
                        color: "black",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    >
                      MANI POWER TOOLS
                    </Text>
                  </View>
                  <Image src="/sign.png" style={styles.signImage} />
                  <Text style={styles.signatureFooter}>
                    Authorized Signatory
                  </Text>
                </View>
              </View>

              <View
                style={{ width: "100%", flexDirection: "column", marginTop: 5 }}
              >
                <Text style={styles.thankYouText}>
                  Thanks for choosing us - We look forward to serve you again
                </Text>
                <Text style={styles.footerNoteText}>
                  This is computer generated invoice
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Invoice;
