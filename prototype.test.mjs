import test from 'node:test';
import assert from 'node:assert/strict';
import {tokenQuantity,tokenCost,formatReferencePrice} from '../src/lib/math.ts';
import {ASSETS,CATEGORIES} from '../src/data/assets.ts';
import {demoExplain} from '../server/ai.ts';
test('fractional token calculator allocates whole sample units with correct remainder',()=>{
 assert.equal(tokenQuantity(100,10),10);assert.equal(tokenQuantity(99.99,10),9);assert.equal(tokenQuantity(25,7),3);assert.equal(tokenCost(3,7),21);assert.equal(tokenQuantity(0,5),0);assert.equal(tokenQuantity(-3,5),0);assert.equal(tokenQuantity(Infinity,5),0);assert.equal(tokenQuantity(1e25,5),0);assert.equal(tokenQuantity(10,0),0);
 assert.equal(tokenCost(tokenQuantity(251,10),10),250);assert.equal(formatReferencePrice(4.345,'% annual yield'),'4.345%');assert.equal(formatReferencePrice(null,'USD / barrel'),'Unavailable');
 assert.throws(()=>tokenCost(-1,10),/Invalid/);
});
test('all educational catalogue assets have unique valid token ids and bounded risk heuristic',()=>{
 assert.equal(ASSETS.length,27);
 assert.equal(new Set(ASSETS.map(a=>a.id)).size,ASSETS.length);
 assert.equal(new Set(ASSETS.map(a=>a.tokenId)).size,ASSETS.length);
 for(const a of ASSETS){assert.ok(a.supply>0&&Number.isInteger(a.supply));assert.ok(a.tokenPrice>0);assert.ok(a.riskScore>=0&&a.riskScore<=100);assert.ok(CATEGORIES.includes(a.category));assert.ok(a.description&&a.driver&&a.downside)}
});
test('education fallback declares its demo mode and risks',()=>{
 const x=demoExplain('gold','Is it risky?',38);
 assert.equal(x.mode,'Educational demo');assert.match(x.answer,/Major risks/);assert.match(x.answer,/not calibrated against a live statistical model/i);assert.match(x.disclaimer,/not financial advice/i);
});
test('fallback handles unknown assets and drawdowns without inventing prices',()=>{
 const x=demoExplain('unknown','What does a 15% drawdown mean?',88);
 assert.match(x.answer,/fallen to \$85/);assert.match(x.answer,/historical volatility is not available/i);
});
