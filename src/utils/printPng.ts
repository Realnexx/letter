// PNG pHYs metadata makes a 600 × 1050 image print at 2 × 3.5 inches at 300 DPI.
export async function printPng(blob: Blob, dpi = 300): Promise<Blob> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const physical = new Uint8Array(21);
  const view = new DataView(physical.buffer);
  view.setUint32(0, 9);
  physical.set([112, 72, 89, 115], 4); // pHYs
  const ppm = Math.round(dpi / .0254);
  view.setUint32(8, ppm); view.setUint32(12, ppm); physical[16] = 1;
  let crc = 0xffffffff;
  for (const byte of physical.subarray(4, 17)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  view.setUint32(17, (crc ^ 0xffffffff) >>> 0);
  const parts: BlobPart[] = [bytes.slice(0, 8)];
  const source = new DataView(bytes.buffer);
  for (let offset = 8; offset < bytes.length;) {
    const size = source.getUint32(offset) + 12;
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (type !== 'pHYs') parts.push(bytes.slice(offset, offset + size));
    if (type === 'IHDR') parts.push(physical);
    offset += size;
  }
  return new Blob(parts, {type:'image/png'});
}
