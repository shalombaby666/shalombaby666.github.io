import {projects} from './projects.js';

for(const [id,count] of [
 ['stat-projects',projects.length],
 ['stat-demos',projects.filter(p=>p.status==='Демо').length],
 ['stat-hackathons',projects.filter(p=>p.type==='Хакатоны').length]
])document.getElementById(id).textContent=String(count);

document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-share]');if(!button)return;
 const status=button.parentElement.querySelector('.share-status');
 const url=new URL(location.pathname,location.origin);url.hash='project='+encodeURIComponent(button.dataset.share);
 button.disabled=true;
 try{await navigator.clipboard.writeText(url.href);status.textContent='Ссылка скопирована';}
 catch{
  status.replaceChildren();const link=document.createElement('a');link.href=url.href;link.textContent='Открыть прямую ссылку';status.append(link);
 }
 finally{button.disabled=false;}
});
