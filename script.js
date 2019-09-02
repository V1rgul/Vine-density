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
			freqS:  0.02,
			freqR:  1,
			cor: {
				g:  0.25,
				dg: 0.3,
			},
			mix: {
				add: 1.0,
				mul: 0.0,
			},
		},{
			freqS:  0.003,
			freqR:  0.03,
			cor: {
				g:  0.3,
				dg: 1.0,
			},
			mix: {
				add: 0.0,
				mul: 0.3,
			},
		}],
		end: {
			range: 30,
			cor: {
				g:  0.4,
				dg: 1.0,
			},
			mix: {
				mul: 0.5
			},
		},
		noiseRatio: .15,
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


let mixer = mixerGenerator(CONF.valGen.arr.map(e => e.mix).concat(CONF.valGen.end.mix))

noise.seed(Math.random())

for(let r=0; r < CONF.row.number; r++){
	let x = CONF.scale * r * ( CONF.row.width + CONF.row.spacing )

	for(let s=0; s < CONF.slice.number; s++){
		let y = CONF.scale * s * CONF.slice.height

		

		let values = CONF.valGen.arr.map(e => {
			let perlin = .5 + .5 * noise.simplex2( e.freqS * s , e.freqR * r )
			let corrected = correction(perlin, e.cor)
			return corrected
		})

		let ratioEnd = correction(clamp( Math.min(s, CONF.slice.number - s) / CONF.valGen.end.range, 0, 1), CONF.valGen.end.cor)
		values.push(ratioEnd)

		let val = mixer(values)

		val = ((1-CONF.valGen.noiseRatio) * val) + (CONF.valGen.noiseRatio * (Math.random() * 2 - 1))

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
