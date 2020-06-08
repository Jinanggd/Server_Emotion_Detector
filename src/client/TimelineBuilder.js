function buildTimeline(obj, container){

    google.charts.load('current',{'packages':['timeline']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart(){
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();


        dataTable.addColumn({ type: 'string', id: 'Emotion' });
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });
        dataTable.addRows(parseObject(obj));

        chart.draw(dataTable);
    }
}

function parseObject(obj){
    if(!obj.emotions || obj.emotions.length == 0) return;
    console.log(obj);
    var res = [];
    var starttime = 0;
    var emotions = obj.emotions;
    for( var i = 0; i < emotions.length; ++i ){
        var arr = [];
        var em = emotions[i];

        // if you want to label an emotion with a certain color
        // dataTable.addColumn({ type: 'string', id: 'Role' });
        // dataTable.addColumn({ type: 'string', id: 'Name' });
        // dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
        // dataTable.addColumn({ type: 'date', id: 'Start' });
        // dataTable.addColumn({ type: 'date', id: 'End' });
        // dataTable.addRows([
        //     [ 'President', 'George Washington', '#cbb69d', new Date(1789, 3, 30), new Date(1797, 2, 4)],
        //     [ 'President', 'John Adams', '#603913', new Date(1797, 2, 4), new Date(1801, 2, 4) ],
        //     [ 'President', 'Thomas Jefferson', '#c69c6e', new Date(1801, 2, 4), new Date(1809, 2, 4) ]]);

        arr.push(em.emotion.toUpperCase());
        arr.push(new Date(starttime));
        starttime += em.dur*1000;
        arr.push(new Date(starttime));
        res.push(arr);
    }
    console.log(res);
    return res;
}
