import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('./contract-model.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { ContractDataError, eligibility, formatDecimal, parseContract, parsePage, parsePlan, signedSnapshot } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

function contract(overrides = {}) {
  return { uuid:'contract-a',status:'draft',plant_name:'نام فعلی',plant_uuid:'plant-a',branch_uuid:'branch-a',meter_number:'123',branch_address:'نشانی فعلی',seller_identity:{kind:'individual',first_name:'نام فعلی'},plan_name:'پلن ذخیره‌شده',commitment_kwh:'12345678901.123',rate_toman_per_kwh:'2300.005',created_at:'2026-10-28T10:00:00Z',updated_at:'2026-10-28T10:00:00Z',history:[],...overrides };
}
test('formats decimal strings without numeric rounding',()=>assert.equal(formatDecimal('12345678901.123'),'۱۲٬۳۴۵٬۶۷۸٬۹۰۱٫۱۲۳'));
test('preserves explicitly supplied decimal precision and missing values',()=>{assert.equal(formatDecimal('0.001'),'۰٫۰۰۱');assert.equal(formatDecimal(null),'—');assert.equal(parseContract(contract()).rate,'2300.005');});
test('only active plant and active branch are eligible',()=>{assert.equal(eligibility({plant:{status:'active'},branch:{status:'active'}}),null);assert.match(eligibility({plant:{status:'pending'},branch:{status:'active'}}),/نیروگاه/);assert.match(eligibility({plant:{status:'active'},branch:{status:'pending'}}),/انشعاب/);assert.match(eligibility({plant:{status:'active'},branch:null}),/در دسترس نیست/);});
test('uses immutable signed snapshot instead of current seller or plant',()=>{const data=parseContract(contract({status:'active',history:[{uuid:'event-a',event_type:'signed',from_status:'draft',to_status:'pending',created_at:'2026-10-28T11:00:00Z',details:{contract_snapshot:{seller:{kind:'individual',first_name:'نام زمان امضا',last_name:'آزمایشی',national_id:'0000000000'},plant:{uuid:'plant-a',name:'نیروگاه زمان امضا',capacity_kwp:'5.000'},branch:{uuid:'branch-a',meter_number:'456',address:'نشانی زمان امضا'},commercial_terms:{plan_name:'پلن زمان امضا',commitment_kwh:'100.003',rate_toman_per_kwh:'2000.001'}}}}]}));assert.equal(signedSnapshot(data).seller.first_name,'نام زمان امضا');assert.equal(signedSnapshot(data).plant.name,'نیروگاه زمان امضا');assert.equal(signedSnapshot(data).terms.rate,'2000.001');});
test('never treats incomplete signing evidence as a signed snapshot',()=>{const data=parseContract(contract({history:[{uuid:'event-a',event_type:'signed',created_at:'2026-10-28T11:00:00Z',details:{contract_snapshot:{seller:{first_name:'ناقص'}}}}]}));assert.equal(signedSnapshot(data),null);});
test('rejects malformed financial responses at API boundary',()=>{assert.throws(()=>parseContract(contract({rate_toman_per_kwh:'NaN'})),ContractDataError);assert.throws(()=>parseContract(contract({history:{}})),ContractDataError);});
test('retains unknown lifecycle status safely for presentation fallback',()=>assert.equal(parseContract(contract({status:'future_status'})).status,'future_status'));
test('pagination preserves server navigation flags without following remote URLs',()=>assert.deepEqual(parsePage({count:2,next:'https://other.invalid/leak',previous:null,results:[1]},item=>item),{count:2,next:true,previous:false,results:[1]}));
test('rejects malformed pagination and plan booleans',()=>{assert.throws(()=>parsePage({count:-1,next:null,previous:null,results:[]},item=>item),ContractDataError);assert.throws(()=>parsePlan({uuid:'plan',name:'پلن',is_active:'true',is_recommended:false,benefits:[]}),ContractDataError);});
