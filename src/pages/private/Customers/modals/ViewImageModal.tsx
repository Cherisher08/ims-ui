import { Modal } from '@mui/material';
import { MdClose } from 'react-icons/md';
import { saveAs } from 'file-saver';
import CustomButton from '../../../../styled/CustomButton';

export type DeleteContactType = {
  imageUrl: string | null;
  setImageUrl: (value: string | null) => void;
};

const ViewImageModal = ({ imageUrl, setImageUrl }: DeleteContactType) => {
  const handleDownload = async (url: string) => {
    try {
      // Replace leading 'public/' path segment with 'download-static/'
      let downloadUrl = url;
      try {
        const parsed = new URL(url, window.location.origin);
        const p = parsed.pathname;
        if (p.startsWith('/public/')) {
          parsed.pathname = p.replace('/public/', '/download-static/');
        } else if (p.startsWith('public/')) {
          parsed.pathname = p.replace('public/', '/download-static/');
        }
        downloadUrl = parsed.toString();
      } catch (e) {
        // fallback for malformed/relative urls
        if (downloadUrl.startsWith('public/')) {
          downloadUrl = downloadUrl.replace(/^public\//, 'download-static/');
        } else if (downloadUrl.startsWith('/public/')) {
          downloadUrl = downloadUrl.replace(/^\/public\//, '/download-static/');
        }
      }

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const fileName = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1) || 'image';
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <Modal
      open={imageUrl !== null ? true : false}
      onClose={() => {
        setImageUrl(null);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-2/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-end gap-2 items-center w-full">
          <CustomButton
            onClick={() => {
              if (imageUrl) {
                handleDownload(imageUrl);
              }
            }}
            label="Download Image"
            variant="contained"
            className="self-end"
          />
          <div className="flex justify-end">
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => {
                setImageUrl(null);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col w-full gap-2 p-2 justify-center items-center rounded-sm">
          {imageUrl !== null && <img src={imageUrl} className="w-full h-80" />}
        </div>
      </div>
    </Modal>
  );
};

export default ViewImageModal;
