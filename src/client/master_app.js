var inputroom = document.getElementById("room");
var btn_visualize = document.getElementById("btn_Visualize");
var room = null;
var ul = document.getElementById("list");

var clientws = null;

btn_visualize.addEventListener('click', function (e) {

    ul.innerHTML = "";
    room = inputroom.value;

    clientws = new SillyClient();
    clientws.connect(location.host, room);


    clientws.on_ready = function(){
        console.log("Sending on ready");
        var data = {
            msg_type: "MASTER",
            room: room,
            user_id: clientws.user_id,
        };
        clientws.sendMessage(JSON.stringify(data));
    }

    clientws.on_message  = function(author_id, msg) {
        //console.log("MESSAGE ARRIVED: "+ msg);
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(msg.split("TFGED-"+room+"-").join("")));
        ul.appendChild(li);
        // var emotions_users = JSON.parse(msg);
        // for(var i=0; i<emotions_users["USERS"].length;++i){
        //     var em = emotions_users["USERS"][i];
        //     var li = document.createElement("li");
        //     li.appendChild(document.createTextNode(em));
        //     ul.appendChild(li);
        // }
    }
    inputroom.value = "";
});
