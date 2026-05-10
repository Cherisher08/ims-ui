import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import { saveAs } from "file-saver";

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
    <>
      <Lightbox
        open={imageUrl !== null}
        close={() => setImageUrl(null)}
        slides={imageUrl ? [{ src: imageUrl }] : []}
        plugins={[Zoom, Download]}
        on={{
          view: () => {}, // prevent unused var warning for standard structure
        }}
        download={{
          download: ({ slide }) => {
            if (slide && slide.src) {
              handleDownload(slide.src);
            }
          }
        }}
      />
    </>
  );
};

export default ViewImageModal;
