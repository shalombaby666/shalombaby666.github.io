import {data} from './data.js?v=additions1';
const $=s=>document.querySelector(s),fmt=(n,d=0)=>Number(n).toLocaleString('ru-RU',{maximumFractionDigits:d,minimumFractionDigits:d});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('#print-report').onclick=()=>window.print();
const report=document.body.dataset.report;
if(report==='abc'){
 let view='count',selected='AZ';
 function render(){
  $('#abc-matrix').innerHTML=data.abc.cells.map(c=>`<button data-group="${c.group}" data-populated="${c.count>0}" aria-pressed="${selected===c.group}"><span class="group">${c.group}</span><strong>${view==='count'?fmt(c.count):fmt(c.share,1)+'%'}</strong></button>`).join('');
  const c=data.abc.cells.find(c=>c.group===selected);$('#abc-selection').textContent=`${c.group}: ${c.count} товаров, ${fmt(c.share,2)}% выручки. ${c.count?'Оценивать запасы стоит вместе с маржой, сезонностью и сроками поставки.':'При выбранной методике товаров в этой группе нет.'}`;
 }
 document.querySelectorAll('[data-abc]').forEach(b=>b.onclick=()=>{view=b.dataset.abc;document.querySelectorAll('[data-abc]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
 $('#abc-matrix').onclick=e=>{const b=e.target.closest('[data-group]');if(b){selected=b.dataset.group;render();}};render();
}
if(report==='retention'){
 const m=data.retention;$('#ml-auc').textContent=fmt(m.holdout_auc,3);
 $('#ml-models').innerHTML=m.models.map(x=>`<tr><td>${esc(x.model)}</td><td>${fmt(x.cv_auc_mean,3)}</td><td>± ${fmt(x.cv_auc_std,3)}</td></tr>`).join('');
 function render(){const row=m.thresholds.find(t=>t.threshold===Number($('#ml-threshold').value));const [[tn,fp],[fn,tp]]=row.matrix;$('#ml-confusion').innerHTML=[['Не вернулся: верный ответ',tn],['Не вернулся: предсказан возврат',fp],['Вернулся: пропущенный возврат',fn],['Вернулся: верный ответ',tp]].map(([s,n])=>`<div><span>${s}</span><strong>${fmt(n)}</strong></div>`).join('');$('#ml-threshold-note').textContent=`Precision класса «вернётся»: ${fmt(row.precision*100,1)}%. Recall: ${fmt(row.recall*100,1)}%. Наблюдений: ${tn+fp+fn+tp}. Порог меняет число ошибок, а не ROC AUC.`;}
 $('#ml-threshold').onchange=render;render();
}
if(report==='bank-audit'){
 $('#bank-pairs').textContent=data.bank.compared;$('#bank-issues').textContent=data.bank.disagreements;
 function render(){const all=data.bank.rows.filter(r=>r.metric===$('#bank-metric').value),rows=all.filter(r=>!$('#bank-only').checked||!r.matches);$('#bank-rows').innerHTML=rows.length?rows.map(r=>`<tr class="${r.matches?'':'issue'}"><td>${r.year}</td><td class="number">${fmt(r.detail,1)}</td><td class="number">${fmt(r.summary,1)}</td><td class="number">${fmt(r.delta,1)}</td><td>${r.matches?'Совпадает':'Расхождение'}</td></tr>`).join(''):'<tr><td colspan="5">Расхождений в этом показателе нет.</td></tr>';$('#bank-count').textContent=`Показано ${rows.length} из ${all.length} сравнений. Расхождений по выбранному показателю: ${all.filter(r=>!r.matches).length}.`;}
 $('#bank-metric').onchange=render;$('#bank-only').onchange=render;render();
}
if(report==='feedcalc'){
 function render(){const c=data.feed.cases[Number($('#feed-size').value)];$('#feed-total').textContent=fmt(c.total,2)+' ₽';$('#feed-cart').innerHTML=c.cart.map(i=>`<tr><td>${esc(i.name)}</td><td>${fmt(i.quantity,2)} ${esc(i.unit)}</td><td class="number">${fmt(i.price,2)}</td><td class="number">${fmt(i.total,2)}</td></tr>`).join('');$('#feed-missing').textContent=c.missing.length?'Нет в каталоге: '+c.missing.join(', ')+'. Позиции не включены в итог.':'Все требуемые позиции найдены в тестовом каталоге.';}
 $('#feed-size').onchange=render;render();
}
