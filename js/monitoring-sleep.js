var mySchedule = [];


var first_day = moment().subtract(1, 'month').format("YYYY-MM-DD"); 
var last_day = moment().format("YYYY-MM-DD");

var first = first_day,
last = last_day,
dRange = [d3.time.day.floor(new Date(first_day)), 
d3.time.day.ceil(new Date(last_day))];

var m = {top: 40, right: 20, bottom: 20, left: 60},
width = window.innerWidth*.7,
barSize = 12,
height = ((dRange[1]-dRange[0])/(24*60*60*1000))* barSize * 1.5;

var day = d3.time.format("%w"),
week = d3.time.format("%U"),
hour = d3.time.format("%X"),
format = d3.time.format("%Y-%m-%d %X"),
now = new Date();

var tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-10, 0])
.html(function(d) {
	return "<strong>Start:</strong> <span style='color:#7a7cc7'>" + moment(new Date(d.start)).format("MM/DD HH:mm") + " </span> <strong>End: </strong><span style='color:#7a7cc7'>" + moment(new Date(d.stop)).format("MM/DD HH:mm") + "</span>";
})

var x = d3.time.scale()		
.domain([0,24])
.range([0, width]);

var y =d3.time.scale()
.domain(dRange)
.range([0, height]);

var ganttSvg;

var minute = 60;
var schedule_settings;

function getActiveSchedule() {
	setTimeout(verifyNextAlarm, 1000 * minute);
	firebase.database().ref('/schedule_settings/' + currentUser.uid).once('value').then(function(snapshot) {
		schedule_settings = snapshot.val();
		var currentSchedule = schedule_settings.my_schedule;
		for(var i = 0; i < currentSchedule.naps.length; i++)
		{
			mySchedule.push(
                {
                    "start" : moment.utc().startOf('day').add(currentSchedule.naps[i].start, 'minutes').format('HH:mm:ss'),
                    "stop" : moment.utc().startOf('day').add(currentSchedule.naps[i].stop, 'minutes').format('HH:mm:ss')
                }
			)
		}
		viewBars();
		addDefaultValues();
        getSleepRecords();

	})
}

function verifyNextAlarm() {
	var now = moment().format("HH:mm");

	for(var i = 0; i < mySchedule.length; i++) {
		var start = moment(mySchedule[i].start, "HH:mm:ss").format("HH:mm");
		var stop = moment(mySchedule[i].stop, "HH:mm:ss").format("HH:mm");
		
		if(now == moment(start, "HH:mm").subtract(10, 'minutes').format("HH:mm")) {
			Push.create("Este timpul pentru somn!", {
				body: "In 10 minute ar trebui sa dormi.",
				onClick: function () {
					window.focus();
					this.close();
				}
			});
		}
		
		if(now == stop) {
			Push.create("Este timpul pentru somn!", {
				body: "In 10 minute ar trebui sa dormi.",
				onClick: function () {
					window.focus();
					this.close();
				}
			});
		}
	}

	setTimeout(verifyNextAlarm, 1000 * minute);
}

function viewBars () {
	ganttSvg = d3.select(".gantt")
	.append("div")
	.attr("class","d3-container container")
	.selectAll("svg").data(d3.range(1))
	.enter().append("svg")
	.attr("id","viz")
	.attr("width",width + m.right +m.left)
	.attr("height",height + m.top + m.bottom)
	.append("g")
	.attr('transform', 'translate(' + m.left + ', ' + m.top + ')');
	ganttSvg.call(tip);
	/* set up scales */

	var tfh = d3.time.scale()	//TwentyFourHour scale
	.domain([d3.time.hour(new Date(2017,0,1,0,0,0)),
		d3.time.hour(new Date(2017,0,2,0,0,0)),])
	.range([0,width]);

	/* add bars to chart */

	
	
	
	/*add axes and grid*/

	var xAxis = d3.svg.axis()
	.scale(tfh)
	.tickFormat(d3.time.format("%H:%M"));
	var xGrid = d3.svg.axis()
	.scale(tfh)
	.orient("bottom")
	.ticks(12);
	var yAxis = d3.svg.axis()
	.scale(y)
	.tickFormat(d3.time.format("%m/%d"));

	ganttSvg.append("g")
	.attr("class", "x top axis")
	.call(xAxis.orient("top"));	
	ganttSvg.append("g")
	.attr("class","x grid")
	.call(xGrid
		.tickSize(height, 0, 0)
		.tickFormat(""));
	ganttSvg.append("g")
	.attr("class","y left axis")
	.attr("class","axis-gantt")
	.attr('transform', 'translate(0,6)')
	.call(yAxis.orient("left"));
};

function app() {
	getActiveSchedule();
}

