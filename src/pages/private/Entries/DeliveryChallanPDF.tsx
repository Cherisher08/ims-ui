import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { RentalOrderInfo } from '../../../types/order';
import Logo from '/New_Logo.png';

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
    fontSize: 10,
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

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image src={Logo} style={{ width: 75, height: 75, objectFit: 'contain' }} />
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
                  maxWidth: '180px',
                  fontFamily: 'Helvetica-Bold',
                  fontWeight: 700,
                  color: '#DC2626',
                  lineHeight: 1.4,
                }}
              >
                Power Tools, Garden Tools, Generator, Dewatering Pumps, Scaffolding and all
                construction equipment for Rent
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: 'Helvetica-Bold',
                  fontWeight: 700,
                  color: '#DC2626',
                  lineHeight: 1.4,
                }}
              >
                9042439153, 8428429153
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
              <Text style={styles.field}>Entry Date</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{dayjs(data.out_date).format('DD-MM-YYYY')}</Text>
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
            {/* <View style={{ paddingHorizontal: 20, paddingVertical: 5}}>
              <View style={styles.row}>
                <Text style={[styles.field, { fontSize: 11 }]}>Product Name</Text>
                <Text style={[styles.value, { fontSize: 11 }]}>Per Day Rent</Text>
              </View>
              {data.product_details.map((prod) => (
                <View style={styles.row}>
                  <Text style={[styles.field, { fontSize: 11 }]}>{prod.name || '-'}</Text>
                  <Text style={styles.colon}>-</Text>
                  <Text style={[styles.value, { fontSize: 11 }]}>
                    {prod.rent_per_unit ? `Rs. ${prod.rent_per_unit}` : '-'}
                  </Text>
                </View>
              ))}
            </View> */}
            <View>
              {data.product_details.slice(0, 1).map((prod) => (
                <View style={styles.row} key={prod._id}>
                  <Text style={styles.field}>Product Name - Quantity / Per Day Rent</Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.value}>
                    {prod.name + ' - ' + prod.order_quantity + ' / ' + `Rs. ${prod.rent_per_unit}`}
                  </Text>
                </View>
              ))}
              {data.product_details.slice(1).map((prod) => (
                <View style={styles.row} key={prod._id}>
                  <Text style={[styles.field]}></Text>
                  <Text style={styles.colon}></Text>
                  <Text style={[styles.value]}>
                    {prod.name + ' - ' + prod.order_quantity + ' / ' + `Rs. ${prod.rent_per_unit}`}
                  </Text>
                </View>
              ))}
            </View>
            {/* <View style={styles.row}>
              <Text style={styles.field}>Product Name</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.product_details[0].name || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Per day Rent</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>
                {data.product_details[0].rent_per_unit
                  ? `Rs. ${data.product_details[0].rent_per_unit}`
                  : '-'}
              </Text>
            </View> */}
            <View style={styles.row}>
              <Text style={styles.field}>Deposit</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>
                {data.deposits.reduce((total, dep) => total + dep.amount, 0) || '-'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Transport</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.eway_amount || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Working Place</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.event_venue || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>No.of Working Days</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.rental_duration || '-'}</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text
              style={{
                fontSize: 8,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#DC2626',
                lineHeight: 1.4,
              }}
            >
              You should generally return equipment within business hours (7.00 AM to 7.00 PM) &
              Customers are responsible for equipment's Damage
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
              நீங்கள் வழக்கமாக வணிக நேரங்களுக்குள் (காலை 7.00 மணி முதல் மாலை 7.00 மணி வரை)
              உபகரணங்களைத் திருப்பித் தர வேண்டும் & உபகரண சேதத்திற்கு வாடிக்கையாளர்களே பொறுப்பு.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DeliveryChallan;
