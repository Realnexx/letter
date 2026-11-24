import {test,expect} from '@playwright/test';
import {messages} from '../src/data/messages';
for(const mode of ['reading','cinematic']){
 for(const reduced of ['reduce','no-preference'] as const){
  test(`spoken words follow the mobile viewport in ${mode}, motion ${reduced}`,async({page})=>{
   await page.setViewportSize({width:390,height:740});
   await page.emulateMedia({reducedMotion:reduced});
   await page.goto('/');
   await page.getByRole('button',{name:'A letter is waiting',exact:true}).click();
   await page.getByRole('button',{name:'Open your birthday letter',exact:true}).click();
   await expect(page.locator('#letter-title')).toBeVisible({timeout:10000});
   await page.getByRole('button',{name:'All letters',exact:true}).click();
   await page.locator('.collection').getByRole('button',{name:/04 My wishes for you/}).click();
   if(mode==='cinematic')await page.getByRole('button',{name:'Cinematic mode',exact:true}).click();
   await expect(page.getByRole('button',{name:'Pause narration',exact:true})).toBeVisible();
   const cue=messages[3].words!.find(w=>w.block==='paragraph-3')!;
   await page.getByRole('slider',{name:'Narration position'}).fill(cue.start.toFixed(2));
   // Simulate the reader scrolling away while the late paragraph is being narrated.
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   await expect.poll(()=>page.locator('.is-speaking').evaluateAll(elements=>elements.some(el=>{
    const r=el.getBoundingClientRect();return r.top>=60&&r.bottom<=innerHeight-60&&scrollY>500;
   })),{timeout:7000}).toBe(true);
   await page.screenshot({path:`test-results/scroll-${mode}-${reduced}.png`});
   await page.getByRole('button',{name:'Pause narration',exact:true}).click();
  });
 }
}
