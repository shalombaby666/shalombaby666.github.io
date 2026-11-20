const links=[...document.querySelectorAll('.header nav a[href^="#"]')];
const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
function update(){
 const offset=innerWidth>850?150:90;let current=sections[0];
 for(const section of sections)if(section.getBoundingClientRect().top<=offset)current=section;
 links.forEach(a=>{if(a.getAttribute('href')==='#'+current?.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
}
let frame=0;addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(()=>{update();frame=0})},{passive:true});addEventListener('resize',update);update();
