function getChartDataFromSchedule(schedule) {
    var hours = [], colors = [], labels = [];

    for (var i = 0; i < schedule.naps.length; i++) {
        hours.push(((schedule.naps[i].stop - schedule.naps[i].start)/60).toFixed(2));

        if(hours[hours.length-1] <= 1) {
            labels.push(' Nap');
            colors.push('#ff3f68'); 
        }
        else {
            labels.push(' Core');
            colors.push('#ffce0a');
        }

        if (i< schedule.naps.length - 1) {
            hours.push(((schedule.naps[i+1].start - schedule.naps[i].stop)/60).toFixed(2)); 
            colors.push('#3b3c5b');
            labels.push(' Awake');
        }
        else { 
            hours.push(((1440 - schedule.naps[i].stop)/60).toFixed(2)); 
            colors.push('#3b3c5b'); 
            labels.push(' Awake');   
        }
    }
    return {
        type: 'pie',
        options: {
            legend: {
                display: false
            }
        },
        data: {
            datasets: [{
                data: hours,
                backgroundColor: colors,                        
                borderWidth: 0
            }],
            labels: labels
        }
    };
}
function createChart(schedule, canvasId) {
    var data = getChartDataFromSchedule(schedule);
    var ctx = document.getElementById(canvasId);
    var myChart = new Chart(ctx, data);

    return myChart;
}

function  createContainer(canvasId) {
    var scheduleList = document.createElement('div');
    scheduleList.className = "schedule_list";

    var canvas = document.createElement('canvas');
    canvas.id = canvasId;
    var canvasContainer = document.createElement('div');
    canvasContainer.className = "schedule_pie";
    canvasContainer.id = "container-" + canvasId;

    canvasContainer.appendChild(canvas);  
    scheduleList.appendChild(canvasContainer);
    document.getElementById('wrapper').appendChild(scheduleList);

    canvas = document.createElement('h1');
    canvas.className = "schedule_title";
    canvasContainer = document.createTextNode(schedules[canvasId].title + " sleep pattern");
    canvas.appendChild(canvasContainer);

    var text_wrapper = document.createElement('div');
    text_wrapper.className = "schedule_text";

    text_wrapper.appendChild(canvas);

    canvas = document.createElement('p');
    canvas.className = "schedule_description";
    canvasContainer = document.createTextNode(schedules[canvasId].description);
    canvas.appendChild(canvasContainer);

    text_wrapper.appendChild(canvas);
    scheduleList.appendChild(text_wrapper);

    canvas = document.createElement('button');
    canvas.className = "apply_button";
    canvas.setAttribute('schedule', canvasId);
    canvas.addEventListener("click", assignScheduleToUser);
    canvasContainer = document.createTextNode('Apply');
    canvas.appendChild(canvasContainer);            

    text_wrapper.appendChild(canvas);
    scheduleList.appendChild(text_wrapper);
}

function app(user) {
    for (scheduleId in schedules) {
        createContainer(scheduleId);
        createChart(schedules[scheduleId], scheduleId);
    }
}

function assignScheduleToUser(event) {
    console.log(event.target.getAttribute('schedule'));
    firebase.database().ref('schedule_settings/' + currentUser.uid).set({
        schedule: event.target.getAttribute('schedule')
    }).then(function(res) {
        window.location = '../monitoring/my-schedule.html';
    });
}

function update() {
    var my_schedule;
    var schedule_settings = snapshot.val();
    my_schedule = Object.assign({}, schedules[schedule_settings.schedule]);
    my_schedule.naps[0].start = 200;
    createChart(my_schedule, schedule_settings.schedule);
    console.log(my_schedule);

}
