import {test,expect} from '@playwright/test';
const musicFiles=['there-is-romance-96.mp3','heartwarming.mp3','dream-culture.mp3'];
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  const elements:HTMLMediaElement[]=[];(window as unknown as {musicProbe:HTMLMediaElement[]}).musicProbe=elements;
  const original=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){if(!elements.includes(this))elements.push(this);return original.call(this);};
 });
});
const playingMusic=(page:import('@playwright/test').Page)=>page.evaluate(()=>(window as unknown as {musicProbe:HTMLMediaElement[]}).musicProbe.filter(a=>a.src.includes('/audio/music/')&&!a.paused).map(a=>a.src));
test('playlist starts after interaction, pauses for all letters and resumes on return',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.getByRole('button',{name:'A letter is waiting',exact:true}).click();
 await expect.poll(()=>playingMusic(page),{timeout:15000}).toHaveLength(1);
 const saved=await page.evaluate(()=>(window as unknown as {musicProbe:HTMLMediaElement[]}).musicProbe.find(a=>a.src.includes('/audio/music/')&&!a.paused)!.currentTime);
 await page.getByRole('button',{name:'Open your birthday letter'}).click();
 await expect(page.getByRole('button',{name:'Pause narration',exact:true})).toBeVisible();
 await expect.poll(()=>playingMusic(page),{timeout:15000}).toHaveLength(0);
 await page.getByRole('button',{name:'Pause narration',exact:true}).click();
 expect(await playingMusic(page)).toHaveLength(0);
 await page.getByRole('button',{name:'Return to the birthday introduction',exact:true}).click();
 await expect.poll(()=>playingMusic(page),{timeout:15000}).toHaveLength(1);
 expect(await page.evaluate(()=>(window as unknown as {musicProbe:HTMLMediaElement[]}).musicProbe.find(a=>a.src.includes('/audio/music/')&&!a.paused)!.currentTime)).toBeGreaterThanOrEqual(saved);
 await page.getByRole('button',{name:'Sound settings',exact:true}).click();
 await page.getByLabel('Background music',{exact:true}).uncheck();
 await expect.poll(()=>playingMusic(page),{timeout:15000}).toHaveLength(0);
 await page.getByLabel('Background music',{exact:true}).check();
 await expect.poll(()=>playingMusic(page),{timeout:15000}).toHaveLength(1);
});
test('three tracks advance automatically and wrap back to the first',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'A letter is waiting',exact:true}).click();
 for(const [index,file] of [...musicFiles,musicFiles[0]].entries()){
  await expect.poll(async()=> (await playingMusic(page))[0] || '',{timeout:15000}).toContain(file);
  if(index<3){
   // Advance the native playhead to test the actual end of the track.
   await page.evaluate(()=>{const a=(window as unknown as {musicProbe:HTMLMediaElement[]}).musicProbe.find(a=>a.src.includes('/audio/music/')&&!a.paused)!;a.currentTime=a.duration-.1;});
  }
 }
 expect(await playingMusic(page)).toHaveLength(1);
});

