function edit_row(no) {
	document.getElementById("edit_button"+no).style.display="none";
	document.getElementById("save_button"+no).style.display="inline-block";

	var date=document.getElementById("date_row"+no);
	var start=document.getElementById("start_row"+no);
	var stop=document.getElementById("stop_row"+no);

	var date_data=date.innerHTML;
	var start_data=start.innerHTML;
	var stop_data=stop.innerHTML;

	date.innerHTML="<input type='text' id='date_text"+no+"' class='flatpickr-data table-input' value='"+date_data+"'>";
	start.innerHTML="<input type='text' id='start_text"+no+"' class='flatpickr-ora table-input' value='"+start_data+"'>";
	stop.innerHTML="<input type='text' id='stop_text"+no+"' class='flatpickr-ora table-input' value='"+stop_data+"'>";

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
}

function save_row(no) {
	var date_val=document.getElementById("date_text"+no).value;
	var start_val=document.getElementById("start_text"+no).value;
	var stop_val=document.getElementById("stop_text"+no).value;
	document.getElementById("date_row"+no).innerHTML=date_val;
	document.getElementById("start_row"+no).innerHTML=start_val;
	document.getElementById("stop_row"+no).innerHTML=stop_val;
	document.getElementById("save_button"+no).style.display="none";
	document.getElementById("edit_button"+no).style.display="inline-block";
}

function delete_row(no) {
	document.getElementById("row"+no+"").outerHTML="";
}

function add_row() {
	var new_date=document.getElementById("calendar").value;
	var new_start=document.getElementById("start-nap").value;
	var new_stop=document.getElementById("stop-nap").value;

	var table=document.getElementById("data_table");
	var table_len=(table.rows.length)-1;
	var row = table.insertRow(table_len).outerHTML=
	"<tr id='row"+table_len+
	"'><td id='date_row"+table_len+"' class='table-cell'>"+new_date+
	"</td><td id='start_row"+table_len+"' class='table-cell'>"+new_start+
	"</td><td id='stop_row"+table_len+"' class='table-cell'>"+new_stop+
	"</td><td class='v-align'><button type='button' id='edit_button"+table_len+"' class='glyphter edit button-table' onclick='edit_row("+table_len+")'>G</button> <button type='button' id='save_button"+table_len+"' class='glyphter save button-table' style='display: none' onclick='save_row("+table_len+")'>H</button> <button type='button' class='button-table glyphter delete' onclick='delete_row("+table_len+")'>I</button></td></tr>";
}
