import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { calculateDiscountAmount, calculateProductRent } from '../services/utility_functions';
import { DiscountType, ProductType } from '../types/common';
import {
  BillingMode,
  DepositType,
  PaymentStatus,
  ProductDetails,
  RentalOrderInfo,
} from '../types/order';
import paidStamp from '/paid-icon.png';

import Logo from '/nameless-logo.jpg';

Font.register({
  family: 'Inter',
  src: '/Inter_18pt-Regular.ttf',
  fontWeight: 'normal',
});
Font.register({
  family: 'Inter',
  src: '/Inter_18pt-Bold.ttf',
  fontWeight: 'bold',
});

function numberToWordsIndian(num: number) {
  if (typeof num !== 'number' || isNaN(num)) return 'Invalid number';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

  const doubleDigits = [
    '',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tensMultiple = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  // Helper to convert 2-digit numbers
  function getTwoDigitWords(n: number) {
    if (n < 10) return singleDigits[n];
    if (n < 20) return doubleDigits[n - 9];
    return tensMultiple[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + singleDigits[n % 10] : '');
  }

  // Convert to words
  function convertToWords(n: number) {
    if (n === 0) return 'Zero';

    const parts = [];

    parts.push(n % 100); // last 2 digits (units)
    n = Math.floor(n / 100);

    parts.push(n % 10); // hundreds
    n = Math.floor(n / 10);

    for (let i = 0; i < 3 && n > 0; i++) {
      parts.push(n % 100); // thousands, lakhs, crores
      n = Math.floor(n / 100);
    }

    let finalWords = '';

    const unitNames = ['', 'Thousand', 'Lakh', 'Crore'];
    const pos = parts.length - 1;

    for (let i = pos; i >= 0; i--) {
      const val = parts[i];
      if (val === 0) continue;

      if (i === 1) {
        finalWords += singleDigits[val] + ' Hundred ';
      } else if (i === 0) {
        finalWords += (finalWords ? 'and ' : '') + getTwoDigitWords(val) + ' ';
      } else {
        finalWords += getTwoDigitWords(val) + ' ' + unitNames[i - 1] + ' ';
      }
    }

    return finalWords.trim() + ' Rupees Only /-';
  }

  return convertToWords(Math.floor(num));
}

interface InvoiceRentalOrder {
  data: RentalOrderInfo;
  invoiceId: string;
  fileName?: string;
}

const Invoice = ({ data, invoiceId }: InvoiceRentalOrder) => {
  // const deposits = data.deposits;
  // const sameKindOfDeposit =
  //   deposits.length === 0 ||
  //   (deposits.length > 0 && deposits.every((d) => d.mode === deposits[0].mode));
  console.log(invoiceId);
  const calculateRentAfterGST = (rent: number, gst: number) => {
    if (data.billing_mode === BillingMode.B2C) {
      const exclusiveAmount = rent / (1 + gst / 100);
      return Math.round(exclusiveAmount * 100) / 100;
    } else {
      return rent;
    }
  };

  const updatedProducts =
    data.billing_mode === BillingMode.B2C && data.product_details
      ? data.product_details.map((product: ProductDetails) => ({
          ...product,
          rent_per_unit: calculateRentAfterGST(product.rent_per_unit, data.gst),
        }))
      : data.product_details;

  const calcFinalAmount = () => {
    if (data.type === ProductType.RENTAL && updatedProducts.length > 0) {
      const total = updatedProducts.reduce((sum, prod) => {
        return sum + calculateProductRent(prod);
      }, 0);

      return parseFloat(total.toFixed(2));
    }
    return 0;
  };

  const discountAmount =
    data.discount_type === DiscountType.PERCENT
      ? calculateDiscountAmount(data.discount, calcFinalAmount())
      : data.discount || 0;

  const calcTotal = () => {
    const finalAmount = calcFinalAmount();
    const roundOff = data.round_off || 0;
    const ewayBillAmount = data.eway_amount || 0;
    const gstAmount = calculateDiscountAmount(data.gst || 0, finalAmount - discountAmount);
    const damageExpenses = data.damage_expenses || 0;
    return parseFloat(
      (
        finalAmount -
        discountAmount +
        gstAmount +
        roundOff +
        ewayBillAmount +
        damageExpenses
      ).toFixed(2)
    );
  };

  const paymentModeToDisplay =
    calcTotal() - data.deposits.reduce((total, deposit) => total + deposit.amount, 0) < 0
      ? data.payment_mode.toUpperCase()
      : data.balance_paid_mode.toUpperCase();

  const getValidDate = (dateStr: string | undefined) =>
    dateStr && dayjs(dateStr).isValid() ? dayjs(dateStr).format('DD/MM/YYYY') : undefined;

  const balanceOrRepayDate = getValidDate(data.repay_date)
    ? getValidDate(data.repay_date)
    : getValidDate(data.balance_paid_date)
    ? getValidDate(data.balance_paid_date)
    : '';

  const depositTotal = () => {
    return parseFloat(
      data.deposits
        .reduce((total: number, deposit: DepositType) => total + deposit.amount, 0)
        .toFixed(2)
    );
  };

  const gstAmount = ((calcFinalAmount() - discountAmount) * data.gst * 0.01).toFixed(2);

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: 'white',
      fontSize: 10,
      paddingHorizontal: 20,
      width: '100%',
      position: 'relative',
      // paddingLeft: 50,
      marginVertical: 5,
      fontFamily: 'Times-Roman',
    },
    container: {
      flexDirection: 'column',
      marginRight: 20,
      gap: 10,
    },
    image: {
      width: 140,
      // height: 120,
      objectFit: 'contain',
    },
    ownerDetails: {
      flexDirection: 'column',
    },
    title: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    ownerAddress: {
      marginBottom: 2,
    },
    pageTitle: {
      textAlign: 'center',
      flexDirection: 'column',
    },
    invoiceDetails: {
      borderRadius: '5px',
      padding: 5,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    detailContainer: {
      width: 180,
    },
    tableField: {
      flexDirection: 'column',
      marginBottom: '1px',
    },
    fieldTitle: {
      fontWeight: 'normal',
      color: '#4f4f4f',
      marginBottom: '1px',
    },
    fieldValue: {
      color: 'black',
      fontSize: '10px',
      fontWeight: 'extrabold',
      marginBottom: '3px',
    },
    OrderSummaryContainer: {
      flexDirection: 'column',
    },
    orderWrapper: {
      flexDirection: 'column',
    },
    tableContainer: {
      border: '1px solid black',
      flexDirection: 'column',
      fontSize: 8,
      gap: 0,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f4f4f4',
      borderBottom: '1px solid #00000',
    },
    tableRow: {
      flexDirection: 'row',
      maxHeight: 22,
      maxLines: 2,
    },
    tableColumn: {
      fontSize: 8,
      color: '#4f4f4f',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRight: '1px solid black',
      alignContent: 'center',
      paddingVertical: 2,
    },
    productColumn: {
      fontSize: 8,
      color: 'black',
      display: 'flex',
      justifyContent: 'center',
      textAlign: 'center',
      alignItems: 'center',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      padding: 0,
      margin: 0,
      width: '100%',
      minHeight: '100%',
      wordBreak: 'break-all',
      borderRight: '1px solid black',
      alignContent: 'center',
    },
    calculationWrapper: {
      marginTop: 1,
      border: '1px solid black',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    calculationContainer: {
      width: '100%',
      flexDirection: 'column',
      gap: 3,
    },
    section: {
      width: '100%',
      backgroundColor: '#fff',
    },
    row: {
      flexDirection: 'row',
    },
    labelText: {
      flex: 1,
      paddingVertical: 6,
      borderRight: '1px solid #000',
      textAlign: 'right',
      paddingRight: 5,
    },
    valueText: {
      paddingLeft: 10,
      paddingVertical: 6,
      width: 70,
      textAlign: 'left',
    },
    boldText: {
      fontWeight: 'bold',
    },
    divider: {
      height: 1,
      backgroundColor: '#000',
      marginVertical: 8,
    },
    balanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    inputSim: {
      minWidth: 50,
      backgroundColor: '#E5E7EB',
      paddingHorizontal: 4,
      borderBottom: '1 solid #000',
      textAlign: 'right',
    },
    smallNote: {
      fontSize: 8,
      textAlign: 'right',
      color: '#6B7280',
    },
    selectSim: {
      fontSize: 10,
      padding: 2,
      fontWeight: 'bold',
    },
    footerRow: {
      marginTop: 1,
      flexDirection: 'row',
      width: '100%',
      height: 60,
      border: '1px solid black',
    },
    signatureContainer: {
      width: 250,
      flexDirection: 'column',
      padding: 5,
      gap: 3,
    },
    signatureHeader: {
      flexDirection: 'row',
      gap: 5,
      color: '#4f4f4f',
    },
    signImage: {
      width: 150,
      height: 30,
    },
    signatureFooter: {
      width: 150,
      textAlign: 'center',
    },
    amountTextContainer: {
      borderRight: '1px solid #000',
      width: 440,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    thankYouText: {
      fontSize: 10,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    footerNoteText: {
      fontSize: 8,
      textAlign: 'center',
    },
    bankDetails: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    depositContainer: {
      width: '50%',
      flexDirection: 'column',
      marginTop: 10,
    },
    depositTable: {
      width: '100%',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    depositTableRow: {
      flexDirection: 'row',
    },
    depositTableCol: {
      flex: 1,
      borderStyle: 'solid',
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      padding: 5,
    },
    depositTableHeader: {
      flex: 1,
      borderStyle: 'solid',
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      padding: 5,
      backgroundColor: '#eee',
      fontWeight: 'bold',
    },
    footerDetailsContainer: {
      flexDirection: 'row',
    },
    footerDataContainer: {
      flexDirection: 'column',
    },
  });

  const enoughProduct = (data.product_details?.length || 0) <= 5;
  const emptySpaces =
    (data.product_details?.length || 0) +
    (data.eway_amount ? 1 : 0) +
    (data.discount ? 1 : 0) +
    (data.status === PaymentStatus.PAID ? 1 : 0) +
    (data.round_off ? 1 : 0);
  const maxProducts = 6 - emptySpaces;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* <View style={{ flexGrow: 1 }}> */}
        <View style={styles.pageTitle}>
          <Text
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginTop: '10px',
              textDecoration: 'underline',
            }}
          >
            Tax Invoice
          </Text>
        </View>

        <View style={styles.invoiceDetails}>
          <View style={styles.detailContainer}>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Invoice No:</Text>
              <Text style={styles.fieldValue}>{data.invoice_id || '-'}</Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Bill No:</Text>
              <Text style={styles.fieldValue}>{data.order_id}</Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Invoice Date:</Text>
              <Text style={styles.fieldValue}>
                {dayjs(data.invoice_date).isValid()
                  ? dayjs(data.invoice_date).format('DD-MM-YYYY hh:mm:ss A')
                  : '-'}
              </Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Ref PO No & PO Date:</Text>
              <Text style={styles.fieldValue}>-</Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Event/Project Name:</Text>
              <Text style={styles.fieldValue}>
                {data.event_name.trim().length ? data.event_name : ' '}
              </Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Event/Supply Start Date:</Text>
              <Text style={styles.fieldValue}>
                {dayjs(data.out_date).isValid()
                  ? dayjs(data.out_date).format('DD-MM-YYYY hh:mm:ss A')
                  : ' '}
              </Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Event/Supply End Date:</Text>
              <Text style={styles.fieldValue}>
                {dayjs(data.in_date).isValid()
                  ? dayjs(data.in_date).format('DD-MM-YYYY hh:mm:ss A')
                  : ' '}
              </Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Ref DC No:</Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: '10px',
                    color: '#4f4f4f',
                  }}
                >
                  Outward:{' '}
                </Text>
                -
              </Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: '10px',
                    color: '#4f4f4f',
                  }}
                >
                  Inward:{' '}
                </Text>
                -
              </Text>
            </View>
          </View>
          <View style={styles.container}>
            <View style={{ flexDirection: 'column', gap: 0 }}>
              <Image src={Logo} style={styles.image} />
              <Text
                style={{
                  fontSize: 16,
                  color: '#C41E3A',
                  marginTop: 4,
                  textAlign: 'center',
                  fontFamily: 'Helvetica-Bold',
                  letterSpacing: 0.5,
                  lineHeight: 1.1,
                  fontWeight: 'bold',
                }}
              >
                MANI POWER TOOLS
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  marginTop: 3,
                  textAlign: 'center',
                  maxWidth: '175px',
                  fontFamily: 'Helvetica-Bold',
                  fontWeight: 700,
                  color: '#DC2626',
                  lineHeight: 1.4,
                }}
              >
                Power Tools, Garden Tools, Generator, Dewatering Pumps, Scaffolding and all
                construction equipment for Rent
              </Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Delivery Place/Venue:</Text>
              <Text style={styles.fieldValue}>
                {data.event_venue.trim().length ? data.event_venue : ' '}
              </Text>
            </View>
            <View style={styles.tableField}>
              <Text style={styles.fieldTitle}>Event Address:</Text>
              <Text style={styles.fieldValue}>{data.event_address}</Text>
            </View>
          </View>
          <View style={[styles.detailContainer, { justifyContent: 'space-between' }]}>
            <View>
              <View style={styles.ownerDetails}>
                <Text style={styles.title}>MANI POWER TOOLS</Text>
                <Text style={styles.ownerAddress}>No. 1/290, Angalamman Koil Street, Padur,</Text>
                <Text style={styles.ownerAddress}>Chengalpattu, Chennai - 603103, Tamil Nadu</Text>
                <Text style={[styles.ownerAddress, { color: '#DC2626', fontWeight: 900 }]}>
                  Mobile No - 8428429153 , 9042439153
                </Text>
                <Text style={[styles.ownerAddress, { fontWeight: 'bold' }]}>
                  manipowertools9153@gmail.com
                </Text>
                <Text style={[styles.ownerAddress, { fontWeight: 'bold' }]}>
                  GST No - 33FGDPP7447A1ZI
                </Text>
              </View>
              <View style={[styles.tableField, { marginTop: 5 }]}>
                <Text style={[styles.title]}>To</Text>
                <Text
                  style={{
                    color: 'black',
                    fontSize: '10px',
                    marginBottom: '3px',
                  }}
                >
                  {data.customer
                    ? data.customer.name.slice(0, 1).toUpperCase() +
                      data.customer.name.slice(1).toLowerCase()
                    : ''}
                </Text>
                <Text
                  style={{
                    color: 'black',
                    fontSize: '10px',
                    marginBottom: '3px',
                  }}
                >
                  {data.customer && data.customer.address.trim().length
                    ? data.customer.address
                    : ' '}
                  {data.customer ? ' - ' + data.customer.pincode : ''}
                </Text>
                <Text
                  style={{
                    fontSize: '10px',
                    color: 'black',
                    marginBottom: '3px',
                  }}
                >
                  Mobile - {data.customer ? data.customer.personal_number : ''}
                </Text>
                <Text
                  style={{
                    fontSize: '10px',
                    color: 'black',
                    marginBottom: '3px',
                  }}
                >
                  GST No - {data.customer ? data.customer.gstin : ''}
                </Text>
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
                    fontWeight: 'bold',
                    fontSize: '10px',
                    color: '#4f4f4f',
                  }}
                >
                  Outward:{' '}
                </Text>
                -
              </Text>
              <Text style={styles.fieldValue}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: '10px',
                    color: '#4f4f4f',
                  }}
                >
                  Inward:{' '}
                </Text>
                -
              </Text>
            </View>
          </View>
        </View>

        {/* <View style={styles.OrderSummaryContainer}> */}
        <Text style={{ fontSize: 15, fontWeight: 'bold', paddingBottom: 5 }}>Order Summary</Text>
        <View style={styles.orderWrapper}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 20,
                  },
                ]}
              >
                NO
              </Text>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 100,
                  },
                ]}
              >
                ITEM
              </Text>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 50,
                  },
                ]}
              >
                HSN/ SAC
              </Text>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 40,
                  },
                ]}
              >
                QTY
              </Text>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 40,
                  },
                ]}
              >
                UNIT
              </Text>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 70,
                  },
                ]}
              >
                UNIT PRICE
              </Text>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 80,
                  },
                ]}
              >
                DURATION
              </Text>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 60,
                  },
                ]}
              >
                AMOUNT
              </Text>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 60,
                  },
                ]}
              >
                GST(%)
              </Text>
              <Text
                style={[
                  styles.tableColumn,
                  {
                    width: 60,
                    borderRight: '0px',
                    alignContent: 'center',
                    paddingVertical: 2,
                    alignItems: 'center',
                  },
                ]}
              >
                TOTAL AMT
              </Text>
            </View>
            {updatedProducts.map((product: ProductDetails, index: number) => (
              <View
                key={product._id}
                style={[
                  styles.tableRow,
                  (data.product_details.length > 7 - emptySpaces &&
                    index === data.product_details.length - 1) ||
                  (maxProducts === 1 && index === data.product_details.length - 1)
                    ? {}
                    : { borderBottom: '1px solid #000' },
                ]}
              >
                <Text style={[styles.productColumn, { width: 20 }]}>{index + 1}</Text>
                <View>
                  <Text
                    style={[
                      styles.productColumn,
                      {
                        width: 99,
                        maxWidth: '95.4px !important',
                      },
                    ]}
                  >
                    {product.name}
                  </Text>
                </View>
                <Text style={[styles.productColumn, { width: 55 }]}>
                  {product.product_code || ''}
                </Text>
                <Text style={[styles.productColumn, { width: 40 }]}>{product.order_quantity} </Text>
                <Text style={[styles.productColumn, { width: 40 }]}>
                  {product.product_unit.name || 'Unit(s)'}
                </Text>
                <Text style={[styles.productColumn, { width: 70 }]}>
                  Rs. {product.rent_per_unit}
                </Text>
                <Text style={[styles.productColumn, { width: 80 }]}>
                  {product.type && product.type === ProductType.SALES
                    ? '-'
                    : product.duration + ' ' + product.billing_unit}
                </Text>
                <Text style={[styles.productColumn, { width: 60 }]}>
                  Rs. {parseFloat(calculateProductRent(product).toFixed(2))}
                </Text>
                <Text style={[styles.productColumn, { width: 60 }]}>{data.gst}</Text>
                <Text style={[styles.productColumn, { width: 60, borderRight: '0px' }]}>
                  Rs. {parseFloat(calculateProductRent(product).toFixed(2))}
                </Text>
              </View>
            ))}
            {Array.from({
              length: maxProducts > 0 ? maxProducts : 0,
            }).map((_, index) => (
              <View key={`empty-row-${index}`} style={[styles.tableRow]}>
                <Text style={[styles.productColumn, { width: 20 }]}></Text>
                <View>
                  <Text style={[styles.productColumn, { width: 95.4 }]}></Text>
                </View>
                <Text style={[styles.productColumn, { width: 55 }]}></Text>
                <Text style={[styles.productColumn, { width: 40 }]}></Text>
                <Text style={[styles.productColumn, { width: 40 }]}></Text>
                <Text style={[styles.productColumn, { width: 70 }]}></Text>
                <Text style={[styles.productColumn, { width: 80 }]}></Text>
                <Text style={[styles.productColumn, { width: 60 }]}></Text>
                <Text style={[styles.productColumn, { width: 60 }]}></Text>
                <Text style={[styles.productColumn, { width: 60, borderRight: '0px' }]}></Text>
              </View>
            ))}
          </View>
          <View wrap={false} style={styles.calculationWrapper}>
            <View style={styles.calculationContainer}>
              <View style={styles.section}>
                {/* Grid Columns */}
                {[
                  {
                    label: 'Total Amount',
                    value: `Rs. ${calcFinalAmount().toFixed(2)}`,
                    bottom: false,
                  },
                  ...(data.discount
                    ? [
                        {
                          label: 'Discount',
                          value: `${
                            data.discount_type === DiscountType.RUPEES ? 'Rs.' : ''
                          } ${data.discount?.toFixed(2)} ${
                            data.discount_type === DiscountType.PERCENT ? '%' : ''
                          }`,
                          bottom: true,
                        },
                      ]
                    : []),
                  {
                    label: `GST - ${data.gst}%`,
                    value: `Rs. ${gstAmount}`,
                    bottom: true,
                  },
                  ...(data.round_off
                    ? [
                        {
                          label: 'Round Off',
                          value: `Rs. ${data.round_off?.toFixed(2)}`,
                          bottom: true,
                        },
                      ]
                    : []),
                ].map((item, index) => (
                  <View
                    key={index}
                    style={[styles.row, item.bottom ? { borderBottom: '1px solid black' } : {}]}
                  >
                    <Text style={[styles.labelText, { fontWeight: 'bold' }]}>{item.label}</Text>
                    <Text style={[styles.valueText, { fontWeight: 'bold' }]}>{item.value}</Text>
                  </View>
                ))}
                {data.eway_amount ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid black',
                    }}
                  >
                    <View
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 4,
                      }}
                    >
                      <View
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                          gap: 4,
                        }}
                      >
                        <Text style={[styles.selectSim, { paddingLeft: 50, paddingTop: 5 }]}>
                          {'( Mode of Payment : ' + data.eway_mode.toUpperCase() + ')'}
                        </Text>
                        <Text style={[styles.labelText, { fontWeight: 'bold' }]}>Transport</Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'column',
                        width: 80,
                        alignItems: 'flex-end',
                      }}
                    >
                      <Text style={[styles.valueText, { fontWeight: 'bold' }]}>
                        {`Rs. ${data.eway_amount?.toFixed(2)}`}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <View
                  style={{
                    flexDirection: 'row',
                    borderBottom: '1px solid black',
                  }}
                >
                  <Text style={[styles.labelText, { fontWeight: 'bold' }]}>Net Total</Text>
                  <Text style={[styles.valueText, { fontWeight: 'bold' }]}>
                    {`Rs. ${Math.abs(calcTotal()).toFixed(2)}`}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid black',
                  }}
                >
                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexDirection: 'column',
                      width: '100%',
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        gap: 4,
                      }}
                    >
                      <Text style={[styles.selectSim, { paddingLeft: 50 }]}>
                        {data.deposits.length
                          ? '( Mode of Payment : ' + data.deposits[0].mode.toUpperCase() + ')'
                          : ''}
                      </Text>
                      <Text style={[styles.labelText, { fontWeight: 'bold' }]}>Deposit</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                      width: 80,
                      alignItems: 'flex-end',
                    }}
                  >
                    <Text style={[styles.valueText, { fontWeight: 'bold' }]}>
                      {`Rs. ${depositTotal().toFixed(2)}`}
                    </Text>
                  </View>
                </View>
                {/* Final total and mode */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexDirection: 'column',
                      width: '100%',
                      gap: 4,
                      borderRight: '1px solid black',
                    }}
                  >
                    <View
                      style={{
                        display: 'flex',
                        paddingVertical: 4,
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        gap: 4,
                      }}
                    >
                      <Text
                        style={[
                          styles.selectSim,
                          {
                            paddingLeft: 50,
                            paddingTop: 5,
                            color:
                              calcTotal() -
                                data.deposits.reduce(
                                  (total, deposit) => total + deposit.amount,
                                  0
                                ) <
                              0
                                ? 'red'
                                : data.status === PaymentStatus.PAID
                                ? 'green'
                                : 'black',
                          },
                        ]}
                      >
                        {data.status === PaymentStatus.PAID &&
                          paymentModeToDisplay !== '-' &&
                          `(Last Mode of Payment : ${paymentModeToDisplay} | Date: ${balanceOrRepayDate})`}
                      </Text>
                      <Text
                        style={{
                          paddingRight: 5,
                          color:
                            calcTotal() -
                              data.deposits.reduce((total, deposit) => total + deposit.amount, 0) <
                            0
                              ? 'red'
                              : data.status === PaymentStatus.PAID
                              ? 'green'
                              : 'black',
                          fontWeight: 'bold',
                        }}
                      >
                        {calcTotal() -
                          data.deposits.reduce((total, deposit) => total + deposit.amount, 0) <
                        0
                          ? 'Return Payment'
                          : data.status === PaymentStatus.PAID
                          ? 'Paid'
                          : 'Balance'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                      width: 80,
                      alignItems: 'flex-start',
                      paddingVertical: 4,
                      paddingLeft: 10,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          calcTotal() -
                            data.deposits.reduce((total, deposit) => total + deposit.amount, 0) <
                          0
                            ? 'red'
                            : data.status === PaymentStatus.PAID
                            ? 'green'
                            : 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      Rs.{' '}
                      {data.status === PaymentStatus.PAID
                        ? calcTotal() -
                            data.deposits.reduce((total, deposit) => total + deposit.amount, 0) <
                          0
                          ? Math.abs(
                              calcTotal() -
                                data.deposits.reduce((total, deposit) => total + deposit.amount, 0)
                            ).toFixed(2)
                          : calcTotal().toFixed(2)
                        : (
                            Math.abs(
                              calcTotal() -
                                data.deposits.reduce((total, deposit) => total + deposit.amount, 0)
                            ) -
                            (data.balance_paid && data.balance_paid !== 0
                              ? data.balance_paid
                              : data.repay_amount)
                          ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View wrap={false} style={styles.footerRow}>
            <View style={styles.amountTextContainer}>
              <Text style={{ fontSize: 12, marginBottom: 2 }}>Amount in words:</Text>
              <View
                style={{
                  maxWidth: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Text
                  style={{
                    maxWidth: '85%',
                    height: 'auto',
                    alignContent: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: data.status === PaymentStatus.PAID ? '#018f43' : 'black',
                  }}
                >
                  {numberToWordsIndian(Math.abs(calcTotal()) || 0)}
                </Text>
                {data.status === 'paid' && (
                  <Image
                    src={paidStamp}
                    style={{
                      // position: "absolute",
                      bottom: '2%',
                      right: '1%',
                      width: 40,
                      height: 40,
                      // transform: "translate(-50%, -50%)",
                    }}
                  />
                )}
              </View>
            </View>
            <View
              style={{
                width: '40%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 12, marginBottom: 2 }}>Bill Amount</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: data.status === PaymentStatus.PAID ? '#018f43' : 'black',
                }}
              >
                Rs. {Math.abs(calcTotal()).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <View
          wrap={false}
          style={{
            // flexGrow: 1,
            justifyContent: enoughProduct ? 'flex-end' : 'flex-start',
            marginBottom: 10,
          }}
        >
          <View style={styles.footerDetailsContainer}>
            <View style={styles.footerDataContainer}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'column',
                  marginTop: 5,
                  lineHeight: 1,
                }}
              >
                <Text style={styles.bankDetails}>Bank Information</Text>
                <Text style={styles.selectSim}>Kindly make the payment in favour of</Text>
                <View
                  style={{
                    width: '80%',
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <Text style={{ width: 90 }}>Account No</Text>
                  <Text>50200080502830</Text>
                </View>
                <View
                  style={{
                    width: '80%',
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <Text style={{ width: 125 }}>Account Name</Text>
                  <Text>MANI POWER TOOLS</Text>
                </View>
                <View
                  style={{
                    width: '80%',
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <Text style={{ width: 100 }}>Bank Name</Text>
                  <Text>HDFC BANK LTD</Text>
                </View>
                <View
                  style={{
                    width: '80%',
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <Text style={{ width: 105 }}>Branch</Text>
                  <Text>KELAMBAKKAM</Text>
                </View>
                <View
                  style={{
                    width: '80%',
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <Text style={{ width: 80 }}>IFSC Code</Text>
                  <Text>HDFC0002075</Text>
                </View>
              </View>
            </View>
            <View
              style={{
                width: '60%',
                display: 'flex',
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <Image src="/qr.jpeg" style={{ width: 100, height: 100 }} />
              <Text style={{ fontSize: 10, marginTop: 2 }}>Scan QR to Pay your bill</Text>
            </View>
            <View style={{ marginTop: 8, width: '40%' }}>
              <Text style={[styles.bankDetails, { marginBottom: 3 }]}>Terms & Conditions</Text>
              <Text
                style={{
                  fontSize: 10,
                  textAlign: 'left',
                  marginLeft: 0,
                  marginBottom: 0,
                  lineHeight: 1.1,
                }}
              >
                Return products in good condition. Damages or loss will be charged.
              </Text>
              {data.remarks && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600 }}>Remarks:</Text>
                  <Text>{data.remarks}</Text>
                </View>
              )}
              <View style={styles.signatureContainer}>
                <View style={styles.signatureHeader}>
                  <Text style={{ fontSize: 12 }}>For</Text>
                  <Text
                    style={{
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: 12,
                    }}
                  >
                    MANI POWER TOOLS
                  </Text>
                </View>
                <View style={{ position: 'relative', width: 150, height: 30 }}>
                  <Image src="/sign.png" style={styles.signImage} />
                </View>
                <Text style={styles.signatureFooter}>Authorized Signatory</Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              flexDirection: 'column',
              // marginTop: 5,
            }}
          >
            <Text style={styles.thankYouText}>
              Thanks for choosing us - We look forward to serve you again
            </Text>
            <Text style={styles.footerNoteText}>This is computer generated invoice</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Invoice;
