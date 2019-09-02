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
	color : {
		frequency: 0.02,
		frequencyH: 0.3,
		noiseRatio: .2,
		deviationGamma: .3,
		gamma: .2,
	},
	axis: {
		spacing: 5,
		thickness: 20,
	},
}
CONF.color.scale = linearInterpolationStagesFillT([
	{t:0.20, o:"#FF6666"},
	{t:0.25, o:"#88FF88"},
	{t:0.40, o:"#00FF00"},
	{t:1.00, o:"#0088AA"},
])
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
let frequencyH = (CONF.color.frequencyH == null) ? 0 : CONF.color.frequencyH



noise.seed(Math.random())
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
function myCorrection(t){
	return correctDeviation(correctGamma(t, CONF.color.gamma), CONF.color.deviationGamma)
}

for(let r=0; r < CONF.row.number; r++){
	let x = CONF.scale * r * ( CONF.row.width + CONF.row.spacing )

	if(CONF.color.frequencyH == null){
		noise.seed(Math.random())
	}

	for(let s=0; s < CONF.slice.number; s++){
		let y = CONF.scale * s * CONF.slice.height

		let distanceFromEnd = Math.min(s, CONF.slice.number - s)

		let perlinSource = .5 + .5 * noise.simplex2( CONF.color.frequency * s , r*frequencyH  )
		let perlin = myCorrection(perlinSource)

		let val = clamp(((1-CONF.color.noiseRatio) * perlin) + (CONF.color.noiseRatio * (Math.random() * 2 - 1)))

		
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
		CONF.scale * CONF.axis.thickness / 2
	);

	ctx.fillStyle = colorScale(myCorrection(x/canvas.width))
		ctx.fillRect(
		x,
		y + CONF.scale * CONF.axis.thickness / 2,
		1,
		CONF.scale * CONF.axis.thickness / 2
	);
}
