import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { BillingUnit, RentalOrderInfo } from '../../../types/order';
import { Branch } from '../../../types/user';
import { ProductType } from '../../../types/common';
import Logo from '/Logo.jpeg';
import { formatBillingUnit } from '../../../services/utility_functions';

Font.register({
  family: 'Tamil',
  src: '/NotoSansTamil-Regular.ttf',
  fontWeight: 'normal',
});
Font.register({
  family: 'Inter',
  src: '/Inter_18pt-Regular.ttf',
  fontWeight: 'normal',
});
Font.register({
  family: 'Inter',
  src: '/Inter_18pt-ExtraBold.ttf',
  fontWeight: 'heavy',
});
Font.registerHyphenationCallback((word) => [word]);

// Branch-specific phone numbers
const BRANCH_PHONE_NUMBERS: Record<Branch, string> = {
  [Branch.PADUR]: '9042439153, 8428429153',
  [Branch.KELAMBAKKAM]: '9042439153, 8428429153',
  [Branch.PUDUPAKKAM]: '9677309153, 7358739153',
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    padding: 10,
  },
  container: {
    border: '2px solid #000000',
    width: '100%',
    fontSize: 12,
    // height: '100%',
  },
  header: {
    textAlign: 'center',
    borderBottom: '2px solid #000000',
    paddingHorizontal: 5,
    paddingVertical: 3,
    display: 'flex',
    flexDirection: 'row',
  },
  content: {
    padding: 4,
    paddingHorizontal: 10,
    // flexGrow: 1,
    borderBottom: 2,
    fontSize: 9,
    borderColor: 'black',
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  field: {
    flex: 1,
    paddingRight: 4,
  },
  colon: {
    width: 10,
    textAlign: 'center',
  },
  value: {
    flex: 1.3,
    textAlign: 'left',
    paddingLeft: 4,
  },
  footer: {
    padding: 4,
  },
});

