import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const modulePath=process.env.CONTRACT_PLAYWRIGHT_MODULE;
const {chromium}=await import(modulePath?pathToFileURL(`${modulePath}/index.mjs`).href:'playwright');
const {expect}=await import(modulePath?pathToFileURL(`${modulePath}/test.mjs`).href:'playwright/test');
const baseUrl=process.env.CONTRACT_BASE_URL||'http://localhost:3000';
const output=process.env.ADMIN_PLANT_SCREENSHOTS||'/tmp/barghino-admin-plants';fs.mkdirSync(output,{recursive:true});
const ids={owner:'10000000-0000-4000-8000-000000000001',other:'10000000-0000-4000-8000-000000000002',admin:'10000000-0000-4000-8000-000000000003',branch:'20000000-0000-4000-8000-000000000001',branch2:'20000000-0000-4000-8000-000000000002',plant:'30000000-0000-4000-8000-000000000001',new:'30000000-0000-4000-8000-000000000004'};
const branches=[{uuid:ids.branch,owner_uuid:ids.owner,owner_phone:'09120000001',name:'انشعاب آفتاب',meter_number:'123456789',address:'نشانی انشعاب',status:'active',review_note:''},{uuid:ids.branch2,owner_uuid:ids.other,owner_phone:'09120000002',name:'انشعاب دوم',meter_number:'987654321',address:'نشانی دوم',status:'active',review_note:''}];
function plant(uuid,name,status,branch=branches[0]){return{uuid,name,status,branch_uuid:branch.uuid,owner_uuid:branch.owner_uuid,owner_phone:branch.owner_phone,address:'نشانی نیروگاه آزمایشی',capacity_kwp:'5.500',commissioned_at:null,review_note:'',created_at:'2026-10-28T10:00:00Z'};}
const initial=[plant(ids.plant,'نیروگاه آفتاب','pending'),plant('30000000-0000-4000-8000-000000000002','نیروگاه فعال','active',branches[1]),plant('30000000-0000-4000-8000-000000000003','نیروگاه غیرفعال','inactive')];
const pageOf=rows=>({count:rows.length,next:null,previous:null,results:rows});
let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const admin=await browser.newContext({viewport:{width:1440,height:1000},locale:'fa-IR',reducedMotion:'reduce'});
 let rows=structuredClone(initial),postCount=0,patchCount=0,deleteCount=0,reviewCount=0,listError=false;const errors=[];
 await admin.addInitScript(user=>localStorage.setItem('barghino.session',JSON.stringify({access:'isolated-admin',refresh:'isolated-refresh',user})),{uuid:ids.admin,phone:'09120000003',role:'admin',path:'sell',accountType:'individual'});
 await admin.route('**/api/v1/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname,method=req.method(),reply=(status,json)=>route.fulfill({status,json});
  if(path==='/api/v1/auth/me/')return reply(200,{uuid:ids.admin,phone:'09120000003',role:'admin',first_name:'مدیر',last_name:'آزمایشی',account_type:'individual',path:'sell',identity_profile_completion:{is_complete:true,missing_fields:[]}});
  if(path==='/api/v1/staff/branches/'){
   let matches=branches;if(url.searchParams.has('owner_uuid'))matches=matches.filter(b=>b.owner_uuid===url.searchParams.get('owner_uuid'));return reply(200,pageOf(matches));
  }
  if(path==='/api/v1/staff/plants/'&&method==='GET'){
   if(listError)return reply(503,{error:{code:'error',detail:'Technical backend error'}});
   let matches=rows;const status=url.searchParams.get('status')||'pending',search=url.searchParams.get('search');if(status!=='all')matches=matches.filter(p=>p.status===status);if(search)matches=matches.filter(p=>p.name.includes(search)||p.owner_phone.includes(search));return reply(200,pageOf(matches));
  }
  if(path==='/api/v1/staff/plants/'&&method==='POST'){
   postCount++;const data=req.postDataJSON();assert.equal(data.branch_uuid,ids.branch);assert.equal(data.capacity_kwp,'6.125');assert.equal(data.owner_uuid,undefined);const row={...plant(ids.new,data.name,'pending'),...data};rows.unshift(row);return reply(201,row);
  }
  if(path.startsWith('/api/v1/staff/plants/')){
   const row=rows.find(p=>path.includes(p.uuid));assert.ok(row);
   if(path.endsWith('/review/')){reviewCount++;const data=req.postDataJSON();assert.ok(data.decision==='approved'||data.reason.trim());row.status=data.decision==='approved'?'active':'inactive';row.review_note=data.reason||'';return reply(200,row);}
   if(method==='PATCH'){patchCount++;Object.assign(row,req.postDataJSON(),{status:'pending'});return reply(200,row);}
   if(method==='DELETE'){deleteCount++;rows=rows.filter(p=>p!==row);return route.fulfill({status:204});}
   return reply(200,row);
  }
  throw Error('Unexpected API '+method+' '+path);
 });
 const p=await admin.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(baseUrl+'/admin/plants');await expect(p.locator('.admin-plant-card')).toHaveCount(3);await expect(p.getByRole('navigation',{name:'منوی مدیر'}).getByRole('link',{name:'نیروگاه‌ها',exact:true})).toBeVisible();
 await p.getByRole('combobox',{name:'وضعیت نیروگاه‌ها'}).selectOption('pending');await expect(p.locator('.admin-plant-card')).toHaveCount(1);await p.getByRole('combobox',{name:'وضعیت نیروگاه‌ها'}).selectOption('all');await p.getByRole('searchbox',{name:'جست‌وجوی نیروگاه‌ها'}).fill('فعال');await expect(p.locator('.admin-plant-card')).toHaveCount(2);await p.getByRole('searchbox',{name:'جست‌وجوی نیروگاه‌ها'}).fill('');await expect(p.locator('.admin-plant-card')).toHaveCount(3);
 await p.getByRole('button',{name:'ثبت نیروگاه',exact:true}).click();let dialog=p.getByRole('dialog');await expect(dialog).toBeVisible();await dialog.getByLabel('نام نیروگاه',{exact:true}).fill('نیروگاه مدیریت‌شده');await dialog.getByLabel('ظرفیت نصب‌شده (kWp)').fill('۶٫۱۲۵');await dialog.getByLabel('نشانی نیروگاه',{exact:true}).fill('نشانی ثبت توسط مدیر');await dialog.getByRole('radio',{name:/انشعاب آفتاب/}).check();await p.addStyleTag({content:'nextjs-portal{display:none!important}'});await p.screenshot({path:output+'/create-dialog.png'});await dialog.getByRole('button',{name:'ذخیره نیروگاه',exact:true}).dblclick();await expect(dialog).toHaveCount(0);await expect(p.getByRole('heading',{name:'نیروگاه مدیریت‌شده',exact:true})).toBeVisible();assert.equal(postCount,1);
 await p.getByRole('button',{name:'ویرایش نیروگاه نیروگاه مدیریت‌شده',exact:true}).click();dialog=p.getByRole('dialog');await dialog.getByLabel('نام نیروگاه',{exact:true}).fill('نیروگاه ویرایش‌شده');await expect(dialog.getByRole('radio')).toHaveCount(1);await dialog.getByRole('button',{name:'ذخیره نیروگاه',exact:true}).click();await expect(dialog).toHaveCount(0);assert.equal(patchCount,1);
 await p.getByRole('button',{name:'بررسی نیروگاه ویرایش‌شده',exact:true}).click();await p.getByRole('dialog').getByRole('button',{name:'ثبت تصمیم',exact:true}).click();await expect(p.getByRole('dialog')).toHaveCount(0);await expect(p.getByRole('button',{name:'بررسی نیروگاه ویرایش‌شده',exact:true})).toHaveCount(0);
 await p.getByRole('button',{name:'بررسی نیروگاه آفتاب',exact:true}).click();dialog=p.getByRole('dialog');await dialog.getByRole('radio',{name:'رد درخواست',exact:true}).check();await dialog.getByRole('button',{name:'ثبت تصمیم',exact:true}).click();assert.equal(reviewCount,1);await dialog.getByRole('textbox').fill('نشانی نیاز به اصلاح دارد.');await dialog.getByRole('button',{name:'ثبت تصمیم',exact:true}).click();await expect(dialog).toHaveCount(0);await expect(p.getByText('نتیجهٔ بررسی: نشانی نیاز به اصلاح دارد.')).toBeVisible();assert.equal(reviewCount,2);
 const deleteTrigger=p.getByRole('button',{name:'حذف نیروگاه نیروگاه ویرایش‌شده',exact:true});await deleteTrigger.click();await p.keyboard.press('Escape');await expect(deleteTrigger).toBeFocused();await deleteTrigger.click();await p.getByRole('dialog').getByRole('button',{name:'تأیید حذف نیروگاه',exact:true}).click();await expect(p.getByRole('dialog')).toHaveCount(0);await expect(p.locator('.admin-plant-card')).toHaveCount(3);assert.equal(deleteCount,1);
 listError=true;await p.getByRole('button',{name:'تازه‌سازی',exact:true}).click();await expect(p.getByRole('main').getByRole('alert')).toBeVisible();listError=false;await p.getByRole('button',{name:'تلاش دوباره',exact:true}).click();await expect(p.locator('.admin-plant-card')).toHaveCount(3);
 for(const theme of ['dark','light']){
  if(await p.locator('.admin-shell').getAttribute('data-theme')!==theme)await p.getByRole('button',{name:theme==='light'?'روشن کردن پوسته':'تاریک کردن پوسته',exact:true}).click();
  for(const width of [375,430,768,1280,1440]){
   await p.setViewportSize({width,height:1000});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Admin overflow '+theme+' '+width);
   if(width===375||width===1440){await p.addStyleTag({content:'nextjs-portal{display:none!important}'});await p.screenshot({path:output+'/'+theme+'-'+width+'.png',fullPage:true});}
   await p.getByRole('button',{name:'ثبت نیروگاه',exact:true}).click();const box=await p.getByRole('dialog').boundingBox();assert.ok(Math.abs(box.x+box.width/2-width/2)<2);assert.ok(box.width<=width);await p.keyboard.press('Escape');
  }
 }
 const user=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await user.addInitScript(uuid=>localStorage.setItem('barghino.session',JSON.stringify({access:'isolated-user',refresh:'refresh',user:{uuid,phone:'09120000001',role:'user',path:'sell',accountType:'individual'}})),ids.owner);
 await user.route('**/api/v1/auth/me/',route=>route.fulfill({status:200,json:{uuid:ids.owner,phone:'09120000001',role:'user',first_name:'کاربر',last_name:'آزمایشی',account_type:'individual',path:'sell'}}));
 const u=await user.newPage();u.on('pageerror',e=>errors.push(e.message));await u.goto(baseUrl+'/panel');const nav=u.getByRole('navigation',{name:'منوی پنل'});await expect(nav.locator('[aria-disabled=true]')).toHaveCount(8);await expect(nav.getByRole('link')).toHaveCount(4);await expect(u.getByRole('link',{name:'اعلان‌ها',exact:true})).toHaveCount(0);await expect(u.getByRole('link',{name:'تماس با برقینو',exact:true})).toHaveAttribute('href','/contact');
 for(const slug of ['production','invoices','payments','install','documents','notifications','support','settings']){await u.goto(baseUrl+'/panel/'+slug);await expect(u.getByRole('heading',{name:'این بخش فعلاً قفل است'})).toBeVisible();}
 for(const width of [375,430,768,1280,1440]){await u.setViewportSize({width,height:1000});await u.goto(baseUrl+'/panel');await expect(u.getByRole('heading',{name:'قراردادهای من',exact:true})).toBeVisible();assert.equal(await u.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'User overflow '+width);}
 await u.setViewportSize({width:1440,height:1000});await u.addStyleTag({content:'nextjs-portal{display:none!important}'});await u.screenshot({path:output+'/user-locked-sidebar.png',fullPage:true});await u.goto(baseUrl+'/admin/plants');await expect(u).toHaveURL(/\/panel$/);assert.deepEqual(errors,[]);
 await user.close();await admin.close();console.log('PASS: staff inventory/search/filter, create/edit/delete, approval/rejection, modal focus/centering, dark/light five widths;8 locked panel routes and user admin denial. No live mutations.');
}finally{if(browser)await browser.close();}
