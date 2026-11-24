import {test,expect} from '@playwright/test';
for(const width of [320,390,768,1440]){
 test(`portrait introduction ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  const portrait=page.getByRole('img',{name:'Kimberly Ann in a floral dress'});
  await expect(portrait).toBeVisible();
  await expect.poll(()=>portrait.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBe(1000);
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/portrait-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'A letter is waiting',exact:true}).click();
  await expect(page.getByRole('button',{name:'Open your birthday letter',exact:true})).toBeVisible();
 });
}