const DeliveryChallan = ({ data }: { data: RentalOrderInfo }) => {
  if (!data) return null;

  const outDate = dayjs(data.out_date);
  const hour = outDate.isValid() ? outDate.hour() : 12;

  // Calculate return date based on products' billing units and durations
  let baseReturnDate = outDate.isValid() ? outDate : null;
  let hasRental = false;

  if (outDate.isValid() && data.product_details && data.product_details.length > 0) {
    let maxReturnDate = outDate;
    data.product_details.forEach((prod) => {
      if (prod.type === ProductType.SALES) return;

      let prodReturnDate = outDate;
      const duration = prod.duration || 0;
      const unit = prod.billing_unit;

      if (unit === BillingUnit.SHIFT) {
        prodReturnDate = outDate.add(duration * 8, 'hour');
        hasRental = true;
      } else if (unit === BillingUnit.DAYS) {
        prodReturnDate = outDate.add(duration, 'day');
        hasRental = true;
      } else if (unit === BillingUnit.WEEKS) {
        prodReturnDate = outDate.add(duration * 7, 'day');
        hasRental = true;
      } else if (unit === BillingUnit.MONTHS) {
        prodReturnDate = outDate.add(duration * 30, 'day');
        hasRental = true;
      }

      if (prodReturnDate.isAfter(maxReturnDate)) {
        maxReturnDate = prodReturnDate;
      }
    });

    if (hasRental) {
      baseReturnDate = maxReturnDate;
    }
  }

  // Fallback to rental_duration if no rental products found
  if (!hasRental && baseReturnDate && data.rental_duration) {
    baseReturnDate = baseReturnDate.add(data.rental_duration, 'day');
  }

  // Determine return time and adjust return date based on entry hour
  let finalReturnDate = baseReturnDate;
  let is7AM = false;

  if (outDate.isValid()) {
    if (hour >= 12 && hour <= 22) {
      is7AM = true;
      if (baseReturnDate) {
        finalReturnDate = baseReturnDate.add(1, 'day');
      }
    }
  }

  const returnDateFormatted = finalReturnDate ? finalReturnDate.format('DD-MM-YYYY') : '-';

  const englishMessage = is7AM
    ? "You should return equipment on or before 7.00 AM. Customers are responsible for equipment's Damage. Machine working hours per day calculated as 8 hours"
    : "You should return equipment on or before 7.00 PM. Customers are responsible for equipment's Damage. Machine working hours per day calculated as 8 hours";

  const tamilMessage = is7AM
    ? "நீங்கள் இயந்திரங்களை காலை 7.00 மணிக்குள் திருப்பித் தர வேண்டும். இயந்திர சேதத்திற்கு வாடிக்கையாளர்களே பொறுப்பு. இயந்திரத்தின் வேலை நேரம் ஒரு நாளைக்கு 8 மணி."
    : "நீங்கள் இயந்திரங்களை மாலை 7.00 மணிக்குள் திருப்பித் தர வேண்டும். இயந்திர சேதத்திற்கு வாடிக்கையாளர்களே பொறுப்பு. இயந்திரத்தின் வேலை நேரம் ஒரு நாளைக்கு 8 மணி.";

  return (
    <Document>
      <Page size={[297.64, Infinity]} style={styles.page}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image src={Logo} style={{ width: 65, height: 65, objectFit: 'contain' }} />
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '-10px',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#C41E3A',
                  marginTop: 4,
                  textAlign: 'center',
                  lineHeight: 1,
                  letterSpacing: -0.4,
                  fontWeight: 'bold',
                  strokeWidth: 2,
                }}
              >
                MANI CONSTRUCTION EQUIPMENTS
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  marginTop: 3,
                  textAlign: 'center',
                  maxWidth: '210px',
                  fontFamily: 'Helvetica-Bold',
                  fontWeight: 700,
                  color: '#DC2626',
                  letterSpacing: -0.2,
                  lineHeight: 1.4,
                }}
              >
                Power Tools, Garden Tools, Generator, Dewatering Pumps, Scaffolding and all
                construction equipment for Rental
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: 'Helvetica-Bold',
                  fontWeight: 700,
                  color: '#DC2626',
                  lineHeight: 1.4,
                }}
              >
                {BRANCH_PHONE_NUMBERS[data.branch as Branch]}
              </Text>
            </View>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 2,
              borderBottom: '2px solid #000000',
              paddingBottom: 2,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: 900, fontFamily: 'Helvetica-Bold' }}>
              Delivery Challan
            </Text>
          </View>
          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={styles.field}>Entry Date & Time</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{dayjs(data.out_date).format('DD-MM-YYYY HH:mm')}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.field}>RO Number</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.order_id}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.field}>Customer Name</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.customer?.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Phone Number</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.customer?.personal_number || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ flex: 1, fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>
                Customer Native Place
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={{ flex: 1, textAlign: 'left' }}>
                {data.customer?.address?.replace(/\n/g, ' ')}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Representative Name</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.representative_name || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Representative Number</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.representative_number || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Working Place</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.event_venue || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Event Place</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.event_address || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>No.of Working Days</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.rental_duration || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Return Date</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{returnDateFormatted}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Deposit with Mode</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>
                {data.deposits.reduce((total, dep) => total + dep.amount, 0) || '-'}
                {` - ${data.deposits.length > 0 ? data.deposits[0].mode : ''}`}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Transport</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.eway_amount || '-'}</Text>
            </View>
            <View>
              {/* Header Row */}
              <View style={{ ...styles.row, justifyContent: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>
                  Product Name - Quantity @ Rent per Duration
                </Text>
              </View>
              {/* Product Details */}
              {data.product_details.map((prod) => (
                <View key={prod._id}>
                  <View style={styles.row}>
                    <Text style={styles.field}>{prod.name}</Text>
                    <Text style={styles.colon}>-</Text>
                    <Text style={styles.value}>
                      {prod.type === ProductType.SALES
                        ? `${prod.order_quantity} @ Rs. ${prod.rent_per_unit * prod.order_quantity}`
                        : `${prod.order_quantity} @ Rs. ${prod.rent_per_unit * prod.order_quantity} per ${formatBillingUnit(prod.billing_unit)}`}
                    </Text>
                  </View>
                  {prod.description && (
                    <View style={{ ...styles.row, marginBottom: 3 }}>
                      <Text
                        style={{
                          ...styles.field,
                          fontSize: 8,
                          color: '#666666',
                        }}
                      >
                        {prod.description}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
          <View style={styles.footer}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#DC2626',
                lineHeight: 1.4,
              }}
            >
              {englishMessage}
            </Text>
            <Text
              style={{
                fontSize: 8,
                fontWeight: 'bold',
                fontFamily: 'Tamil',
                textAlign: 'center',
                marginTop: 6,
                color: '#DC2626',
                lineHeight: 1.4,
              }}
            >
              {tamilMessage}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DeliveryChallan;
