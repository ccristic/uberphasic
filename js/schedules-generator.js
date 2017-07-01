var intervals = [];
function app() {
	console.log('he');
	flatpickr('.flatpickr-ora', {
		enableTime: true,
		noCalendar: true,
		time_24hr: true,
		dateFormat: "H:i",
		defaultDate: "0:00", 
		defaultHour: 0,
		defaultMinute: 0
	});

}

function takeNapValuesFromInputs() {
		var start_hour = document.getElementById('start-nap').value;
		var stop_hour = document.getElementById('stop-nap').value;
		if(moment(stop_hour,"HH:mm").diff(moment(start_hour,"HH:mm"), 'minutes') >= 0)
		{
			var busy = {start: start_hour + ':00', stop: stop_hour + ':00'};
			intervals.push(busy);
			addValuesIntoTable(busy);
		}
	};