import { test, expect } from '@playwright/test';

test('complete keepsake journey with controls and replay', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button',{name:'A letter is waiting',exact:true}).click();
  await expect(page.getByRole('heading', {name: /Kimberly Ann/})).toBeVisible();
  await page.getByRole('button',{name:'Open your birthday letter'}).click();
  await expect(page.locator('#letter-title')).toHaveText('The birthday letter', {timeout:10000});
  await expect(page.getByRole('button',{name:'Pause narration',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Sound settings',exact:true}).click();
  await expect(page.getByLabel('Gentle sound effects')).toBeChecked();
  await page.getByLabel('Gentle sound effects').uncheck();
  await page.getByLabel('Volume',{exact:true}).fill('0.3');
  await page.getByRole('button',{name:'Close sound settings'}).click();
  await page.getByRole('button',{name:'Cinematic mode',exact:true}).click();
  await expect(page.getByRole('button',{name:'Reading mode',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'All letters',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Words to come back to.'})).toBeVisible();
  await page.locator('.collection').getByRole('button',{name:/03 What you mean to me/}).click();
  await expect(page.locator('#letter-title')).toHaveText('What you mean to me');
  await page.getByRole('button',{name:'Previous letter',exact:true}).click();
  await expect(page.locator('#letter-title')).toHaveText('Things I appreciate about you');
  for (const title of ['What you mean to me','My wishes for you','One last thing']) {
    await page.getByRole('button',{name:'Next letter',exact:true}).click();
    await expect(page.locator('#letter-title')).toHaveText(title);
  }
  await page.getByRole('button',{name:'One final wish',exact:true}).click();
  await expect(page.getByRole('heading',{name:/next beautiful chapter/})).toBeVisible();
  await page.getByRole('button',{name:'Open it all again',exact:true}).click();
  await expect(page.getByRole('button',{name:'A letter is waiting',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [320,390,768,1440]) {
  test(`responsive layout ${width} and reduced-motion journey`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/');
  await page.getByRole('button',{name:'A letter is waiting',exact:true}).click();
    await expect(page.getByRole('button',{name:'Open your birthday letter'})).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/welcome-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Open your birthday letter'}).click();
    await expect(page.locator('#letter-title')).toBeVisible();
    await expect(page.locator('.reading-layout')).toHaveCSS('opacity','1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/letter-${width}.png`,fullPage:true});
    await page.locator('#main').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#letter-title')).toHaveText('Things I appreciate about you');
  });
}




test('opening letter stays opaque and in front of the welcome copy', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await page.getByRole('button',{name:'A letter is waiting',exact:true}).click();
  await page.getByRole('button',{name:'Open your birthday letter'}).click();
  await expect(page.locator('.envelope')).toBeDisabled();
  await expect(page.locator('.envelope')).toHaveCSS('opacity','1');
  await page.waitForFunction(()=>{
    const el=document.querySelector('.insert');
    return el && new DOMMatrix(getComputedStyle(el).transform).m42 < -110;
  });
  const layering=await page.evaluate(()=>{
    const paper=document.querySelector('.insert')!;
    const r=paper.getBoundingClientRect();
    const stack=document.elementsFromPoint(r.x+r.width/2,r.y+30);
    const paperIndex=stack.findIndex(el=>el===paper||paper.contains(el));
    const textIndex=stack.findIndex(el=>el.closest('.welcome-heading'));
    return {paperIndex,textIndex,opacity:getComputedStyle(document.querySelector('.envelope')!).opacity};
  });
  expect(layering.paperIndex).toBeGreaterThanOrEqual(0);
  expect(layering.textIndex===-1||layering.paperIndex<layering.textIndex).toBe(true);
  expect(layering.opacity).toBe('1');
  await page.screenshot({path:'test-results/envelope-opening.png'});
  await expect(page.locator('#letter-title')).toHaveText('The birthday letter');
});

