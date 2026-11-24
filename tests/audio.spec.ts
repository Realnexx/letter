import { test, expect } from '@playwright/test';
import { messages } from '../src/data/messages';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    const elements: HTMLMediaElement[]=[];
    (window as unknown as {narrationElements:HTMLMediaElement[]}).narrationElements=elements;
    const original=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){if(!elements.includes(this)) elements.push(this);return original.call(this);};
  });
});

for (const message of messages.filter(m=>m.audio && m.words?.length)) {
  test(`word highlighting, seek, pause, replay and cleanup: ${message.id}`, async ({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/');
    await page.getByRole('button',{name:'Open your birthday letter'}).click();
    await expect(page.locator('#letter-title')).toBeVisible();
    const index=messages.findIndex(m=>m.id===message.id);
    if(index>0) await page.getByRole('navigation',{name:'Letter chapters'}).getByRole('button',{name:`0${index+1} ${message.title}`,exact:true}).click();
    await expect(page.getByRole('button',{name:'Pause narration',exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Mute sound',exact:true})).toBeVisible();
    await expect.poll(()=>page.locator('.is-speaking').count()).toBe(1);
    await page.getByRole('button',{name:'Pause narration',exact:true}).click();
    const cue=message.words!.find(w=>w.block.startsWith('paragraph')&&w.end>w.start+.08)!;
    await page.getByRole('slider',{name:'Narration position'}).fill((cue.start+(cue.end-cue.start)/2).toFixed(2));
    const highlighted=page.locator(`.spoken-word[data-block="${cue.block}"][data-word="${cue.index}"]`);
    await expect(highlighted).toHaveClass(/is-speaking/);
    await page.screenshot({path:`test-results/narration-${message.id}.png`,fullPage:true});
    await page.getByRole('button',{name:'Replay narration',exact:true}).click();
    await expect(page.getByRole('button',{name:'Pause narration',exact:true})).toBeVisible();
    await expect.poll(async()=>Number(await page.getByRole('slider',{name:'Narration position'}).inputValue())).toBeLessThan(2);
    await page.getByRole('button',{name:index===4?'Previous letter':'Next letter',exact:true}).click();
    const next=messages[index===4?3:index+1];
    if(next.audio) await expect(page.getByRole('button',{name:'Pause narration',exact:true})).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>(window as unknown as {narrationElements:HTMLMediaElement[]}).narrationElements.filter(a=>!a.paused && a.src.includes('/audio/')).length)).toBe(next.audio?1:0);
  });
}



test('autoplay respects mute and changing volume does not resume paused narration',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('button',{name:'Mute sound',exact:true}).click();
  await page.getByRole('button',{name:'Open your birthday letter'}).click();
  await expect(page.getByRole('button',{name:'Pause narration',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>(window as unknown as {narrationElements:HTMLMediaElement[]}).narrationElements.filter(a=>!a.paused && a.src.includes('/audio/')).every(a=>a.volume===0))).toBe(true);
  await page.getByRole('button',{name:'Pause narration',exact:true}).click();
  await page.getByRole('button',{name:'Sound settings',exact:true}).click();
  await page.getByRole('slider',{name:'Volume',exact:true}).fill('0.4');
  await page.getByRole('button',{name:'Close sound settings'}).click();
  await expect(page.getByRole('button',{name:'Play narration',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>(window as unknown as {narrationElements:HTMLMediaElement[]}).narrationElements.filter(a=>!a.paused && a.src.includes('/audio/')).length)).toBe(0);
  await page.getByRole('button',{name:'Next letter',exact:true}).click();
  await expect(page.getByRole('button',{name:'Pause narration',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>(window as unknown as {narrationElements:HTMLMediaElement[]}).narrationElements.filter(a=>!a.paused && a.src.includes('/audio/')).every(a=>a.volume===0))).toBe(true);
});

test('browser autoplay restriction offers a working one-tap fallback',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLMediaElement.prototype.play;
    (window as unknown as {blockNarration:boolean}).blockNarration=true;
    HTMLMediaElement.prototype.play=function(){
      if(this.src.includes('/audio/vm1.mp3')&&(window as unknown as {blockNarration:boolean}).blockNarration) return Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));
      return original.call(this);
    };
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('button',{name:'Open your birthday letter'}).click();
  await expect(page.getByRole('status')).toHaveText('Tap play once to enable narration in this browser.');
  const play=page.getByRole('button',{name:'Play narration',exact:true});
  await expect(play).toBeEnabled();
  await page.evaluate(()=>(window as unknown as {blockNarration:boolean}).blockNarration=false);
  await play.click();
  await expect(page.getByRole('button',{name:'Pause narration',exact:true})).toBeVisible();
});
