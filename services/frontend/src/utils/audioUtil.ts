export const base64EncodeOpus = (opusData: Uint8Array) => {
  // Convert to base64
  let binary = '';
  for (let i = 0; i < opusData.byteLength; i += 1) {
    binary += String.fromCharCode(opusData[i]);
  }
  return window.btoa(binary);
};
