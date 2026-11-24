import {test,expect} from '@playwright/test';
const endpoint='https://formsubmit.co/ajax/test-hidden-form-id-12345678';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Accept'};
const goToEnd=async(page:import('@playwright/test').Page)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'A letter is waiting',exact:true}).click();await page.getByRole('button',{name:'Open your birthday letter'}).click();await expect(page.locator('#letter-title')).toBeVisible({timeout:10000});await page.getByRole('button',{name:'All letters',exact:true}).click();await page.locator('.collection').getByRole('button',{name:/05 One last thing/}).click();await page.getByRole('button',{name:'One final wish',exact:true}).click();
};
test('visit notice and one notification per session; reply success is acknowledged only after delivery',async({page})=>{
 const events:Record<string,unknown>[]=[];
 await page.route('**/api/contact',route=>route.fulfill({json:{enabled:true,endpoint}}));
 await page.route(endpoint,route=>{if(route.request().method()==='OPTIONS')return route.fulfill({headers,status:204});const data=route.request().postDataJSON();events.push({...data,kind:String(data.event_id).split('/')[0]});return route.fulfill({headers,json:{success:'true'}});});
 await goToEnd(page);
 await expect.poll(()=>events.filter(x=>x.kind==='visit').length).toBe(1);
 await page.getByLabel('Your name (optional)').fill('Kimberly Ann');await page.getByLabel('Your message',{exact:true}).fill('Thank you for the birthday letters!');
 await expect(page.getByRole('button',{name:'Send my note',exact:true})).toBeDisabled();await page.getByLabel('I’m happy to send this message to the creator of this keepsake.').check();await page.getByRole('button',{name:'Send my note',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Your note has been sent. Thank you for writing back.');expect(events.filter(x=>x.kind==='reply')).toHaveLength(1);
 await page.reload();await expect(page.getByText('This keepsake notifies its creator when it is viewed.',{exact:false})).toBeVisible();expect(events.filter(x=>x.kind==='visit')).toHaveLength(1);
});
test('failed reply preserves her draft and provides a retry',async({page})=>{
 await page.route('**/api/contact',route=>route.fulfill({json:{enabled:true,endpoint}}));
 await page.route(endpoint,route=>route.fulfill(route.request().method()==='OPTIONS'?{headers,status:204}:{headers,contentType:'text/html',body:JSON.stringify({success:'false',message:'This form needs Activation.'})}));
 await goToEnd(page);await page.getByLabel('Your message',{exact:true}).fill('Please keep my words.');await page.getByLabel('I’m happy to send this message to the creator of this keepsake.').check();await page.getByRole('button',{name:'Send my note',exact:true}).click();await expect(page.getByRole('alert')).toContainText('could not be sent');await expect(page.getByLabel('Your message',{exact:true})).toHaveValue('Please keep my words.');await expect(page.getByRole('button',{name:'Send my note',exact:true})).toBeEnabled();
});
