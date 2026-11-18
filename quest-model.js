export function tilePacks(area,reserve,pack){
 if(![area,reserve,pack].every(Number.isFinite)||area<=0||reserve<1||pack<=0)throw new RangeError('Некорректные параметры');
 return Math.ceil(Math.round(area*reserve/pack*1e10)/1e10);
}
