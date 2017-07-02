var hour_to_minutes = 0;
function startRotateChart() {
	hour_to_minutes = moment(document.getElementById('start-nap').value, "HH:mm");
	hour_to_minutes = hour_to_minutes.hours() * 60 + hour_to_minutes.minutes();
	update(hour_to_minutes);
	document.getElementById('save-button').disabled = false;
}
var mySchedule;
var mySchedule2;
var myChart;
var schedule_settings;
function app() {
	firebase.database().ref('/schedule_settings/' + currentUser.uid).once('value').then(function(snapshot) {
		schedule_settings = snapshot.val();

		mySchedule = schedules[schedule_settings.schedule];
		mySchedule2 = schedules[schedule_settings.schedule];

		var id = "myChart";
		myChart = createChart(mySchedule, id);
		addScheduleDetails(schedule_settings);
		generateScheduleStatistics();

		createAlarms();
		flatpickr('.flatpickr-ora', {
	        enableTime: true,
	        noCalendar: true,
	        time_24hr: true,
	        dateFormat: "H:i",
	        defaultDate: moment().startOf('day').add(schedule_settings.my_schedule.naps[0].start, 'minutes').format('HH:mm'),
	        defaultHour: 0,
	        defaultMinute: 0
	    });
	    startRotateChart();
		document.getElementById('save-button').disabled = true;
		document.querySelector('.wrapper').classList.remove('hide-div');
		document.querySelector('.spinner-wrapper').classList.add('hide-div');

	})
		 //..
}

function addScheduleDetails(schedule_settings) {
	var name = schedules[schedule_settings.schedule].title;
	var title = document.createElement('h1');
	title.className = "schedule_title";
	var titleContainer = document.createTextNode(name + " sleep pattern");
	title.appendChild(titleContainer);

	document.getElementById('details').appendChild(title);

	var description = schedules[schedule_settings.schedule].description;
	var paragraph = document.createElement('p');
	paragraph.className = "schedule_description";
	var paragraphContainer = document.createTextNode(description);
	paragraph.appendChild(paragraphContainer);

	document.getElementById('details').appendChild(paragraph);

	button = document.createElement('button');
	button.className = "apply_button button-change";
	button.setAttribute('schedule', schedule_settings.schedule);
	button.addEventListener("click", assignScheduleToUser);
	var buttonContainer = document.createTextNode('Reset schedule');
	button.appendChild(buttonContainer);
	document.getElementById('right-align').appendChild(button);
}

function assignScheduleToUser(event) {
    console.log(event.target.getAttribute('schedule'));
    var my_schedule = schedules[event.target.getAttribute('schedule')];
    firebase.database().ref('schedule_settings/' + currentUser.uid).set({
        schedule: event.target.getAttribute('schedule'),
        my_schedule: Object.assign({}, my_schedule)
    }).then(function(res) {
        window.location = '../monitoring/my-schedule.html';
    });
}

function update(minutes) {
	var angle = (-0.5 * Math.PI) + ((minutes/60) * 15)/180 * Math.PI;
	updateAlarms();
	myChart.options.rotation = angle;
	myChart.update();
}

function createAlarms() {
	for (var i=0; i<mySchedule.naps.length; i ++) {
        var alarmsDiv = document.createElement('div');
        alarmsDiv.classList.add('row');
		var new_input = document.createElement('input');
		var offtime = 10; //notify me 10 minutes before bed time
		var sleep_alarm =	moment().startOf('day').add(mySchedule.naps[i].start + hour_to_minutes - offtime, 'minutes').format('HH:mm');
		new_input.value = sleep_alarm;
		new_input.id = "sleep_alarm" + i;
		new_input.setAttribute("readonly", true);
        alarmsDiv.appendChild(new_input);

		new_input = document.createElement('input');
		var wake_alarm =	moment().startOf('day').add(mySchedule.naps[i].stop + hour_to_minutes, 'minutes').format('HH:mm');
		new_input.value = wake_alarm;
		new_input.id = "wake_alarm" + i;
		new_input.setAttribute("readonly", true);
        
        alarmsDiv.appendChild(new_input);
		document.getElementById('alarms').appendChild(alarmsDiv);
	}
}

function updateAlarms() {
	for (var i=0; i<mySchedule2.naps.length; i ++) {

		var offtime = 10; //notify me 10 minutes before bed time
		var sleep_alarm =	moment().startOf('day').add(mySchedule2.naps[i].start + hour_to_minutes - offtime, 'minutes').format('HH:mm');
		document.getElementById('sleep_alarm' + i).value = sleep_alarm;

		var wake_alarm =	moment().startOf('day').add(mySchedule2.naps[i].stop + hour_to_minutes, 'minutes').format('HH:mm');
		document.getElementById('wake_alarm' + i).value = wake_alarm;
	}
}


function saveUpdatedSchedule() {

mySchedule = JSON.parse(JSON.stringify(Object.assign({}, mySchedule2)));
var end_for = mySchedule.naps.length;
for(var i = 0; i < end_for; i++) {

	mySchedule.naps[i].start += hour_to_minutes;

if(mySchedule.naps[i].start > 1440) //keeping at 24h clock
	mySchedule.naps[i].start -= 1440;

mySchedule.naps[i].stop += hour_to_minutes;


if(mySchedule.naps[i].stop > 1440) //keeping at 24h clock
	mySchedule.naps[i].stop -= 1440;

if(mySchedule.naps[i].stop < mySchedule.naps[i].start) {
	var obj = {start: 0, stop: mySchedule.naps[i].stop};
	mySchedule.naps[i].stop = 1439;
	mySchedule.naps.push(obj);
}
}

firebase.database().ref('/schedule_settings/' + currentUser.uid + '/my_schedule').set(mySchedule);
document.getElementById('save-button').disabled = true;
generateScheduleStatistics();
}

function generateScheduleStatistics() {
    var sleep_duration = 0, nap_duration = 0, core_duration = 0, total_duration = 0;
    var naps = 0, cores = 0;
    var active_duration = 0;

    for(var i = 0; i < mySchedule2.naps.length; i++) {
        sleep_duration = mySchedule2.naps[i].stop - mySchedule2.naps[i].start;
        if(sleep_duration <= 60)
            nap_duration += sleep_duration, naps++;
        else
            core_duration += sleep_duration, cores++;
    }
    total_duration = nap_duration + core_duration;
    active_duration = 1440 - total_duration;

    nap_duration =	moment().startOf('day').add(nap_duration, 'minutes').format('HH:mm');
    core_duration =	moment().startOf('day').add(core_duration, 'minutes').format('HH:mm');
    total_duration =	moment().startOf('day').add(total_duration, 'minutes').format('HH:mm');
    active_duration =	moment().startOf('day').add(active_duration, 'minutes').format('HH:mm');
    document.getElementById('total_duration').value = total_duration;
    document.getElementById('active_duration').value = active_duration;
    document.getElementById('cores').value = cores;
    document.getElementById('naps').value = naps;
    document.getElementById('core_duration').value = core_duration;
    document.getElementById('nap_duration').value = nap_duration;
}
