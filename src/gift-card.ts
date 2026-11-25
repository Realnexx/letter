import QRCode from 'qrcode';
import { printPng } from './utils/printPng';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/allura/latin-400.css';
import './gift-card.css';
import { settings } from './data/messages';

document.querySelector<HTMLDivElement>('#card-root')!.innerHTML = `
  <header class="studio-header"><a href="/">a. <span>A letter for her</span></a><span>THE PRINT STUDIO</span></header>
  <main class="studio-layout">
    <section class="studio-tools" aria-labelledby="studio-title">
      <h1>A little invitation.<br/><em>A beautiful surprise.</em></h1>
      <p>A keepsake for Kimberly Ann, with a doorway to her birthday letters.</p>
      <form id="link-form"><label for="website-url">Published website link</label><input type="url" id="website-url" placeholder="https://your-website.com" required autocomplete="url"/><p class="field-help">Publish the letter first, then paste its public link. Everything is generated on this device.</p><button type="submit" class="primary-button">Create her QR code <span>↗</span></button></form>
      <p id="card-status" role="status">The design is ready. Add a published link to create the scannable code.</p>
      <div class="export-actions"><button id="print" disabled>Print / save PDF</button><button id="download-card" disabled>Download card · PNG</button><button id="download-qr" disabled>Download QR · SVG</button></div>
      <p class="print-help">2 × 3.5 inches · portrait card<br/>Print at 100% with background graphics enabled. Scan the printed card with your phone before gifting it.</p>
    </section>
    <section class="card-preview" aria-label="Gift card preview"><div id="gift-card" class="gift-card">
      <div class="card-frame"><div class="card-monogram" aria-hidden="true">k<span>a</span></div>
      <p class="card-for">For</p><h2 id="recipient-name"></h2><div class="small-rule"></div>
      <p class="card-message">Some words are better<br/>kept in a letter.</p>
      <div class="qr-frame"><div id="qr-placeholder"><span class="placeholder-mark">a.</span><span>Your QR code<br/>will appear here</span></div><img id="qr-image" alt="Scan to open Kimberly Ann’s birthday letters" hidden/></div>
      <p class="scan-label">Scan to open<br/>your birthday letter</p>
      <p class="card-script">A little love, just for you.</p>
      <div class="card-bottom"><span></span><span>HAPPY BIRTHDAY</span><span></span></div>
      </div></div></section>
  </main>`;
document.querySelector('#recipient-name')!.textContent = settings.recipient;
const input = document.querySelector<HTMLInputElement>('#website-url')!;
const status = document.querySelector<HTMLParagraphElement>('#card-status')!;
const qrImage = document.querySelector<HTMLImageElement>('#qr-image')!;
const exportButtons = [...document.querySelectorAll<HTMLButtonElement>('.export-actions button')];
let destination: string | null = null;
let qrSvg = '';
const options = {errorCorrectionLevel:'H' as const, margin:4, color:{dark:'#55333C',light:'#FFFFFF'}};
function validateLink(raw: string) {
  const url = new URL(raw);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host === '::1' || host === '[::1]' || /^\d+\.\d+\.\d+\.\d+$/.test(host) || !host.includes('.')) throw new Error('Use a public HTTPS website link. A localhost or private network address will not work for her.');
  if (host === 'github.com') throw new Error('That is a source-code link. Add the published website link from Vercel or another host.');
  return url.href;
}
function invalidate() { destination = null; qrSvg = ''; qrImage.hidden = true; document.querySelector<HTMLElement>('#qr-placeholder')!.hidden = false; exportButtons.forEach(button => button.disabled = true); }
input.addEventListener('input', () => {invalidate(); status.textContent = 'Create the QR code again to use the updated link.';});
document.querySelector('#link-form')!.addEventListener('submit', async event => {
  event.preventDefault(); invalidate();
  try {
    const url = validateLink(input.value.trim());
    const [data, svg] = await Promise.all([QRCode.toDataURL(url,{...options,width:1000}), QRCode.toString(url,{...options,type:'svg'})]);
    qrImage.src = data; await qrImage.decode(); qrSvg = svg; destination = url;
    qrImage.hidden = false; document.querySelector<HTMLElement>('#qr-placeholder')!.hidden = true;
    exportButtons.forEach(button => button.disabled = false);
    status.textContent = `Code created for ${url}. Open that link on a phone and scan a test print before gifting.`;
  } catch(error) {status.textContent = error instanceof Error ? error.message : 'The QR code could not be created. Check the link and try again.';}
});
function download(blob: Blob, filename: string) {const link = document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=filename; link.click(); setTimeout(() => URL.revokeObjectURL(link.href),1000);}
document.querySelector('#download-qr')!.addEventListener('click', () => {if(destination) download(new Blob([qrSvg],{type:'image/svg+xml'}),'kimberly-ann-birthday-qr.svg');});
document.querySelector('#print')!.addEventListener('click', () => {if(destination) window.print();});
document.querySelector('#download-card')!.addEventListener('click', async () => {
  if(!destination) return;
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=600;canvas.height=1050;
  const c=canvas.getContext('2d')!;
  c.scale(600/192,1050/336);c.fillStyle='#F5F0E7';c.fillRect(0,0,192,336);
  c.strokeStyle='#C5A15C';c.lineWidth=.5;c.strokeRect(8,8,176,320);c.strokeStyle='#C5A15C66';c.strokeRect(10,10,172,316);
  c.textAlign='center';c.fillStyle='#55333C';
  c.strokeStyle='#C5A15C';c.beginPath();c.arc(96,31,11,0,Math.PI*2);c.stroke();c.font='17px Allura';c.fillText('ka',96,36);
  c.font='italic 11px "Cormorant Garamond"';c.fillText('For',96,56);c.font='21px "Cormorant Garamond"';c.fillText(settings.recipient,96,80);
  c.strokeStyle='#C5A15C';c.beginPath();c.moveTo(82,90);c.lineTo(110,90);c.stroke();
  c.font='14px "Cormorant Garamond"';c.fillText('Some words are better',96,107);c.font='italic 14px "Cormorant Garamond"';c.fillText('kept in a letter.',96,123);
  c.imageSmoothingEnabled=false;c.drawImage(qrImage,44,135,104,104);c.imageSmoothingEnabled=true;
  c.font='9px "DM Sans"';c.fillText('Scan to open',96,253);c.fillText('your birthday letter',96,265);
  c.font='17px Allura';c.fillText('A little love, just for you.',96,291);
  c.font='8px "DM Sans"';c.fillStyle='#715C61';c.fillText('HAPPY BIRTHDAY',96,316);
  canvas.toBlob(blob => {if(blob) void printPng(blob).then(printable=>download(printable,'kimberly-ann-birthday-card.png'));},'image/png');
});
const initial = new URLSearchParams(location.search).get('url') || (location.protocol === 'https:' && !location.hostname.includes('localhost') ? new URL('./',location.href).href : '');
if(initial) {input.value=initial;document.querySelector<HTMLFormElement>('#link-form')!.requestSubmit();}
