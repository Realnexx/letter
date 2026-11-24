import { test, expect } from '@playwright/test';
import { messages } from '../src/data/messages';

for (const message of messages.filter(m=>m.audio && m.words?.length)) {
  test(`word highlighting, seek, pause, replay and cleanup: ${message.id}`, async ({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/');
    await page.getByRole('button',{name:'Open your birthday letter'}).click();
    await expect(page.locator('#letter-title')).toBeVisible();
    const index=messages.findIndex(m=>m.id===message.id);
    if(index>0) await page.getByRole('navigation',{name:'Letter chapters'}).getByRole('button',{name:`0${index+1} ${message.title}`,exact:true}).click();
    const play=page.getByRole('button',{name:'Play narration',exact:true});
    await expect(play).toBeEnabled();
    await play.click();
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
    await expect.poll(()=>page.evaluate(()=>[...document.querySelectorAll('audio')].filter(a=>!a.paused).length)).toBe(0);
  });
}


