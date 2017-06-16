

function edit_row(no)
{
	document.getElementById("edit_button"+no).style.display="none";
	document.getElementById("save_button"+no).style.display="inline-block";

	var name=document.getElementById("name_row"+no);
	var country=document.getElementById("country_row"+no);
	var age=document.getElementById("age_row"+no);

	var name_data=name.innerHTML;
	var country_data=country.innerHTML;
	var age_data=age.innerHTML;

	name.innerHTML="<input type='text' id='name_text"+no+"' class='flatpickr-data' value='"+name_data+"'>";
	country.innerHTML="<input type='text' id='country_text"+no+"' class='flatpickr-ora' value='"+country_data+"'>";
	age.innerHTML="<input type='text' id='age_text"+no+"' class='flatpickr-ora' value='"+age_data+"'>";

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

function save_row(no)
{
	var name_val=document.getElementById("name_text"+no).value;
	var country_val=document.getElementById("country_text"+no).value;
	var age_val=document.getElementById("age_text"+no).value;
	document.getElementById("name_row"+no).innerHTML=name_val;
	document.getElementById("country_row"+no).innerHTML=country_val;
	document.getElementById("age_row"+no).innerHTML=age_val;
	document.getElementById("save_button"+no).style.display="none";
	document.getElementById("edit_button"+no).style.display="inline-block";
}

function delete_row(no)
{
	document.getElementById("row"+no+"").outerHTML="";
}

function add_row()
{
	var new_name=document.getElementById("calendar").value;
	var new_country=document.getElementById("start-nap").value;
	var new_age=document.getElementById("stop-nap").value;

	var table=document.getElementById("data_table");
	var table_len=(table.rows.length)-1;
	var row = table.insertRow(table_len).outerHTML="<tr id='row"+table_len+"'><td id='name_row"+table_len+"'>"+new_name+"</td><td id='country_row"+table_len+"'>"+new_country+"</td><td id='age_row"+table_len+"'>"+new_age+"</td><td><button type='button' id='edit_button"+table_len+"' class='edit' onclick='edit_row("+table_len+")'>Edit</button> <button type='button' id='save_button"+table_len+"' class='save' style='display: none' onclick='save_row("+table_len+")'>Save</button> <button type='button' class='delete' onclick='delete_row("+table_len+")'>Delete</button></td></tr>";

}

