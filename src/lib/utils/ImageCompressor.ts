import imageCompression from "browser-image-compression";

export const compressPodcastImage = async (file: File) => {
  const compressedImage = await imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 3000,
    useWebWorker: true,
  });

  return compressedImage;
};
