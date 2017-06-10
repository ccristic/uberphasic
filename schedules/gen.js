var uberman = {
	naps: [
	{inceput: 0, sfarsit: 20}, 
	{inceput: 240, sfarsit: 260}, 
	{inceput: 480, sfarsit: 500},
	{inceput: 720, sfarsit: 740}, 
	{inceput: 960, sfarsit: 980}, 
	{inceput: 1200, sfarsit: 1220}, 
	]
};

var program = {
	activitati: [
	{inceput: 20, sfarsit: 200},
	{inceput: 1400, sfarsit: 1440}		
	]
};

function functie(){

	for(var i=0; i <= 1440; i+=5)
	{
		var ok = 1;
		for(var x = 0; x < uberman.naps.length; x++)
			for(var y = 0; y < program.activitati.length; y++)
			{
				if((program.activitati[y].inceput >= uberman.naps[x].inceput && program.activitati[y].inceput < uberman.naps[x].sfarsit) || 
					(program.activitati[y].sfarsit > uberman.naps[x].inceput && program.activitati[y].sfarsit < uberman.naps[x].sfarsit) || 
					(uberman.naps[x].inceput >= program.activitati[y].inceput && uberman.naps[x].inceput < program.activitati[y].sfarsit) ||
					(uberman.naps[x].sfarsit > program.activitati[y].inceput && uberman.naps[x].sfarsit < program.activitati[y].sfarsit))
				{
					ok = 0;
				}
			}
			if(ok == 1)
			{
				var list = document.createElement("ul");
				for(var k = 0; k < uberman.naps.length; k++)
				{
					var item = document.createElement("li");
					item.appendChild(document.createTextNode(uberman.naps[k].inceput));
					list.appendChild(item);
					item = document.createElement("li");
					item.appendChild(document.createTextNode(uberman.naps[k].sfarsit));
					list.appendChild(item);
				}
				document.body.appendChild(list);
			}


			for(var j = 0; j < uberman.naps.length; j++)
			{
				uberman.naps[j].inceput += 5;
				if(uberman.naps[j].inceput >= 1440)
					uberman.naps[j].inceput -= 1440;

				uberman.naps[j].sfarsit += 5;
				if(uberman.naps[j].sfarsit >= 1440)
					uberman.naps[j].sfarsit -= 1440;

			}
			
		}
	}