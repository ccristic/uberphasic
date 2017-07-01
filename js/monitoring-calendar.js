    
var title="Scor";
var units=" dead or missing";
var breaks=[10,25,50,75];
var colours=["rgba(29,255,167, 0.2)","rgba(29,255,167, 0.4)","rgba(29,255,167, 0.6)","rgba(29,255,167, 0.8)","rgba(29,255,167, 1)"];


var tip = d3.tip()  
.attr('class', 'd3-tip')
.offset([-10, 0])
.html(function(d) {
    return "<strong>Date:</strong> <span style='color:#7a7cc7'>" + moment(d.date).format("YYYY/MM/DD") + " </span> </br> <strong>Score: </strong><span style='color:#7a7cc7'>" + d.value + "</span>";

})

var data = [];
var sleep_record;
var schedule_settings;

function app() {
    getActiveSchedule();
}

function getActiveSchedule() {
    firebase.database().ref('/schedule_settings/' + currentUser.uid).once('value').then(function(snapshot) {
        schedule_settings = snapshot.val();
        getSleepRecords();
    });

}

function getSleepRecords() {

    firebase.database().ref('/sleep_record/' + currentUser.uid).on('value', function(snapshot) {
        sleep_record = snapshot.val();
        sleep_record = _.map(sleep_record, function(value, key) {
            value.id = key; 
            return value;
        });

        sleep_record = _.sortBy(sleep_record, 'start');
        sleep_record = _.groupBy(sleep_record, 'day');  
        console.log(schedule_settings);
        calculateCalendarScore();
        generateCalendar();
        document.querySelector('.wrapper').classList.remove('hide-div');
        document.querySelector('.spinner-wrapper').classList.add('hide-div');
    });
}

var score = {}; 
function calculateCalendarScore() {

    for (var i in sleep_record) {
        var total_sleep = 0;
        
        var slept = 0;

        for (var j = 0; j < sleep_record[i].length; j++) {
            var start_nap = moment(sleep_record[i][j].start).format("HH:mm:ss");
            start_nap = moment(start_nap, "HH:mm:ss");
            start_nap = start_nap.hours() * 60 + start_nap.minutes();
            
            var stop_nap = moment(sleep_record[i][j].stop).format("HH:mm:ss");
            stop_nap = moment(stop_nap, "HH:mm:ss");
            stop_nap = stop_nap.hours() * 60 + stop_nap.minutes();
            
            total_sleep += stop_nap - start_nap;
            var to_sleep = 0;

            for(var k = 0; k < schedule_settings.my_schedule.naps.length; k++) {
                var start_to_sleep = schedule_settings.my_schedule.naps[k].start;
                var stop_to_sleep = schedule_settings.my_schedule.naps[k].stop;

                to_sleep += stop_to_sleep - start_to_sleep;
                
                if(start_nap <= start_to_sleep && stop_nap > start_to_sleep) {
                    if(stop_nap >= stop_to_sleep)
                        slept += stop_to_sleep - start_to_sleep;
                    if(stop_nap < stop_to_sleep)
                        slept += stop_nap - start_to_sleep;
                }

                if(start_nap > start_to_sleep && start_nap < stop_to_sleep) {
                    if(stop_nap >= stop_to_sleep)
                        slept += stop_to_sleep - start_nap;
                    if(stop_nap < stop_to_sleep)
                        slept += stop_nap - start_nap;
                }
            }
        }
        var oversleep = total_sleep - slept;
        var debt = to_sleep - slept;
        console.log(to_sleep, slept, debt, oversleep, total_sleep);
        score[i] = slept - oversleep * 0.5;
        score[i] = (score[i] * 100) / to_sleep;
        score[i] = score[i].toFixed(0);
        if(score[i] < 0)
            score[i] = 0;
        if(score[i] >= 90)
            score[i] = 100;

        data.push({
            date: moment(new Date(i)).format('DD/MM/YY'),
            value: score[i]
        });
    }
}