var sleep_record;

function getSleepRecords() {

	firebase.database().ref('/sleep_record/' + currentUser.uid).on('value', function(snapshot) {
		removeTableRows();
		var bars = document.querySelectorAll('rect:not(.default_bar)');
		
		for(var i = 0; i < bars.length; i++) {
			bars[i].parentNode.parentNode.removeChild(bars[i].parentNode);
		}

		sleep_record = snapshot.val();
		sleep_record = _.map(sleep_record, function(value, key) {
			value.id = key; 
			return value;
		});

		sleep_record = _.sortBy(sleep_record, 'start');
		sleep_record = _.groupBy(sleep_record, 'day');
		calculateScore();
		generateSleepRecords();
		document.querySelector('.wrapper').classList.remove('hide-div');
		document.querySelector('.spinner-wrapper').classList.add('hide-div');
	});
}

var score = {};

function calculateScore() {
	for (var i in sleep_record) {
		var total_sleep = 0;
		
		var slept = 0;

		for (var j = 0; j < sleep_record[i].length; j++) {
			var start_nap = moment(sleep_record[i][j].start).format("HH:mm:ss");
			start_nap = moment(start_nap, "HH:mm:ss");
			start_nap = start_nap.hours() * 60 + start_nap.minutes();
			
			var stop_nap = moment(sleep_record[i][j].stop).format("HH:mm:ss");
			stop_nap = moment(stop_nap, "HH:mm:ss");
			stop_nap = stop_nap.hours() * 60 + stop_nap.minutes();
			
			total_sleep += stop_nap - start_nap;
			var to_sleep = 0;

			for(var k = 0; k < schedule_settings.my_schedule.naps.length; k++) {
				var start_to_sleep = schedule_settings.my_schedule.naps[k].start;
				var stop_to_sleep = schedule_settings.my_schedule.naps[k].stop;

				to_sleep += stop_to_sleep - start_to_sleep;
				
				if(start_nap <= start_to_sleep && stop_nap > start_to_sleep) {
					if(stop_nap >= stop_to_sleep)
						slept += stop_to_sleep - start_to_sleep;
					if(stop_nap < stop_to_sleep)
						slept += stop_nap - start_to_sleep;
				}

				if(start_nap > start_to_sleep && start_nap < stop_to_sleep) {
					if(stop_nap >= stop_to_sleep)
						slept += stop_to_sleep - start_nap;
					if(stop_nap < stop_to_sleep)
						slept += stop_nap - start_nap;
				}
			}
		}
		var oversleep = total_sleep - slept;
		var debt = to_sleep - slept;
		score[i] = (to_sleep - debt * 0.5) - oversleep * 0.7;
		score[i] = (score[i] * 100) / to_sleep;
		score[i] = score[i].toFixed(0);
		if(score[i] < 0)
			score[i] = 0;
		if(score[i] >= 97)
			score[i] = 100;
		score[i] += '%';
	}
	drawScoreBlocks();
}

function drawScoreBlocks() {
	document.getElementById('sleepScore').innerHTML = '';
	for(var p = moment(first_day).format('YYYY-MM-DD'); p <= moment(last_day).format('YYYY-MM-DD'); p = moment(p).add(1, 'days').format("YYYY-MM-DD")) {
		var span = document.createElement('span');

		
		if(score[p] != null) {
			var text_span = document.createTextNode(score[p]);
		}
		else {
			var text_span = document.createTextNode('0%');
			span.style = "opacity: 0.2";

		}
		span.appendChild(text_span);

		document.getElementById('sleepScore').appendChild(span);
	}
}

function refreshSleepRecords() {
	var range = document.getElementById('range-date').value;
	var split_range = range.split(' to ');
	first_day = moment(split_range[0]).format('YYYY-MM-DD');
	last_day = moment(split_range[1]).format('YYYY-MM-DD');

	removeTableRows();
	var bars = document.querySelectorAll('rect:not(.default_bar)');

	for(var i = 0; i < bars.length; i++) {
		bars[i].parentNode.parentNode.removeChild(bars[i].parentNode);
	}

	dRange = [d3.time.day.floor(new Date(first_day)), 
	d3.time.day.ceil(new Date(last_day))];

	height = ((dRange[1]-dRange[0])/(24*60*60*1000))* barSize * 1.5;

	x = d3.time.scale()		
	.domain([0,24])
	.range([0, width]);

	y =d3.time.scale()
	.domain(dRange)
	.range([0, height]);

	document.querySelector('.gantt').removeChild(document.querySelector('.d3-container'));
	viewBars();
	addDefaultValues();
	generateSleepRecords();
	drawScoreBlocks();
}

