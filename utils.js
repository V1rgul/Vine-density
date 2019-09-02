function clamp(v, min, max){
	if(v<=min) return min
	if(v>=max) return max
	return v
}
function mapFrom(t, min, max){
	if( max == min ){
		if(t == min) return 0
		if(t >  min) return +Infinity
		else         return -Infinity
	}
	return ( t - min ) / ( max - min )
}
function mapTo(t, min, max){
	return t * ( max - min ) + min
}

//  [{t:0}, {}, {t:2}] => [{t:0}, {t:1}, {t:2}]
function linearInterpolationStagesFillT(arr){
	let start = 0, end = 0
	while(end < arr.length){
		if(arr[end].t != undefined){
			if(arr[start].t != undefined){
				for(let i=start+1; i<end; i++){
					arr[i].t = mapTo(mapFrom(i, start, end), arr[start].t, arr[end].t)
				}
			}else {
				arr[start].t = arr[end].t
			}
			start = end
		} else {
			if(arr[start].t != undefined){
				arr[end].t = arr[start].t
			}
		}
		end++
	}
	return arr
}

//  (1, [{t:-2,o:'a', {t:2,o:'b'}, {t:5,o:'c'}]) => {t:0.75, ['a','b']}
function linearInterpolationStagesMap(t, arr){
	let i = 1;
	while(i<arr.length-1 && t>arr[i].t){
		i++
	}
	return {
		t  : clamp(mapFrom(t, arr[i-1].t, arr[i].t), 0, 1),
		arr: [arr[i-1].o, arr[i].o],
	}
}



function correctGamma(val, gamma){
	return Math.pow(val, gamma)
}
function correctDeviation(val, gamma){
	let centered = val * 2 - 1
	return .5 + .5 * correctGamma(Math.abs(centered), gamma) * ( (centered>0) ? 1 : -1 )
}
