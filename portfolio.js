import {projects} from './projects.js?v=games3';
import {renderCase} from './case-view.js?v=games3';
import {createFleet,shoot} from './battleship.js';
const $=s=>document.querySelector(s);
const symbols={sandfox:'░▒▓',two:'P1 P2',starman:'✦',snow:'❄',alfa:'→',repair:'m²',quality:'∑',bridge:'↔',sprouts:'♧',geo:'N E',minprav:'А Я'};
let category='Все',showAllProjects=false;
function projectHTML(p){const image=p.image||(['sandfox','two','starman','snow','sprouts','geo','minprav'].includes(p.id)?`assets/${p.id}-preview.png`:p.id==='alfa'?'assets/alfa-analytics.png':null);return `<article class="project" data-state="${p.status}"><button class="project-visual v-${p.visual}" data-case="${p.id}" aria-label="Открыть кейс ${p.name}"><span class="poster" data-symbol="${symbols[p.id]||'→'}"><strong>${p.name}</strong></span>${image?`<img src="${image}" alt="Материалы проекта ${p.name}" loading="lazy" onerror="this.hidden=true">`:''}<span class="project-status">${p.status}</span><span class="project-arrow" aria-hidden="true">↗</span></button><div class="project-meta"><span>${p.type} / ${p.subtitle}</span><span>${p.tags[0]}</span></div><h3>${p.name}</h3><p>${p.line}</p><ul class="project-stack" aria-label="Технологии проекта">${p.tags.slice(0,3).map(t=>`<li>${t}</li>`).join('')}</ul><div class="project-links"><button data-case="${p.id}">Разобрать кейс ↗</button>${p.url?`<a href="${p.url}" target="_blank" rel="noopener">${p.url.startsWith('reports.html')?'Открыть материалы':p.status==='Демо'?'Открыть демо':'Оригинальный артефакт'} ↗</a>`:''}</div></article>`;}
function render(){
 const q=$('#search').value.trim().toLocaleLowerCase('ru');
 const list=projects.filter(p=>(category==='Все'||p.type===category)&&`${p.name} ${p.description} ${p.tags.join(' ')}`.toLocaleLowerCase('ru').includes(q));
 const compact=category==='Все'&&!q;const visible=compact&&!showAllProjects?list.slice(0,6):list;
 $('#project-grid').innerHTML=visible.map(projectHTML).join('');
 $('#catalog-count').textContent=`Показано ${visible.length} из ${list.length}`;
 $('#empty').hidden=!!list.length;
 const more=$('#project-more');more.hidden=!compact||list.length<=6;more.textContent=showAllProjects?'Свернуть каталог':`Показать все проекты (${list.length})`;more.setAttribute('aria-expanded',String(showAllProjects));
}
$('#filters').innerHTML=['Все','Игры','Хакатоны','Данные','Автоматизация','Интерактив','Roblox'].map(c=>`<button data-filter="${c}" aria-pressed="${c==='Все'}">${c}</button>`).join('');
$('#filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(!b)return;category=b.dataset.filter;$('#filters').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();};$('#search').oninput=render;$('#project-more').onclick=()=>{showAllProjects=!showAllProjects;render();};render();
const dialog=$('#case-dialog');let returnHash='#work';
function openCase(id,updateHistory=true){
 const index=projects.findIndex(p=>p.id===id);if(index<0)return;
 if(!dialog.open)returnHash=location.hash.startsWith('#project=')?'#work':(location.hash||'#work');
 dialog.querySelectorAll('video').forEach(v=>v.pause());renderCase($('#project-detail'),projects[index],index,projects.length);
 dialog.setAttribute('aria-labelledby','case-title');if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
 const title=$('#case-title');title.tabIndex=-1;title.focus({preventScroll:true});
 if(updateHistory&&location.hash!=='#project='+id)history.pushState(null,'',location.pathname+location.search+'#project='+id);
}
document.addEventListener('click',e=>{
 const direct=e.target.closest('[data-case]');if(direct){openCase(direct.dataset.case);return;}
 const next=e.target.closest('[data-case-index]');if(next&&!next.disabled){const p=projects[Number(next.dataset.caseIndex)];if(p)openCase(p.id);return;}
 if(e.target.closest('[data-close-case]')){dialog.close();requestAnimationFrame(()=>$('#work').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));}
});
for(const d of [dialog,$('#game-dialog')]){d.querySelector('.close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});}
dialog.addEventListener('close',()=>{dialog.querySelectorAll('video').forEach(v=>v.pause());if(location.hash.startsWith('#project='))history.replaceState(null,'',location.pathname+location.search+returnHash);});
function deepLink(){if(location.hash.startsWith('#project=')){try{openCase(decodeURIComponent(location.hash.slice(9)),false);}catch{}}else if(dialog.open)dialog.close();}
window.addEventListener('hashchange',deepLink);deepLink();
try{document.body.classList.toggle('motion-off',localStorage.getItem('denis-motion')==='off');}catch{}
function motionState(){$('#motion').setAttribute('aria-pressed',String(document.body.classList.contains('motion-off')));$('#motion').title=document.body.classList.contains('motion-off')?'Включить анимации':'Отключить анимации';}motionState();$('#motion').onclick=()=>{document.body.classList.toggle('motion-off');try{localStorage.setItem('denis-motion',document.body.classList.contains('motion-off')?'off':'on');}catch{}motionState();};
let game,timer;
function reset(){clearTimeout(timer);game={enemy:createFleet(),own:createFleet(),playerShots:new Set(),enemyShots:new Set(),busy:false,done:false};$('#game-status').textContent='Ваш ход. Выберите клетку противника.';boards();}
function boards(){for(const side of ['enemy','own']){const shots=side==='enemy'?game.playerShots:game.enemyShots,ships=game[side].flat();$(`#${side}-board`).innerHTML=Array.from({length:64},(_,c)=>{const fired=shots.has(c),hit=fired&&ships.includes(c),visible=side==='own'&&ships.includes(c);return `<button class="cell ${hit?'hit':fired?'miss':visible?'ship':''}" ${side==='own'||fired||game.busy||game.done?'disabled':''} data-cell="${c}" aria-label="${'АБВГДЕЖЗ'[c%8]}${Math.floor(c/8)+1}: ${hit?'попадание':fired?'мимо':visible?'ваш корабль':'не проверено'}">${hit?'×':fired?'·':visible?'▪':''}</button>`;}).join('');}}
function enemyTurn(){if(game.done)return;const cells=Array.from({length:64},(_,i)=>i).filter(c=>!game.enemyShots.has(c));const r=shoot(game.own,game.enemyShots,cells[Math.floor(Math.random()*cells.length)]);if(r.kind==='win'){game.done=true;game.busy=false;$('#game-status').textContent='Компьютер потопил ваш флот. Реванш?';}else if(r.kind==='miss'){game.busy=false;$('#game-status').textContent='Противник промахнулся. Ваш ход.';}else{$('#game-status').textContent='Противник попал. Ещё один выстрел.';timer=setTimeout(enemyTurn,600);}boards();}
$('#enemy-board').onclick=e=>{const b=e.target.closest('[data-cell]');if(!b||game.busy||game.done)return;const r=shoot(game.enemy,game.playerShots,Number(b.dataset.cell));if(r.kind==='repeat')return;if(r.kind==='win'){game.done=true;$('#game-status').textContent='Победа! Все корабли противника потоплены.';}else if(r.kind==='miss'){game.busy=true;$('#game-status').textContent='Мимо. Ход противника.';timer=setTimeout(enemyTurn,600);}else $('#game-status').textContent=r.kind==='sunk'?'Корабль потоплен! Стреляйте ещё.':'Попадание! Ещё один выстрел.';boards();};$('#restart').onclick=reset;$('#open-game').onclick=()=>{$('#game-dialog').showModal();};$('#game-dialog').addEventListener('close',()=>{clearTimeout(timer);if(game.busy&&!game.done){game.busy=false;$('#game-status').textContent='Партия приостановлена. Ваш ход.';boards();}});reset();