function generateSleepRecords() {
	for(var p = moment(first_day).format('YYYY-MM-DD'); p <= moment(last_day).format('YYYY-MM-DD'); p = moment(p).add(1, 'days').format("YYYY-MM-DD")) {
		if(sleep_record[p])
			for( i=0; i<sleep_record[p].length;i++) {
				addTask(sleep_record[p][i]);
				addValuesIntoTable(sleep_record[p][i]);
			}
		}
	}

	function addTask(task) {

		hour = d3.time.format("%X"),
		ganttSvg.append("g")
		.attr("class","chart")
		.selectAll("rect")
		.data([task])

		.enter()
		.append("rect")

		.attr("class",function(d){
			var c = moment(new Date(d.stop)).diff(new Date(d.start), 'minutes');
			if(c <= 60)
				return("bar nap");
			else
				return("bar core");
		})

		.attr("x",function(d){
		var h = hour(new Date(d.start)).split(":"), //changes datum from string, to proper Date Object, back to hour string and splits
		xh = parseFloat(h[0])+parseFloat(h[1]/60); //time (hour and minute) as decimal
		return x(xh);
	})

		.attr("y",function(d) { 
			return y(d3.time.day.floor(new Date(d.start)))
		})

		.attr("width",function(d){
			var hstart = new Date(d.start),
			hstop = new Date(d.stop);
		return x((hstop-hstart)/3600000);	//date operations return a timestamp in miliseconds, divide to convert to hours
	})

		.attr("height",12)
		.attr("rx",7)
		.attr("ry",15)
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.append("svg:title")

		.datum(function(d){return Date.parse(d)});

		d3.selectAll('rect').transition()
		.duration(2000)
	};

	function addDefaultTask(task) {
		hour = d3.time.format("%X"),
		ganttSvg.append("g")
		.attr("class","chart")
		.selectAll("rect")
		.data([task])
		.enter()
		.append("rect")
		.attr("class",function(d){
			var c = moment(new Date(d.stop)).diff(d.start, 'minutes');
			if(c <= 60)
				return("bar nap default_bar");
			else
				return("bar core default_bar");
		})

		.attr("x",function(d){
		var h = hour(new Date(d.start)).split(":"), //changes datum from string, to proper Date Object, back to hour string and splits
		xh = parseFloat(h[0])+parseFloat(h[1]/60); //time (hour and minute) as decimal
		return x(xh);
	})
		.attr("y",function(d) { 
			return y(d3.time.day.floor(new Date(d.start)))
		})
		.attr("width",function(d){
			var hstart = new Date(d.start),
			hstop = new Date(d.stop);
		return x((hstop-hstart)/3600000);	//date operations return a timestamp in miliseconds, divide to convert to hours
	})
		.attr("height",12)
		.attr("rx",0)
		.attr("ry",0)
		.text(function(d){return(d.start)+' - '+(d.stop);})
		.datum(function(d){return Date.parse(d)})
		;
	};

	function addDefaultValues() {
		var interval;

		for(var p = moment(new Date(first_day)).format("YYYY-MM-DD"); p <= moment(new Date(last_day)).format("YYYY-MM-DD"); p = moment(p).add(1, 'days').format("YYYY-MM-DD"))
		{
			for(var y = 0; y < mySchedule.length; y++)
			{	
				interval = {start: moment(p).format("YYYY-MM-DD") + ' ' + mySchedule[y].start, stop: moment(p).format("YYYY-MM-DD") + ' ' + mySchedule[y].stop};
				addDefaultTask(interval);
			}
		}
	};

	function addTaskFromUI(nap) {
		nap.day = moment(new Date(nap.start)).format('YYYY-MM-DD');
		firebase.database().ref('/sleep_record/' + currentUser.uid).push().set(nap);
	};

	flatpickr('.flatpickr-data', {
		defaultDate: moment().format("YYYY-MM-DD")
	});

	flatpickr('.flatpickr-ora', {
		enableTime: true,
		noCalendar: true,
		time_24hr: true,
		dateFormat: "H:i",
		defaultDate: "0:00", 
		defaultHour: 0,
		defaultMinute: 0
	});

	flatpickr('.flatpickr-range', {
		mode: "range",
		defaultDate: [first_day, last_day]
	});

	function takeNapValuesFromInputs() {
		var day = document.getElementById('calendar').value;
		var start_hour = document.getElementById('start-nap').value;
		var stop_hour = document.getElementById('stop-nap').value;
		if(moment(stop_hour,"HH:mm").diff(moment(start_hour,"HH:mm"), 'minutes') >= 0)
		{
			var nap = {start: day + ' ' + start_hour + ':00', stop: day + ' ' + stop_hour + ':00'};
			addTaskFromUI(nap);
		}
		else {
			console.log('error');
		}
	};