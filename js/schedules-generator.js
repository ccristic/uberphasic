var intervals = [];
function app() {
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
		var hour_to_minutes1 = moment(start_hour, "HH:mm");
		hour_to_minutes1 = hour_to_minutes1.hours() * 60 + hour_to_minutes1.minutes();
		var hour_to_minutes2 = moment(stop_hour, "HH:mm");
		hour_to_minutes2 = hour_to_minutes2.hours() * 60 + hour_to_minutes2.minutes();
		console.log(hour_to_minutes1, hour_to_minutes2);
		program.activities.push(
							{
									"start" : hour_to_minutes1,
									"stop" : hour_to_minutes2
							});
		console.log(program);

    if(moment(stop_hour,"HH:mm").diff(moment(start_hour,"HH:mm"), 'minutes') >= 0)
    {
        var busy = {start: start_hour + ':00', stop: stop_hour + ':00'};
        intervals.push(busy);
        addValuesIntoTable(busy);
    }
};

var program = {
	activities: []
};

function functie(){

	for(l in schedules)
	{
		for(var i = 0; i <= 1440; i+=5)
		{
			var ok = 1;
			for(var x = 0; x < schedules[l].naps.length; x++)
				for(var y = 0; y < program.activities.length; y++)
				{
					if((program.activities[y].start >= schedules[l].naps[x].start && program.activities[y].start < schedules[l].naps[x].stop) ||
						(program.activities[y].stop > schedules[l].naps[x].start && program.activities[y].stop < schedules[l].naps[x].stop) ||
						(schedules[l].naps[x].start >= program.activities[y].start && schedules[l].naps[x].start < program.activities[y].stop) ||
						(schedules[l].naps[x].stop > program.activities[y].start && schedules[l].naps[x].stop < program.activities[y].stop))
					{
						ok = 0;
					}
				}
				if(ok == 1)
				{
					/*var list = document.createElement("ul");
					for(var k = 0; k < schedules[l].naps.length; k++)
					{
						var item = document.createElement("li");
						item.appendChild(document.createTextNode(schedules[l].naps[k].start));
						list.appendChild(item);
						item = document.createElement("li");
						item.appendChild(document.createTextNode(schedules[l].naps[k].stop));
						list.appendChild(item);
					}
					document.body.appendChild(list);*/

					var list = document.createElement("ul");
					var item = document.createElement("li");
					item.appendChild(document.createTextNode(l));
					list.appendChild(item);
					document.getElementById('schedule-generated').appendChild(list);
					break;
				}


				for(var j = 0; j < schedules[l].naps.length; j++)
				{
					schedules[l].naps[j].start += 5;
					if(schedules[l].naps[j].start >= 1440)
						schedules[l].naps[j].start -= 1440;

					schedules[l].naps[j].stop += 5;
					if(schedules[l].naps[j].stop >= 1440)
						schedules[l].naps[j].stop -= 1440;

				}

			}
		}
	}
