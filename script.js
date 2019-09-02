let CONF = {
	scale: 2,
	row: {
		number: 60,
		width: 5,
		spacing: 3,
	},
	slice: {
		number: 400,
		height: 1
	},
	color : {
		frequency: 12,
		frequencyH: .2,
		noiseRatio: .03,
		deviationGamma: 5,
		gamma: 1,
	},
	axis: {
		spacing: 5,
		thickness: 20,
	},
}
CONF.color.scale = linearInterpolationStagesFillT([
	{t:0.10, o:"#FF6666"},
	{t:0.15, o:"#33EE77"},
	{t:1.00, o:"#00AA00"},
])


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

		let perlinSource = .5 + .5 * noise.simplex2( CONF.color.frequency * s / CONF.slice.number, r*frequencyH  )
		let perlin = myCorrection(perlinSource)

		let val = ((1-CONF.color.noiseRatio) * perlin) + (CONF.color.noiseRatio * Math.random())

		
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
