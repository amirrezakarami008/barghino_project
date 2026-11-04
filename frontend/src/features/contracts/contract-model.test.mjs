import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('./contract-model.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { ContractDataError, contractDisplayTitle, eligibility, formatDecimal, occupiedBranchIds, parseContract, parsePage, parsePlan, sellerDisplayName, signedSnapshot } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const documentSource = readFileSync(new URL('./contract-document.ts', import.meta.url), 'utf8');
const documentCompiled = ts.transpileModule(documentSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { CONTRACT_TERMS_VERSION, buildContractDocumentText, sha256Hex } = await import(`data:text/javascript;base64,${Buffer.from(documentCompiled.replace('./contract-model', `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)).toString('base64')}`);

function contract(overrides = {}) {
  return { uuid:'contract-a',status:'draft',plant_name:'نام فعلی',plant_uuid:'plant-a',branch_uuid:'branch-a',bill_id:'123',branch_address:'نشانی فعلی',seller_identity:{kind:'individual',first_name:'نام فعلی'},plan_name:'پلن ذخیره‌شده',commitment_kwh:'12345678901.123',rate_toman_per_kwh:'2300.005',created_at:'2026-10-28T10:00:00Z',updated_at:'2026-10-28T10:00:00Z',history:[],...overrides };
}
test('formats decimal strings without numeric rounding',()=>assert.equal(formatDecimal('12345678901.123'),'۱۲٬۳۴۵٬۶۷۸٬۹۰۱٫۱۲۳'));
test('preserves explicitly supplied decimal precision and missing values',()=>{assert.equal(formatDecimal('0.001'),'۰٫۰۰۱');assert.equal(formatDecimal(null),'—');assert.equal(parseContract(contract()).rate,'2300.005');});
test('only active plant and active branch are eligible',()=>{assert.equal(eligibility({plant:{status:'active'},branch:{status:'active'}}),null);assert.match(eligibility({plant:{status:'pending'},branch:{status:'active'}}),/نیروگاه/);assert.match(eligibility({plant:{status:'active'},branch:{status:'pending'}}),/انشعاب/);assert.match(eligibility({plant:{status:'active'},branch:null}),/در دسترس نیست/);});
test('open contracts occupy their branch; cancelled and expired free it',()=>{
  const open=occupiedBranchIds([parseContract(contract()),parseContract(contract({uuid:'b',status:'pending',branch_uuid:'branch-b'}))]);
  assert.equal(open.has('branch-a'),true);assert.equal(open.has('branch-b'),true);
  const freed=occupiedBranchIds([parseContract(contract({status:'cancelled'})),parseContract(contract({uuid:'c',status:'expired',branch_uuid:'branch-c'}))]);
  assert.equal(freed.size,0);
});
test('prefers API title and maps capacity/scheme fields from list payload',()=>{
  const data=parseContract(contract({title:'400.000 kWp — استاندارد',plant_name:'',plant_capacity_kwp:400,plant_scheme_type:'residential',plant_system_type:'on_grid',contract_number:null}));
  assert.equal(contractDisplayTitle(data),'400.000 kWp — استاندارد');
  assert.equal(data.capacity,'400');
  assert.equal(data.schemeType,'residential');
  assert.equal(data.systemType,'on_grid');
  assert.equal(sellerDisplayName(data.seller),'نام فعلی');
  assert.equal(data.renewalRequested,false);
  assert.equal(data.isNearExpiry,false);
});
test('maps renewal and term date fields from staff payloads',()=>{
  const data=parseContract(contract({
    starts_on:'2026-01-01',
    ends_on:'2027-01-01',
    is_near_expiry:true,
    renewal_requested:true,
    renewal_requested_at:'2026-12-01T10:00:00Z',
  }));
  assert.equal(data.startsOn,'2026-01-01');
  assert.equal(data.endsOn,'2027-01-01');
  assert.equal(data.isNearExpiry,true);
  assert.equal(data.renewalRequested,true);
  assert.equal(data.renewalRequestedAt,'2026-12-01T10:00:00Z');
});
test('uses immutable signed snapshot instead of current seller or plant',()=>{const data=parseContract(contract({status:'active',history:[{uuid:'event-a',event_type:'signed',from_status:'draft',to_status:'pending',created_at:'2026-10-28T11:00:00Z',details:{contract_snapshot:{seller:{kind:'individual',first_name:'نام زمان امضا',last_name:'آزمایشی',national_id:'0000000000'},plant:{uuid:'plant-a',name:'نیروگاه زمان امضا',capacity_kwp:'5.000'},branch:{uuid:'branch-a',bill_id:'456',address:'نشانی زمان امضا'},commercial_terms:{plan_name:'پلن زمان امضا',commitment_kwh:'100.003',rate_toman_per_kwh:'2000.001'}}}}]}));assert.equal(signedSnapshot(data).seller.first_name,'نام زمان امضا');assert.equal(signedSnapshot(data).plant.name,'نیروگاه زمان امضا');assert.equal(signedSnapshot(data).terms.rate,'2000.001');});
test('never treats incomplete signing evidence as a signed snapshot',()=>{const data=parseContract(contract({history:[{uuid:'event-a',event_type:'signed',created_at:'2026-10-28T11:00:00Z',details:{contract_snapshot:{seller:{first_name:'ناقص'}}}}]}));assert.equal(signedSnapshot(data),null);});
test('rejects malformed financial responses at API boundary',()=>{assert.throws(()=>parseContract(contract({rate_toman_per_kwh:'NaN'})),ContractDataError);assert.throws(()=>parseContract(contract({history:{}})),ContractDataError);});
test('retains unknown lifecycle status safely for presentation fallback',()=>assert.equal(parseContract(contract({status:'future_status'})).status,'future_status'));
test('pagination preserves server navigation flags without following remote URLs',()=>assert.deepEqual(parsePage({count:2,next:'https://other.invalid/leak',previous:null,results:[1]},item=>item),{count:2,next:true,previous:false,results:[1]}));
test('rejects malformed pagination and plan booleans',()=>{assert.throws(()=>parsePage({count:-1,next:null,previous:null,results:[]},item=>item),ContractDataError);assert.throws(()=>parsePlan({uuid:'plan',name:'پلن',is_active:'true',is_recommended:false,benefits:[]}),ContractDataError);});
test('client document template is stable and hashable',async()=>{
  assert.equal(CONTRACT_TERMS_VERSION,'v1');
  const text=buildContractDocumentText(parseContract(contract({seller_identity:{kind:'individual',first_name:'علی',last_name:'محمدی',national_id:'0012345678'}})));
  assert.match(text,/نسخه سند: v1/);
  assert.match(text,/علی محمدی/);
  assert.match(text,/پلن ذخیره‌شده/);
  const again=buildContractDocumentText(parseContract(contract({seller_identity:{kind:'individual',first_name:'علی',last_name:'محمدی',national_id:'0012345678'}})));
  assert.equal(text,again);
  const expected=createHash('sha256').update(text,'utf8').digest('hex');
  assert.equal(await sha256Hex(text),expected);
});
