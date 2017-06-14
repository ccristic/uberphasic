var program = {
	activities: [
	{start: 20, stop: 200},
	{start: 600, stop: 900},
	{start: 1400, stop: 1440}		
	]
};

function functie(){

	for(l in schedules)
	{
		for(var i=0; i <= 1440; i+=5)
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
					document.body.appendChild(list);
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