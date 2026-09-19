const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const encodeUuid = (uuid: string): string => {
  const hex = uuid.replace(/-/g, "");
  let num = BigInt("0x" + hex);
  let encoded = "";
  while (num > 0n) {
    const rem = num % 62n;
    encoded = BASE62[Number(rem)] + encoded;
    num = num / 62n;
  }
  return encoded.padStart(22, "0"); // 128-bit is max ~22 chars in base62
};

export const decodeUuid = (shortId: string): string | null => {
  try {
    let num = 0n;
    for (let i = 0; i < shortId.length; i++) {
      const char = shortId[i];
      const val = BASE62.indexOf(char);
      if (val === -1) return null;
      num = num * 62n + BigInt(val);
    }
    let hex = num.toString(16).padStart(32, "0");
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  } catch (e) {
    return null;
  }
};