var cellSize = 17;
var xOffset=20;
var yOffset=60;
    var calY=50;//offset of calendar in each group
    var calX=25;
    var width = 960;
    var height = 163;
    var parseDate = d3.time.format("%d/%m/%y").parse;
    format = d3.time.format("%d-%m-%Y");
    toolDate = d3.time.format("%d/%b/%y");
    var data = [];
    function generateCalendar() {
    //general layout information
    
    
    
    

        //set up an array of all the dates in the data which we need to work out the range of the data
        var dates = new Array();
        var values = new Array();
        
        console.log(data);
        //parse the data
        data.forEach(function(d)    {
            dates.push(parseDate(d.date));
            values.push(d.value);
            d.date=parseDate(d.date);
            d.value=d.value;
                d.year=d.date.getFullYear();//extract the year from the data
            });
        
        var yearlyData = d3.nest()
        .key(function(d){return d.year;})
        .entries(data);
        
        var svg = d3.select(".wrapper").append("svg")
        .attr("width","90%")
        .attr("viewBox","0 0 "+(xOffset+width)+" 540")
        
        //title
        svg.append("text")
        .attr("x",xOffset)
        .attr("y",20)
        .text(title);
        svg.call(tip);
        
        //create an SVG group for each year
        var cals = svg.selectAll("g")
        .data(yearlyData)
        .enter()
        .append("g")
        .attr("id",function(d){
            return d.key;
        })

        .attr("transform",function(d,i){
            return "translate(0,"+(yOffset+(i*(height+calY)))+")";  
        })
        
        var labels = cals.append("text")
        .attr("class","yearLabel")
        .attr("x",xOffset)
        .attr("y",15)
        .text(function(d){return d.key});
        
        //create a daily rectangle for each year
        var rects = cals.append("g")
        .attr("id","alldays")
        .selectAll(".day")
        .data(function(d) { return d3.time.days(new Date(parseInt(d.key), 0, 1), new Date(parseInt(d.key) + 1, 0, 1)); })
        .enter().append("rect")
        .attr("id",function(d) {
            return "_"+format(d);
                //return toolDate(d.date)+":\n"+d.value+" dead or missing";
            })
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        
        .attr("x", function(d) {
            return xOffset+calX+(d3.time.weekOfYear(d) * cellSize);
        })
        .attr("y", function(d) { return calY+(d.getDay() * cellSize); })
        .datum(format);
        
        //create day labels
        var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        var dayLabels=cals.append("g").attr("id","dayLabels")
        days.forEach(function(d,i)    {
            dayLabels.append("text")
            .attr("class","dayLabel")
            .attr("x",xOffset)
            .attr("y",function(d) { return calY+(i * cellSize); })
            .attr("dy","0.9em")
            .text(d);
        })
        
        //let's draw the data on
        var dataRects = cals.append("g")
        .attr("id","dataDays")
        .selectAll(".dataday")
        .data(function(d){
            return d.values;   
        })

        .enter()
        .append("rect")
        .attr("id",function(d) {
            return format(d.date)+":"+d.value;
        })
        .attr("stroke","#2a2b46")
        .attr("width",cellSize)
        .attr("height",cellSize)
        .attr("x", function(d){return xOffset+calX+(d3.time.weekOfYear(d.date) * cellSize);})
        .attr("y", function(d) { return calY+(d.date.getDay() * cellSize); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .attr("fill", function(d) {
            if (d.value<breaks[0]) {
                return colours[0];
            }
            for (i=0;i<breaks.length+1;i++){
                if (d.value>=breaks[i]&&d.value<breaks[i+1]){
                    return colours[i];
                }
            }
            if (d.value>breaks.length-1){
                return colours[breaks.length]   
            }
        })     
        
        //add montly outlines for calendar
        cals.append("g")
        .attr("id","monthOutlines")
        .selectAll(".month")
        .data(function(d) { 
            return d3.time.months(new Date(parseInt(d.key), 0, 1),
              new Date(parseInt(d.key) + 1, 0, 1)); 
        })
        .enter().append("path")
        .attr("class", "month")
        .attr("transform","translate("+(xOffset+calX)+","+calY+")")
        .attr("d", monthPath);
        
        console.log(cals);
        //retreive the bounding boxes of the outlines
        var BB = new Array();
        var mp = document.getElementById("monthOutlines").childNodes;
        for (var i=0;i<mp.length;i++){
            BB.push(mp[i].getBBox());
        }
        
        var monthX = new Array();
        BB.forEach(function(d,i){
            boxCentre = d.width/2;
            monthX.push(xOffset+calX+d.x+boxCentre);
        })

        //create centred month labels around the bounding box of each month path
        //create day labels
        var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        var monthLabels=cals.append("g").attr("id","monthLabels")
        months.forEach(function(d,i)    {
            monthLabels.append("text")
            .attr("class","monthLabel")
            .attr("x",monthX[i])
            .attr("y",calY/1.2)
            .text(d);
        })
        
         //create key
         var key = svg.append("g")
         .attr("id","key")
         .attr("class","key")
         .attr("transform",function(d){
            return "translate("+xOffset+","+(yOffset-(cellSize*1.5))+")";
        });
         
         key.selectAll("rect")
         .data(colours)
         .enter()
         .append("rect")
         .attr("width",cellSize)
         .attr("height",cellSize)
         .attr("x",function(d,i){
            return i*130;
        })
         .attr("fill",function(d){
            return d;
        });
         
         key.selectAll("text")
         .data(colours)
         .enter()
         .append("text")
         .attr("x",function(d,i){
            return cellSize+5+(i*130);
        })
         .attr("y","1em")
         .text(function(d,i){
            if (i<colours.length-1){
                return "up to "+breaks[i];
            }   else    {
                return "100";   
            }
        });
     }



    //pure Bostock - compute and return monthly path data for any year
    function monthPath(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
      d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
  }
