import { ReactElement } from 'react';
import { pdf } from '@react-pdf/renderer';
import * as pdfjsLib from 'pdfjs-dist';
import { MessageDetails, RentalOrderInfo } from '../../../types/order';

// Ensure PDF.js worker is set for client-side rendering of PDFs to canvas.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function pdfElementToPngFile(
  element: ReactElement,
  fileName = 'Invoice.png',
  scale = 2
): Promise<File> {
  // react-pdf's `pdf` helper expects a Document-like element; cast to any
  // to avoid strict typing constraints in this shared helper.
  const pdfFunc = pdf as unknown as (el: ReactElement) => { toBlob: () => Promise<Blob> };
  const pdfBlob = await pdfFunc(element).toBlob();
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const pdfDoc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  const page = await pdfDoc.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport, canvas }).promise;

  const imageBlob: Blob | null = await new Promise((res) =>
    canvas.toBlob((b) => res(b), 'image/png')
  );

  if (!imageBlob) throw new Error('Failed to create image blob from PDF');

  return new File([imageBlob], fileName, { type: 'image/png' });
}

export type SendImageDeps = {
  file: File;
  order: RentalOrderInfo;
  sendDcWhatsapp: (args: {
    mobile_number: string;
    messageDetails: MessageDetails;
    pdf_file: File;
  }) => { unwrap: () => Promise<unknown> };
  updateRentalOrder: (order: RentalOrderInfo) => Promise<unknown>;
};

export async function sendImageViaWhatsapp({
  file,
  order,
  sendDcWhatsapp,
  updateRentalOrder,
}: SendImageDeps) {
  const customer = order.customer as unknown as
    | { name?: string; personal_number?: string }
    | undefined;
  const messageDetails = {
    customerName: customer?.name || '',
    orderId: order.order_id,
    bill_type: 'Invoice',
  } as MessageDetails;

  // send via existing mutation (caller should unwrap/await as needed)
  await sendDcWhatsapp({
    mobile_number: (customer?.personal_number as string) || '',
    messageDetails,
    pdf_file: file,
  }).unwrap();

  // update order whatsapp_notifications.invoice
  await updateRentalOrder({
    ...order,
    whatsapp_notifications: {
      delivery_challan: order.whatsapp_notifications?.delivery_challan ?? {
        is_sent: false,
        last_sent_date: '',
      },
      invoice: {
        is_sent: true,
        last_sent_date: new Date().toISOString(),
      },
    },
  });
}
