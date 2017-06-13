
window.draw=(function(){
	//private inside function

	// used when calling drawUpdate()
	var lastData = {};

	var barConfig = { //used for defining the radius and color of bars
		core:{
			stack:0,
			color:'#c70e0e',
			innerRadius:29,
			outerRadius:40,
			stroke:{
				lineWidth:2
			},
			rangeHandles:true,
			opacity:0.6,
			hoverOpacity:0.5,
			activeOpacity:0.5,
			selected:{
				strokeColor:'#FF6363',
				lineWidth:1,
				expand:0.5
			}
		},
		nap:{
			stack:1,
			color:'#c70e0e',
			innerRadius:29,
			outerRadius:40,
			stroke:{
				lineWidth:2
			},
			opacity:0.6,
			hoverOpacity:0.5,
			activeOpacity:0.5,
			selected:{
				strokeColor:'grey',
				lineWidth:1,
				expand:0.5
			}
		},
		busy:{
			stack:2,
			color:'#1f1f1f',
			innerRadius:29,
			outerRadius:36,
			stroke:{
				lineWidth:2
			},
			rangeHandles:true,
			opacity:0.6,
			hoverOpacity:0.5,
			activeOpacity:0.5,
			selected:{
				strokeColor:'#FF6363',
				lineWidth:1,
				expand:0.5
			}
		},
		general:{
			textSize:4,
			color:'black'
		}
	};


	var darkBarConfig = { //when darkmode is on
		core:{
			color:'#733134',
			opacity:0.7,
			hoverOpacity:0.7,
			activeOpacity:0.7,
			selected:{
				strokeColor:'#FF6363',
				lineWidth:1,
				expand:0.5
			}
		},
		nap:{
			color:'#c70e0e',
			opacity:0.7,
			hoverOpacity:0.7,
			activeOpacity:0.7,
			selected:{
				strokeColor:'#FF6363',
				lineWidth:1,
				expand:0.5
			}
		},
		busy:{
			color:'#9E9E9E',
			opacity:0.6,
			hoverOpacity:0.5,
			activeOpacity:0.5,
			selected:{
				strokeColor:'#FF6363',
				lineWidth:1,
				expand:0.5
			}
		},
		general:{
			color:'white'
		}
	};


	var clockConfig = { // define how the background clock should be drawn
		background:'#F4F4F4',
		circles:[
			{radius:36},
			{radius:29},
			{radius:20},
			{radius:2}
		],
		clearCircle: 20,
		blurCircle:{
			radius:29,
			opacity:0.8
		},
		stroke:0.32,
		strokeColor:'#C9C9C9',
		impStrokeColor:'#262626',
		clockNumbers:{
			radius:44,
			color:'#262626'
		},
		between:{
			strokeColor: '#d2d2d2',
			textColor: 'black',
			opacity: 0.5,
		},
		timeLocation:4, //how far away from the bar the time indicators should be

	};

	var darkClockConfig = {
		background:'#373737',
		circles:[
			{radius:36},
			{radius:29},
			{radius:20},
			{radius:2}
		],
		clearCircle: 20,
		blurCircle:{
			radius:29,
			opacity:0.5
		},
		stroke:0.32,
		strokeColor:'#525252',
		impStrokeColor:'EDEDED',
		clockNumbers:{
			radius:44,
			color:'#BFBFBF'
		},
		between:{
			strokeColor: '#A5A5A5',
			textColor: 'white',
			opacity: 0.9,
		},
		timeLocation:4, //how far away from the bar the time indicators should be
	}


	function calculateShape(ctx, shape){
		var minutesPreservedByLine = 0;
		var radius = 36*draw.ratio;

		for (var i = 0; i < shape.length; i++) {
			if(shape[i].type == 'line'){
				minutesPreservedByLine += shape[i].minutes;
			}
		}

		var spaceForArcs = 1440 - minutesPreservedByLine;
		if(spaceForArcs < 0){
			throw new Error('too much space is given to straight segments in the shape');
		}

		var totalRadians = 0;
		for (var i = 0; i < shape.length; i++) {

			shape[i].angle = totalRadians;

			if(shape[i].type == 'arc'){
				totalRadians += shape[i].radians;
			}

		}

		var pathLengthPerMinute;
		//calc. minutes
		for (var i = 0; i < shape.length; i++) {
			if(shape[i].type == 'arc'){
				shape[i].minutes = (shape[i].radians/totalRadians) * spaceForArcs;

				// find perimeter of whole main circle, then find length of this
				shape[i].pathLength = radius * 2 * Math.PI * (shape[i].radians/(Math.PI*2));

				// only need to do this once
				if(i == 0){
					pathLengthPerMinute = shape[i].pathLength/shape[i].minutes;
				}
			}
		}

		for (var i = 0; i < shape.length; i++) {
			if(shape[i].type == 'line'){
				console.log(pathLengthPerMinute)
				shape[i].pathLength = shape[i].minutes * pathLengthPerMinute;
			}
		}

		var sumMinutes = 0;
		for (var i = 0; i < shape.length; i++) {
			shape[i].start = sumMinutes;
			shape[i].end = sumMinutes + shape[i].minutes;

			sumMinutes += shape[i].minutes;
		}

		// find centres
		for (var i = 0; i < shape.length; i++) {
			console.log(i)
			if(i == 0){
				shape[i].centre = {
					x: draw.w/2,
					y: draw.h/2
				};
			}else{
				console.log('warning')
				shape[i].centre = shape[i-1].endCentre;
			}

			if(shape[i].type == 'line'){
				console.log(shape[i])
				shape[i].endCentre = {
					x: shape[i].centre.x + Math.cos(shape[i].angle)*shape[i].pathLength,
					y: shape[i].centre.y + (Math.sin(shape[i].angle)*shape[i].pathLength)
				}
			}else{
				shape[i].endCentre = shape[i].centre;
			}
		}

		draw.shape = shape;
	}

	function createCurve(ctx, radius, start, end, anticlockwise){
		if(typeof anticlockwise == 'undefined'){
			var anticlockwise = false;
		}

		//end = 900;
		var c = {
			x: draw.w/2,
			y: draw.h/2
		}
		var r = radius*draw.ratio;

		var cumRad = 0;
		var nowPoint = {
			x: c.x,
			y: c.y-r
		}
		var shape = helpers.clone(draw.shape);
		if(anticlockwise){
			shape.reverse();
		}

		// find start
		var startBlock, endBlock;
		for (var i = 0; i < shape.length; i++) {
			var e = shape[i];

			// if start is inside this shapeBlock
			if(helpers.isInside(start, e.start, e.end)){
				startBlock = i;
			}
			// if end is inside this shapeBlock
			if(helpers.isInside(end, e.start, e.end)){
				endBlock = i;
			}
		}

		console.log(startBlock, endBlock)

		// create iterable task array
		var taskArray = [];
		var skipEndCheck = false;
		var defaultTask;
		if(anticlockwise){
			defaultTask = {
				start: 1,
				end: 0
			}
		}else{
			defaultTask = {
				start: 0,
				end: 1
			}
		}


		for (var i = startBlock; i < shape.length; i++) {
			var task = {
				shape: shape[i],
				start: defaultTask.start,
				end: defaultTask.end
			}

			if(i == startBlock){
				task.start = helpers.getPositionBetweenTwoValues(start,shape[i].start,shape[i].end);
			}
			if(i == endBlock){
				task.end = helpers.getPositionBetweenTwoValues(end,shape[i].start,shape[i].end);
			}
			if(i == startBlock && i == endBlock && (task.end > task.start && anticlockwise) || (task.end < task.start && !anticlockwise)){
				// make sure things are correct when end is less than start
				if(taskArray.length == 0){
					// it is beginning
					task.end = defaultTask.end;
					skipEndCheck = true;
				}else {
					// it is end
					task.start = defaultTask.start;
				}
			}
			//
			// var oldEnd = task.end;
			// task.end = task.start;
			// task.start = oldEnd;

			taskArray.push(task);

			if(i == endBlock){
				if(skipEndCheck){
					skipEndCheck = false;
					// let it run a round and add all shapes
				}else{
					// finished.. nothing more to do here!
					break;
				}
			}

			// if we reached end of array without having found
			// the end point, it means that we have to go to
			// the beginning again
			// ex. when start:700 end:300
			if(i == shape.length-1){
				i = -1;
			}
		}


		for (var i = 0; i < taskArray.length; i++) {
			var shape = taskArray[i].shape;
			if(shape.type == 'arc'){
				var shapeStart = shape.angle-(Math.PI/2);
				var start = shapeStart + (taskArray[i].start * shape.radians);
				var end = shapeStart + (taskArray[i].end * shape.radians);
				ctx.arc(shape.centre.x,shape.centre.y,r,start, end, anticlockwise);

				var radNormalize = shape.angle + shape.radians - (Math.PI/2); // because my circle is not the same as the math circle
				nowPoint.x = c.x + Math.cos(radNormalize)*r;
				nowPoint.y = c.y + Math.sin(radNormalize)*r;

			}else if(shape.type == 'line'){
				var distance = {
					x: Math.cos(shape.angle)*shape.pathLength,
					y: Math.sin(shape.angle)*shape.pathLength
				}
				var shapeStart = {
					x: shape.centre.x + Math.sin(shape.angle)*r,
					y: shape.centre.y - Math.cos(shape.angle)*r
				}
				var start = {
					x: shapeStart.x + distance.x*taskArray[i].start,
					y: shapeStart.y + distance.y*taskArray[i].start
				};
				var end = {
					x: shapeStart.x + distance.x*taskArray[i].end,
					y: shapeStart.y + distance.y*taskArray[i].end
				}

				if(i == 0){
					ctx.lineTo(start.x, start.y)
				}
				ctx.lineTo(end.x,end.y);
			}
		}

		if(helpers.isInside(start, 0, 600)){
		}else{
		}


		//ctx.ellipse(draw.w/2,draw.h/2,radius*draw.ratio,(radius)*draw.ratio,0,helpers.minutesToRadians(start), helpers.minutesToRadians(end), anticlockwise);
	}

	function createSegment(ctx, outer, inner, start, end){
		ctx.beginPath();
		createCurve(ctx, outer, start, end);
		createCurve(ctx, inner, end, start, true);
		ctx.closePath();
	}

	function removeOverlapping(data,inferior,superior){
		//this function will prevent two bars from overlapping
		//if they overlap, the superior wins
		var startInf, endInf, startSup, endSup, startIsInside, endIsInside, newData, trim;

		//clone data object
		var data = JSON.parse(JSON.stringify(data));

		//if there are no inferior elements, return
		if(typeof data[inferior] == 'undefined' || data[inferior].length == 0)
		return data;

		//if there are no superior elements, return
		if(typeof data[superior] == 'undefined' || data[superior].length == 0)
		return data;

		//iterate inferior elements
		var length = data[inferior].length; //we dont want do iterate array elements that are dynamically added inside the loop
		for(var i = 0; i < length; i++){
			startInf = data[inferior][i].start;
			endInf = data[inferior][i].end;
			trim = [];

			//iterate superior elements
			for(var f = 0; f < data[superior].length; f++){
				startSup = data[superior][f].start;
				endSup = data[superior][f].end;

				startIsInside = helpers.pointIsInside(startSup,startInf,endInf);
				endIsInside = helpers.pointIsInside(endSup,startInf,endInf);

				if(startIsInside || endIsInside){
					//make some extra room
					startSup = helpers.calc(startSup,-10);
					endSup = helpers.calc(endSup,10);

					trim.push({
						start:startSup,
						end:endSup
					})
				}
			}
			if(trim.length > 0){
				trim=trim.sort(function(a, b){
					return a.start-b.start
				})
				var trimmed = [data[inferior][i]];
				for(var t = 0; t<trim.length; t++){
					var start, end;
					var last = trimmed.length-1;

					start = trimmed[last].start;
					end = trimmed[last].end;

					var startIsInside = helpers.pointIsInside(trim[t].start,start,end);
					var endIsInside = helpers.pointIsInside(trim[t].end,start,end);
					if(startIsInside && endIsInside){

						//split
						trimmed[last] = {
							start:start,
							end:trim[t].start
						};
						trimmed.push({
							start:trim[t].end,
							end:end
						})
					}
					else if(startIsInside){
						trimmed[last] = {
							start:start,
							end:trim[t].start
						};
					}
					else if(endIsInside){
						trimmed[last] = {
							start:trim[t].end,
							end:end
						};
					}
				}
				//set the original element empty and set all the new ones to point to the old
				data[inferior][i]={};
				for(t=0; t<trimmed.length; t++){
					trimmed[t].phantom = i;
				}

				data[inferior] = data[inferior].concat(trimmed);
			}

		}

		return data;

	}
	function drawLines(ctx){
		var radius=40*draw.ratio;
		ctx.save();
		ctx.strokeStyle=clockConfig.strokeColor;
		ctx.lineWidth = clockConfig.stroke *draw.ratio;
		ctx.beginPath();
		ctx.translate(draw.w/2,draw.h/2);
		for(i=0;i<12;i++){
			c=helpers.minutesToXY(i*60,radius);
			ctx.moveTo(c.x,c.y);
			c=helpers.minutesToXY(i*60+720,radius);
			ctx.lineTo(c.x,c.y);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	function drawImpLines(ctx){
		var radius=40*draw.ratio;
		ctx.save();
		ctx.translate(draw.w/2,draw.h/2);
		ctx.beginPath();
		ctx.strokeStyle=clockConfig.impStrokeColor;
		ctx.lineWidth = clockConfig.stroke *draw.ratio;

		c=helpers.minutesToXY(0,radius);
		ctx.moveTo(c.x,c.y);
		c=helpers.minutesToXY(720,radius);
		ctx.lineTo(c.x,c.y);
		c=helpers.minutesToXY(240,radius);
		ctx.moveTo(c.x,c.y);
		c=helpers.minutesToXY(960,radius);
		ctx.lineTo(c.x,c.y);
		c=helpers.minutesToXY(480,radius);
		ctx.moveTo(c.x,c.y);
		c=helpers.minutesToXY(1200,radius);
		ctx.lineTo(c.x,c.y);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	function drawCircles(ctx){

		var circles=clockConfig.circles;
		ctx.strokeStyle=clockConfig.strokeColor;

		ctx.lineWidth = clockConfig.stroke *draw.ratio;

		for(i=0;i<circles.length;i++){
			ctx.beginPath();
			createCurve(ctx,circles[i].radius,0,1439);
			ctx.stroke();
		}
	}

	function drawClockNumbers(ctx, ampm){
		var width = draw.w;
		var height = draw.h;

		impfontpixels=5*draw.ratio;
		ctx.fillStyle=clockConfig.clockNumbers.color;
		numberRadius=clockConfig.clockNumbers.radius*draw.ratio;
		ctx.font=impfontpixels+"px Verdana";
		ctx.textAlign="center";
		ctx.textBaseline="middle";

		var ampmTable = {
			0: 'Midnight',
			4: '4 AM',
			8: '8 AM',
			12: 'Noon',
			16: '4 PM',
			20: '8 PM'
		}

		for(i=0;i<24;i++){
			if(i===0||i==4||i==16||i==20||i==8||i==12){
				degrees=(helpers.degreesToRadiens((15*i)+270));
				xval=width/2+Math.cos(degrees)*numberRadius;
				yval=height/2+Math.sin(degrees)*numberRadius;
				if(ampm){
					ctx.fillText(ampmTable[i],xval,yval);
				}
				else{
					ctx.fillText(i,xval,yval);
				}
			}
		}
	}

	function clearClockCircle(ctx,radius){
		var width = draw.w;
		var height = draw.h;

		ctx.save();
		ctx.globalCompositeOperation = 'destination-out';
		ctx.beginPath();
		createCurve(ctx, radius, 0, 1440);
		ctx.lineTo(width/2,height/2);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	function drawBars(ctx,data){
		var canvas = ctx.canvas;

		ctx.save();
		for (var name in data){
			var innerRadius = barConfig[name].innerRadius,
			outerRadius = barConfig[name].outerRadius,
			opacity = barConfig[name].opacity,
			hoverOpacity = barConfig[name].hoverOpacity,
			activeOpacity = barConfig[name].activeOpacity;

			ctx.fillStyle=barConfig[name].color;

			for (var i = 0; i < data[name].length; i++){
				var start=data[name][i].start;
				var end=data[name][i].end;
				var lineToXY=helpers.minutesToXY(data[name][i].end,innerRadius);
				var count;

				if(typeof data[name][i].phantom != 'undefined'){
					count = data[name][i].phantom;
				}else{
					count = i;
				}

				createSegment(ctx, outerRadius,innerRadius, start, end);

				if(interactCanvas.isActive(name,count,'whole') || napchartCore.isSelected(name,count)){
					ctx.globalAlpha = activeOpacity;
				}

				else if(interactCanvas.isActive(name,count) || interactCanvas.isHover(name,count,'whole')){
					ctx.globalAlpha=hoverOpacity;
				}

				else{
					ctx.globalAlpha=opacity;
				}
				ctx.fill();

			}
		}
		ctx.restore();
	}

	function strokeBars(ctx,data){
		ctx.save();
		ctx.lineJoin = 'mittel';
		for (var name in data){
			if(typeof barConfig[name].stroke=="undefined")
			continue;
			ctx.lineWidth=barConfig[name].stroke.lineWidth;
			var innerRadius = barConfig[name].innerRadius;
			var outerRadius = barConfig[name].outerRadius;
			ctx.strokeStyle=barConfig[name].color;

			for (var i = 0; i < data[name].length; i++){
				var start=data[name][i].start;
				var end=data[name][i].end;
				createSegment(ctx, outerRadius, innerRadius, start, end);
				ctx.stroke();
			}

		}
		ctx.restore();
	}

	function drawShadows(ctx,data){
		ctx.save();
		for (var name in data) {
			var innerRadius = 0;
			var outerRadius = barConfig[name].innerRadius;
			ctx.fillStyle=barConfig[name].color;

			for (var i = 0; i < data[name].length; i++){

				var count = i;

				if(!interactCanvas.isActive(name,count) && !napchartCore.isSelected(name,count))
				continue;

				ctx.save();
				var start=data[name][i].start;
				var end=data[name][i].end;
				var startRadians=helpers.minutesToRadians(data[name][count].start);
				var endRadians=helpers.minutesToRadians(data[name][count].end);
				var lineToXY=helpers.minutesToXY(data[name][count].end,innerRadius);

				createSegment(ctx, outerRadius,innerRadius, start, end);

				ctx.globalAlpha=0.1*ctx.globalAlpha;

				ctx.fill();
				ctx.restore();


			}
		}
		ctx.restore();

	}

	function drawBlurCircle(ctx){
		var width = draw.w;
		var height = draw.h;

		if(clockConfig.blurCircle.opacity == 1){
			// then its better just to make a hole
			return clearClockCircle(ctx,clockConfig.blurCircle.radius*draw.ratio);
		}

		ctx.save();
		ctx.fillStyle=clockConfig.background;
		ctx.globalAlpha=clockConfig.blurCircle.opacity;
		ctx.beginPath();
		createCurve(ctx, clockConfig.blurCircle.radius ,0,1440);
		ctx.fill();
		ctx.restore();
	}

	function drawHandles(ctx,data){
		var outerColor, innerColor;
		ctx.save();

		ctx.translate(draw.w/2,draw.h/2);
		for (var name in data) {
			if(typeof barConfig[name].rangeHandles == 'undefined' || !barConfig[name].rangeHandles)
			continue;

			for (var i = 0; i < data[name].length; i++){

				var element = data[name][i],
				count = i;


				if(!napchartCore.isSelected(name,count))
				continue;

				for(s=0;s<2;s++){
					var point=helpers.minutesToXY(element[['start','end'][s]], barConfig[name].outerRadius*draw.ratio);

					if(interactCanvas.isActive(name,i,['start','end'][s])){
						outerColor = 'red';
						innerColor = 'green';
					}
					else if(interactCanvas.isHover(name,i,['start','end'][s]) && !interactCanvas.isActive(name,i)){
						outerColor = 'white';
						innerColor = 'blue';
					}else{
						outerColor = 'white';
						innerColor = barConfig[name].color;
					}
					ctx.fillStyle = outerColor;
					ctx.beginPath();
					ctx.arc(point.x,point.y,1*draw.ratio,0, 2 * Math.PI, false);
					ctx.fill();


					ctx.fillStyle = innerColor;
					ctx.beginPath();
					ctx.arc(point.x,point.y,0.7*draw.ratio,0, 2 * Math.PI, false);
					ctx.fill();
				}
			}
		}
		ctx.restore();
	}

	function drawDistanceToNearElements(ctx,data,selectedElement,bars){
		// draws the distance to the nearby elements of the selected element
		var array = [], elementPush, selected, before, after;

		if(bars.indexOf(selectedElement.name) == -1)
		return;

		if(!interactCanvas.isActive(selectedElement.name,selectedElement.count))
		return;

		// FIRST - find the elements near the selected element (max one on each side):

		// loop through the bar types specified
		for (var i = 0; i < bars.length; i++){

			if(typeof data[bars[i]] == 'undefined')
			continue;

			//add elements into new array
			for(var f = 0; f < data[bars[i]].length; f++){

				if(typeof data[bars[i]][f] != 'undefined' ){
					elementPush = data[bars[i]][f];

					if(napchartCore.isSelected(bars[i],f)){
						elementPush.selected = true;
					}

					array.push(elementPush);
				}
			}
		}

		//nothing to do if only one element
		if(array.length == 1)
		return;

		//sort array
		array = array.sort(function(a, b){
			return a.start-b.start
		});

		//find out which element in new array is the selected one
		for(var i = 0; i < array.length; i++){
			if(typeof array[i].selected != 'undefined'){
				selected = i;
			}
		}

		//ok, great we have an array with sorted values and know what element is selected
		//then all we have to do is to find the two elements besides the selected element in the array, right?
		before = selected - 1;
		if(before < 0)
		before = array.length - 1;

		after = selected + 1;
		if(after > array.length - 1)
		after = 0;

		//SECOND - find out if they are close enough, then draw
		var radius = 45;
		var textRadius = 36*draw.ratio;
		var canvas = ctx.canvas;
		var fontSize = barConfig.general.textSize * draw.ratio;

		ctx.save();

		ctx.strokeStyle= '#d2d2d2';
		ctx.strokeStyle= clockConfig.between.strokeColor;
		ctx.fillStyle= clockConfig.between.textColor;
		ctx.lineWidth= 3;
		ctx.font = fontSize + "px verdana";
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.globalAlpha = ctx.globalAlpha * clockConfig.between.opacity;

		//push start and endpoints to draw array
		var drawArr = [];
		drawArr.push({
			start:array[before].end,
			end:array[selected].start
		});
		drawArr.push({
			start:array[selected].end,
			end:array[after].start
		});

		drawArr.forEach(function(element){
			var distance, start, end, middle, startRadians, endRadians, text;

			distance = helpers.range(element.start,element.end);
			text = helpers.minutesToReadable(distance, 120);

			if(distance <= 720 && distance >= 60){
				start = helpers.calc(element.start,15);
				end = helpers.calc(element.end,-15);
				middle = helpers.calc(start,distance/2);

				middleXY = helpers.minutesToXY(middle, textRadius, canvas.width/2, canvas.height/2)

				//stroke
				ctx.beginPath();
				createCurve(ctx, radius,start,end);
				ctx.stroke();

				//text
				ctx.fillText(text,middleXY.x,middleXY.y);
			}
		});

		ctx.restore();
	}

	function drawElementInfo(ctx,selected){
		var element, name, count, duration, middle, radius;
		var position = {};
		var radius = 22 * draw.ratio;
		var canvas = ctx.canvas;

		name = selected.name;
		count = selected.count;
		element = napchartCore.returnElement(name,count);
		duration = helpers.minutesToReadable( helpers.range(element.start, element.end) ,120);

		//find position
		middle = helpers.middle(element.start,element.end);
		position = helpers.minutesToXY(middle, radius, canvas.width/2, canvas.height/2);

		ctx.save();

		//ctx config
		ctx.font = barConfig.general.textSize * draw.ratio + "px verdana";
		ctx.fillStyle = barConfig.general.color;
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.globalAlpha = ctx.globalAlpha*0.6;

		//draw
		ctx.fillText(duration,position.x,position.y);

		ctx.restore();
	}

	function drawTimeIndicators(ctx,selected){
		var element, name, count, duration, timeLocation, radius, time;
		var position = {};
		var pointsToDraw = [];
		var canvas = ctx.canvas;

		name = selected.name;
		count = selected.count;
		element = napchartCore.returnElement(name,count);
		duration = helpers.range(element.start, element.end);
		timeLocation = clockConfig.timeLocation;
		radius = (barConfig[name].outerRadius + timeLocation) * draw.ratio;

		//push start
		pointsToDraw.push({
			minutes:element.start
		});

		//if element is big enough, push end
		if(duration > 90){
			pointsToDraw.push({
				minutes:element.end
			});
		}

		ctx.save();

		//ctx config
		ctx.font = 3 * draw.ratio + "px verdana";
		ctx.fillStyle = barConfig.general.color;
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.globalAlpha = ctx.globalAlpha*0.4;

		for(var i = 0; i < pointsToDraw.length; i++){

			minutes = pointsToDraw[i].minutes;

			//skip if close to 0, 4, 8, 12, 16 or 20 (every 240 minutes)
			if(minutes%240 <= 15 || minutes%240 >= 225)
			continue;

			time = helpers.minutesToClock(minutes);
			position = helpers.minutesToXY(minutes, radius, canvas.width/2, canvas.height/2);

			//draw
			ctx.fillText(time,position.x,position.y);
		}


		ctx.restore();
	}

	function render(){
		var data = napchartCore.getSchedule();
		draw.drawFrame(data);

		window.requestAnimationFrame(render);
	}

	return { //exposed to public
		initialize:function(canvas){
			//first determine canvas size
			var resizeDiv = canvas.parentNode;
			var clockSize = Math.min(resizeDiv.clientWidth, 400);
			console.log(resizeDiv.clientWidth, 400);

			canvas.width = clockSize;
			canvas.height = clockSize;
			console.log('size',clockSize);

			// draws the background clock to an off-screen canvas.
			// This increases performance because the browser doesn't need to redraw everything, every frame
			var offScreenCanvas=document.createElement('canvas');
			var octx=offScreenCanvas.getContext('2d');


			var ampm;
			if(settings.getValue('ampm')){
				ampm = true;
				this.ratio = clockSize/103; // clock is a little bit smaller when ampm enabled
			}else{
				this.ratio = clockSize/96; //what the computer thinks
			}


			this.drawRatio = this.ratio; //what you see

			var ctx=canvas.getContext("2d");
			var devicePixelRatio = window.devicePixelRatio || 14;
			var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
			ctx.mozBackingStorePixelRatio ||
			ctx.msBackingStorePixelRatio ||
			ctx.oBackingStorePixelRatio ||
			ctx.backingStorePixelRatio || 1;

			console.log('backingstore:',backingStoreRatio);
			console.log('dpr:',devicePixelRatio);

			var backingRatio = devicePixelRatio / backingStoreRatio;

			// upscale the canvas if the two ratios don't match
			if (devicePixelRatio !== backingStoreRatio) {
				console.log('upscaling');

				var oldWidth = canvas.width;
				var oldHeight = canvas.height;

				canvas.width = oldWidth * backingRatio;
				canvas.height = oldHeight * backingRatio;

				canvas.style.width = oldWidth + 'px';
				canvas.style.height = oldHeight + 'px';

				this.ratio *= backingRatio;
			}


			this.ctx = ctx;
			this.w = canvas.width;
			this.h = canvas.height;

			var shape = [
				{
					type: 'arc',
					radians: Math.PI*2
				}
			];

			offScreenCanvas.height=canvas.width;
			offScreenCanvas.width=canvas.width;

			calculateShape(octx, shape);
			//draw clock
			drawLines(octx);
			clearClockCircle(octx,clockConfig.clearCircle);
			drawCircles(octx);
			drawImpLines(octx);
			drawClockNumbers(octx, ampm);
			//saves to a variable used in drawFrame()
			this.cachedBackground=offScreenCanvas;

			render();
		},

		reInit:function(){
			draw.initialize(draw.ctx.canvas);
		},

		drawFrame:function(data,thumb){
			if(typeof data=='undefined')
			throw new Error("drawFrame did not receive data in argument");
			var dataWithPhantoms, selectedElement, ctx;

			//clone data object
			data = JSON.parse(JSON.stringify(data));

			// remove overlapping of nap and busy bars
			// this will be used for some functions, while other functions use data
			dataWithPhantoms = removeOverlapping(data,'busy','nap');

			selectedElement = napchartCore.returnSelected()[0];

			ctx=draw.ctx;
			ctx.clearRect(0,0,draw.w,draw.h);
			if(typeof this.cachedBackground=="undefined")
			throw new Error("Could not find the initialized off-screen canvas. Try running draw.initialize()");

			ctx.drawImage(this.cachedBackground,0,0);

			drawBars(ctx,dataWithPhantoms);

			drawBlurCircle(ctx);

			strokeBars(ctx,dataWithPhantoms);

			for(var name in data){
				if(name == 'busy')
				continue;
				for(var i = 0; i < data[name].length; i++){
					drawElementInfo(ctx,{name:name,count:i});
					drawTimeIndicators(ctx,{name:name,count:i});
				}
			}

			ctx.save();
			ctx.globalAlpha=interactCanvas.getSelectedOpacity();

			drawShadows(ctx,data);
			drawHandles(ctx,data);

			if(typeof selectedElement != 'undefined'){
				//something is selected
				drawDistanceToNearElements(ctx,data,selectedElement,['nap','core']);

				if(selectedElement.name
					== 'busy'){
						drawElementInfo(ctx,selectedElement);
						drawTimeIndicators(ctx,selectedElement);
					}
				}

				ctx.restore();

			},
			drawUpdate:function(){
				console.log('drawUpdate')
				// data = napchartCore.getSchedule();
				// draw.drawFrame(data);
				requestUpdate = true;
			},

			getBarConfig:function(){
				return JSON.parse(JSON.stringify(barConfig));
			},


			getImage:function(){
				var ctx = draw.ctx;
				var canvas = ctx.canvas;
				var img;

				img = canvas.toDataURL();

				return img;
			},

			changeClockConfig:function(attribute,value){
				clockConfig[attribute] = value;
			},

			dmToggle:function(state){
				if(state){
					// save current configs in case you will switch back
					normalBarConfig = helpers.clone(barConfig);
					normalClockConfig = helpers.clone(clockConfig);

					barConfig = helpers.overwrite(barConfig, darkBarConfig);
					clockConfig = helpers.overwrite(clockConfig, darkClockConfig);
				}else{
					barConfig = helpers.overwrite(barConfig, normalBarConfig);
					clockConfig = helpers.overwrite(clockConfig, normalClockConfig);
				}

				draw.reInit();
				draw.drawUpdate();
			}
		};
	}());
