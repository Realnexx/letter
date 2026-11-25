import { test, expect } from '@playwright/test';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';

test('gift card rejects local links and generates a decodable downloadable QR', async ({page}) => {
  await page.goto('/gift-card.html');
  await expect(page.locator('#recipient-name')).toHaveText('Kimberly Ann');
  await expect(page.getByRole('button',{name:'Print / save PDF',exact:true})).toBeDisabled();
  await page.getByLabel('Published website link').fill('https://localhost:5173/');
  await page.getByRole('button',{name:'Create her QR code'}).click();
  await expect(page.getByRole('status')).toContainText('public HTTPS');
  await page.getByLabel('Published website link').fill('https://github.com/Realnexx/letter');
  await page.getByRole('button',{name:'Create her QR code'}).click();
  await expect(page.getByRole('status')).toContainText('source-code link');
  // A fixture URL tests encoding only; it is never saved as the real gift link.
  const target='https://example.com/kimberly-ann';
  await page.getByLabel('Published website link').fill(target);
  await page.getByRole('button',{name:'Create her QR code'}).click();
  await expect(page.locator('#qr-image')).toBeVisible();
  const src=await page.locator('#qr-image').getAttribute('src');
  const png=PNG.sync.read(Buffer.from(src!.split(',')[1],'base64'));
  const decoded=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);
  expect(decoded?.data).toBe(target);
  const downloadEvent=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download card · PNG',exact:true}).click();
  const download=await downloadEvent;
  expect(download.suggestedFilename()).toBe('kimberly-ann-birthday-card.png');
  const cardBytes=readFileSync((await download.path())!);const card=PNG.sync.read(cardBytes);
  expect([card.width,card.height]).toEqual([600,1050]);
  expect(jsQR(new Uint8ClampedArray(card.data),card.width,card.height)?.data).toBe(target);
  let ppm=0;
  for(let at=8;at<cardBytes.length;){const size=cardBytes.readUInt32BE(at);if(cardBytes.toString('ascii',at+4,at+8)==='pHYs'){ppm=cardBytes.readUInt32BE(at+8);expect(cardBytes.readUInt32BE(at+12)).toBe(ppm);expect(cardBytes[at+16]).toBe(1);}at+=size+12;}
  expect(ppm).toBe(11811);
  await page.getByLabel('Published website link').fill('https://example.com/changed');
  await expect(page.getByRole('button',{name:'Print / save PDF',exact:true})).toBeDisabled();
});

test('gift card preview fits mobile and prints at 2 by 3.5 inches', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/gift-card.html');
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('.card-frame').evaluate(el=>el.scrollHeight<=el.clientHeight)).toBe(true);
  await page.screenshot({path:'test-results/gift-card-mobile.png',fullPage:true});
  await page.emulateMedia({media:'print'});
  expect(await page.locator('.card-frame').evaluate(el=>el.scrollHeight<=el.clientHeight)).toBe(true);
  const dimensions=await page.locator('#gift-card').boundingBox();expect(dimensions!.width).toBe(192);expect(dimensions!.height).toBe(336);
  const pdf=await page.pdf({preferCSSPageSize:true,printBackground:true});
  const media=pdf.toString('latin1').match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  expect(media).not.toBeNull();expect(Number(media![1])).toBeCloseTo(144,0);expect(Number(media![2])).toBeCloseTo(252,0);
});
