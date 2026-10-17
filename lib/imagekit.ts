import ImageKit from "imagekit";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";

export const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
});
