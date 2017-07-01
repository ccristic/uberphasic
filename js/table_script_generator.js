function edit_row(no) {
	document.getElementById("edit_button"+no).style.display="none";
	document.getElementById("save_button"+no).style.display="inline-block";

	var start=document.getElementById("start_row"+no);
	var stop=document.getElementById("stop_row"+no);

	var start_data=start.innerHTML;
	var stop_data=stop.innerHTML;

	start.innerHTML="<input type='text' id='start_text"+no+"' class='flatpickr-ora table-input' value='"+start_data+"'>";
	stop.innerHTML="<input type='text' id='stop_text"+no+"' class='flatpickr-ora table-input' value='"+stop_data+"'>";

	flatpickr('#start_text' + no, {
		enableTime: true,
		noCalendar: true,
		time_24hr: true,
		dateFormat: "H:i",
		defaultDate: start_data, 
		defaultHour: 0,
		defaultMinute: 0
	});

	flatpickr('#stop_text' + no, {
		enableTime: true,
		noCalendar: true,
		time_24hr: true,
		dateFormat: "H:i",
		defaultDate: stop_data, 
		defaultHour: 0,
		defaultMinute: 0
	});
}

function save_row(no, sleep_record) {
	var start_val=document.getElementById("start_text"+no).value;
	var stop_val=document.getElementById("stop_text"+no).value;
	document.getElementById("start_row"+no).innerHTML=start_val;
	document.getElementById("stop_row"+no).innerHTML=stop_val;
	document.getElementById("save_button"+no).style.display="none";
	document.getElementById("edit_button"+no).style.display="inline-block";

	sleep_record.start = start_val + ':00';
	sleep_record.stop =  stop_val + ':00';

	var new_record;
	new_record = Object.assign({}, sleep_record);
	delete new_record.id;


}

function delete_row(no, id) {
	document.getElementById("row"+no+"").outerHTML="";
}

function add_row() {
	var new_start=document.getElementById("start-nap").value;
	var new_stop=document.getElementById("stop-nap").value;

	var table=document.querySelector("#data_table tbody");
	var table_len=(table.rows.length)-1;
	var row = table.insertRow(table_len).outerHTML=
	"<tr id='row"+table_len+
	"'><td id='start_row"+table_len+"' class='table-cell'>"+new_start+
	"</td><td id='stop_row"+table_len+"' class='table-cell'>"+new_stop+
	"</td><td class='v-align'><button type='button' id='edit_button"+table_len+"' class='glyphter edit button-table' onclick='edit_row("+table_len+")'>G</button> <button type='button' id='save_button"+table_len+"' class='glyphter save button-table' style='display: none' onclick='save_row("+table_len+")'>H</button> <button type='button' class='button-table glyphter delete' onclick='delete_row("+table_len+")'>I</button></td></tr>";
}

function addValuesIntoTable(sleep_record) {
	var start_hour = moment(sleep_record.start, "HH:mm").format('HH:mm');
	var stop_hour = moment(sleep_record.stop, "HH:mm").format('HH:mm');
	
	var table=document.querySelector("#data_table tbody");
	var table_len=(table.rows.length)-1;
	var row = table.insertRow(table_len).outerHTML=
	"<tr id='row"+table_len+
	"'><td id='start_row"+table_len+"' class='table-cell'>"+start_hour+
	"</td><td id='stop_row"+table_len+"' class='table-cell'>"+stop_hour+
	"</td><td class='v-align'><button type='button' id='edit_button"+table_len+"' class='glyphter edit button-table' onclick='edit_row("+table_len+")'>G</button> <button type='button' id='save_button"+table_len+"' class='glyphter save button-table' style='display: none' onclick='save_row(" + table_len + ',' + JSON.stringify(sleep_record) + ")'>H</button> <button type='button' class='button-table glyphter delete' onclick='delete_row(" + table_len + ',' + JSON.stringify(sleep_record.id) + ")'>I</button></td></tr>";
}

function removeTableRows() {
	var table=document.querySelector("#data_table tbody");
	table.innerHTML = "";
}
