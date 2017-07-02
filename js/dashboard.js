var hour_to_minutes = 0;
var alarms = [];
var nextAlarm = Infinity;
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

        hour_to_minutes = moment().startOf('day').add(schedule_settings.my_schedule.naps[0].start, 'minutes');
        document.getElementById('start-nap').disabled = true;
		document.getElementById('start-nap').value = hour_to_minutes.format('HH:mm');
	    startRotateChart();
		document.querySelector('.wrapper').classList.remove('hide-div');
		document.querySelector('.spinner-wrapper').classList.add('hide-div');

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

        for(var i =0; i < alarms.length; i++) {
           var diff = moment(alarms[i], "HH:mm").diff(moment());
            if (diff > 0 && diff < nextAlarm) {
                nextAlarm = diff;
            }
        }

        var nextAlarmTime = moment.duration(nextAlarm);
        var conjunctie = nextAlarmTime.minutes() < 10 ? '' : 'de';

        if(nextAlarmTime.hours() > 0) {
            document.querySelector('.sleep_left').innerHTML = 'Mai aveti ' + nextAlarmTime.hours() + " ore si " + nextAlarmTime.minutes() + " " + conjunctie + " minute pana la urmatoarea alarma";
        } else {
            document.querySelector('.sleep_left').innerHTML = 'Mai aveti ' + nextAlarmTime.minutes() + " " + conjunctie + " minute pana la urmatoarea alarma";
        }
	})
}

function addScheduleDetails(schedule_settings) {
	var name = schedules[schedule_settings.schedule].title;
	var title = document.createElement('h1');
	title.className = "schedule_title";
	var titleContainer = document.createTextNode(name + " sleep pattern");
	title.appendChild(titleContainer);

	document.getElementById('details').appendChild(title);
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

function startRotateChart() {
	hour_to_minutes = hour_to_minutes.hours() * 60 + hour_to_minutes.minutes();
	update(hour_to_minutes);
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
        alarms.push(sleep_alarm);
		document.getElementById('sleep_alarm' + i).value = sleep_alarm;

		var wake_alarm =	moment().startOf('day').add(mySchedule2.naps[i].stop + hour_to_minutes, 'minutes').format('HH:mm');
		document.getElementById('wake_alarm' + i).value = wake_alarm;
	}
}


function takeNapValuesFromInputs() {
    var day = document.getElementById('calendar').value;
    var start_hour = document.getElementById('start-sleep').value;
    var stop_hour = document.getElementById('stop-sleep').value;
    if (stop_hour == "00:00") {
        stop_hour = "23:59";
    }
    if(moment(stop_hour,"HH:mm").diff(moment(start_hour,"HH:mm"), 'minutes') >= 0) {
        var nap = {start: day + ' ' + start_hour + ':00', stop: day + ' ' + stop_hour + ':00'};
    }
    else {
        var nap = {start: day + ' ' + stop_hour + ':00', stop: day + ' ' + start_hour + ':00'};
    }

    nap.day = moment(new Date(nap.start)).format('YYYY-MM-DD');
    firebase.database().ref('/sleep_record/' + currentUser.uid).push().set(nap);

    flatpickr('.flatpickr-ora', {
            enableTime: true,
            noCalendar: true,
            time_24hr: true,
            dateFormat: "H:i",
            defaultDate: "0:00",
            defaultHour: 0,
            defaultMinute: 0
        });
};
