let CONF = {
	scale: 2,
	row: {
		number: 60,
		width: 5,
		spacing: 3,
	},
	slice: {
		number: 600,
		height: 1
	},
	valGen : {
		arr : [{
			freq:           0.02,
			ratioAdd:       1.0,
			ratioMul:       1.0,
			gamma:          0.2,
			deviationGamma: 0.3,
		},{
			freq:           0.003,
			ratioAdd:       0.0,
			ratioMul:       0.2,
			gamma:          1.0,
			deviationGamma: 1.0,
		}],
		freqH: {
			val : 10.0,
			resetEveryTime: false,
		},
		noiseRatio: .2,
	},
	color: {
		scale: linearInterpolationStagesFillT([
			{t:0.20, o:"#FF6666"},
			{t:0.25, o:"#88FF88"},
			{t:0.40, o:"#00FF00"},
			{t:1.00, o:"#005599"},
		]),
	},
	axis: {
		spacing: 5,
		thickness: 20,
	},
}

// CONF.color.scale = linearInterpolationStagesFillT([
// 	{t:0, o:"yellow"},
// 	{t:1, o:"navy"},
// ])


let canvas = document.querySelector('canvas')
let ctx = canvas.getContext("2d")

canvas.height = CONF.scale * (CONF.slice.number * CONF.slice.height + CONF.axis.spacing + CONF.axis.thickness)
canvas.width = CONF.scale * ( CONF.row.number * CONF.row.width + (CONF.row.number-1) * CONF.row.spacing )


let rowWidth    = CONF.scale * CONF.row.width
let sliceHeight = CONF.scale * CONF.slice.height


function colorScale(t){
	let interpolationData = linearInterpolationStagesMap(t, CONF.color.scale)
	let color = chroma.mix(
		interpolationData.arr[0],
		interpolationData.arr[1],
		interpolationData.t,
		'lab'
	)
	return color
}


let valGenRatioAddSum = CONF.valGen.arr.reduce((acc, e) => acc+e.ratioAdd, 0)

noise.seed(Math.random())

for(let r=0; r < CONF.row.number; r++){
	let x = CONF.scale * r * ( CONF.row.width + CONF.row.spacing )

	if(CONF.valGen.freqH.resetEveryTime){
		noise.seed(Math.random())
	}

	for(let s=0; s < CONF.slice.number; s++){
		let y = CONF.scale * s * CONF.slice.height

		let distanceFromEnd = Math.min(s, CONF.slice.number - s)


		let ratioAdd = 0, ratioMul = 1, ratioMulSum = 0

		CONF.valGen.arr.forEach(e => {
			let perlin = .5 + .5 * noise.simplex2( e.freq * s , e.freq * CONF.valGen.freqH.val * r )
			let corrected = correctDeviation(correctGamma(perlin, e.gamma), e.deviationGamma)
			
			ratioAdd += corrected * e.ratioAdd

			if(e.ratioMul >= 0){
				ratioMul *= 1 - e.ratioMul   * (1 - corrected)
			} else {
				ratioMul *=    (-e.ratioMul) * (1 - corrected)
				ratioMulSum += (-e.ratioMul)
			}
		})

		let val = (ratioAdd / valGenRatioAddSum) * ratioMul + ratioMulSum
		val = clamp(((1-CONF.valGen.noiseRatio) * val) + (CONF.valGen.noiseRatio * (Math.random() * 2 - 1)))


		ctx.fillStyle = colorScale(val)
		ctx.fillRect(x, y, rowWidth, sliceHeight);		
	}
}

let y = CONF.scale * ( CONF.slice.number * CONF.slice.height + CONF.axis.spacing )
for(let x=0; x <canvas.width; x++){
	ctx.fillStyle = colorScale(x/canvas.width)
	ctx.fillRect(
		x,
		y,
		1,
		CONF.scale * CONF.axis.thickness
	)
}
