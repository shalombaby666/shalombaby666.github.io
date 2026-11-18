export function createFleet(){
  for(;;){
    const fleet=[]; let failed=false;
    for(const length of [3,2,2,1]){
      let placed=false;
      for(let attempt=0;attempt<300;attempt++){
        const x=Math.floor(Math.random()*8),y=Math.floor(Math.random()*8),vertical=Math.random()<.5;
        if(x+(vertical?0:length-1)>7||y+(vertical?length-1:0)>7) continue;
        const cells=Array.from({length},(_,i)=>(y+(vertical?i:0))*8+x+(vertical?0:i));
        if(cells.some(a=>fleet.flat().some(b=>Math.abs(a%8-b%8)<=1&&Math.abs(Math.floor(a/8)-Math.floor(b/8))<=1))) continue;
        fleet.push(cells);placed=true;break;
      }
      if(!placed){failed=true;break;}
    }
    if(!failed)return fleet;
  }
}
export function shoot(fleet,shots,cell){
  if(!Number.isInteger(cell)||cell<0||cell>=64)throw new RangeError('Invalid cell');
  if(shots.has(cell))return {kind:'repeat'};
  shots.add(cell);const ship=fleet.find(s=>s.includes(cell));
  if(!ship)return {kind:'miss'};
  if(fleet.flat().every(c=>shots.has(c)))return {kind:'win'};
  return {kind:ship.every(c=>shots.has(c))?'sunk':'hit'};
}
