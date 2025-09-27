import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { RentalOrderInfo } from '../../../types/order';

const styles = StyleSheet.create({
  page: { padding: 24 },
  section: { marginBottom: 12 },
});

interface DeliveryChallanPDFProps {
  orderInfo: RentalOrderInfo;
}

const DeliveryChallanPDF = ({ orderInfo }: DeliveryChallanPDFProps) => (
  <Document>
    <Page size="A7" style={styles.page}>
      <View style={styles.section}>
        <Text>Delivery Challan</Text>
        <Text>Order ID: {orderInfo.order_id}</Text>
        <Text>Customer: {orderInfo.customer?.name}</Text>
        {/* Add more fields as needed */}
      </View>
      {/* Add more sections/details as needed */}
    </Page>
  </Document>
);

export default DeliveryChallanPDF;
