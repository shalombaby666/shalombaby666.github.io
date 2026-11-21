import {projects} from './projects.js?v=additions1';
import {getDossier,caseImage,esc} from './case-dossiers.js?v=additions1';
import {resumeMarkup,certificates} from './print-data.js?v=additions1';
const $=s=>document.querySelector(s),base='https://shalombaby666.github.io/';
const absolute=path=>new URL(path,base).href;
$('#case-id').innerHTML=projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
const params=new URLSearchParams(location.search);
for(const [selector,key,allowed] of [['#document-view','view',['resume','portfolio','case']],['#paper-size','paper',['A4','A5','Letter']],['#orientation','orientation',['portrait','landscape']]])if(allowed.includes(params.get(key)))$(selector).value=params.get(key);
if(projects.some(p=>p.id===params.get('id')))$('#case-id').value=params.get('id');
$('#print-images').checked=params.get('images')==='1';
function caseMarkup(p,images){
 const d=getDossier(p),image=caseImage(p);
 return `<article class="print-case" id="print-${p.id}"><header><p class="document-label">${esc(d.context)} · ${esc(p.status)}</p><h2>${esc(p.name)}</h2><p class="print-tags">${p.tags.map(esc).join(' · ')}</p></header><section><h3>Задача</h3><p>${esc(d.problem)}</p>${d.role?`<h3>Роль и состав работы</h3><p>${esc(d.role)}</p>`:''}</section><section><h3>Что сделано</h3><ul>${d.decisions.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${d.scenario.length?`<h3>Сценарий</h3><ol>${d.scenario.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>`:''}</section><section><h3>Результат</h3>${d.facts?`<dl class="print-facts">${d.facts.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`:''}<p>${esc(d.result)}</p><h3>Вывод</h3><p>${esc(d.conclusion)}</p><h3>Ограничения</h3><p>${esc(d.limits)}</p>${d.next?`<h3>Следующий шаг</h3><p>${esc(d.next)}</p>`:''}</section><section><h3>Материалы</h3><ul>${d.proof.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><p class="print-links"><a href="${base}#project=${p.id}">Кейс на сайте</a>${p.url?` · <a href="${absolute(p.url)}">Демо / материалы</a>`:''}${p.github?` · <a href="${esc(p.github)}">Репозиторий</a>`:''}</p></section>${images&&image?`<figure><img src="${image}" alt="Материалы ${esc(p.name)}">${p.imageCaption?`<figcaption>${esc(p.imageCaption)}</figcaption>`:''}</figure>`:''}</article>`;
}
function render(){
 const view=$('#document-view').value,paper=$('#paper-size').value,orientation=$('#orientation').value,images=$('#print-images').checked;
 $('#case-picker').hidden=view!=='case';$('#print-images').disabled=view==='resume';
 const widths={A4:[210,297],A5:[148,210],Letter:[215.9,279.4]};const size=widths[paper][orientation==='landscape'?1:0];
 document.documentElement.style.setProperty('--paper-width',size+'mm');document.body.dataset.paper=paper;document.body.dataset.view=view;
 $('#page-settings').textContent=`@page{size:${paper} ${orientation};margin:${paper==='A5'?9:12}mm}`;
 const selected=projects.find(p=>p.id===$('#case-id').value)||projects[0];
 if(view==='resume')$('#paper').innerHTML=resumeMarkup;
 else if(view==='case')$('#paper').innerHTML=`<section class="sheet"><p class="print-author">Денис Петров · <a href="https://t.me/shalombaby777">@shalombaby777</a></p>${caseMarkup(selected,images)}</section>`;
 else $('#paper').innerHTML=`<section class="sheet"><header class="portfolio-print-heading"><h1>Денис Петров</h1><p class="subtitle">Портфолио · аналитика данных и систем</p><p>18 лет. Второй курс, бизнес-аналитика. Ищу первую работу аналитиком данных или системным аналитиком. Английский — B2.</p><p><a href="${base}">Портфолио</a> · <a href="https://t.me/shalombaby777">Telegram: @shalombaby777</a></p></header>${projects.map(p=>caseMarkup(p,images)).join('')}<article class="print-materials"><h2>Учебные работы и доклады</h2><ul><li><a href="${absolute('materials/kpi/kpi.pdf')}">KPI менеджера по продажам — 8 слайдов</a></li><li>SWOT магазина фототоваров — <a href="${base}#materials">краткий разбор на сайте</a></li><li><a href="${absolute('materials/sanctions/sanctions.pdf')}">Экстерналии санкционного воздействия — 15 слайдов</a></li></ul><h2>Сертификаты Stepik</h2><ul>${certificates.map(c=>`<li><a href="${c.url}">${esc(c.title)}</a> · ${c.date.slice(0,4)}</li>`).join('')}</ul></article></section>`;
 const title=view==='resume'?'Краткое резюме':view==='portfolio'?'Подробное портфолио':selected.name;
 document.title=`${title} — Денис Петров`;
 $('#preview-status').textContent=`${title} · ${paper} · ${orientation==='portrait'?'книжная':'альбомная'}${view!=='resume'&&images?' · с иллюстрациями':''}`;
 const q=new URLSearchParams({view,paper,orientation});if(view==='case')q.set('id',selected.id);if(images&&view!=='resume')q.set('images','1');history.replaceState(null,'',location.pathname+'?'+q);
}
$('#print-options').onchange=render;$('#print-options').onsubmit=e=>e.preventDefault();
$('#print-button').onclick=async()=>{
 const button=$('#print-button');button.disabled=true;
 try{await document.fonts.ready;await Promise.all([...$('#paper').querySelectorAll('img')].map(img=>img.decode().catch(()=>{})));window.print();}
 finally{button.disabled=false;}
};
render();
