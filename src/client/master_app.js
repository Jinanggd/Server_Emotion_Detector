var inputroom = document.getElementById("room");
var btn_visualize = document.getElementById("btn_Visualize");
var room = null;
var div_holder = document.getElementById("holder");

var clientws = null;

btn_visualize.addEventListener('click', function (e) {

    div_holder.innerHTML = "";
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
        var obj = JSON.parse(msg.split("TFGED-"+room+"-").join(""));

        // HTML Header Div Creation
        var div_user = document.createElement('div');
        div_user.setAttribute("id","user-info-header");

        //Header Information
        var h3 = document.createElement('h3');
        h3.innerHTML = "User ID: "+obj.user_id + " User Name: " + obj.user_name;

        var p1 = document.createElement("p");
        p1.innerHTML = "Fecha Inicio: "+ obj.start_date;

        var p2 = document.createElement("p");
        p2.innerHTML = "Fecha Fin: " + obj.end_date;

        div_user.appendChild(h3);
        div_user.appendChild(p1);
        div_user.appendChild(p2);

        // HTML Div timeline holder
        var div_timeline_container = document.createElement('div');
        div_timeline_container.setAttribute("id",obj.user_name);

        buildTimeline(obj,div_timeline_container); // do magic here :)

        // HTML Div holder_user
        var div_user_holder = document.createElement('div');
        div_user_holder.setAttribute("id","user-holder");
        div_user_holder.appendChild(div_user);
        div_user_holder.appendChild(div_timeline_container);

        // Finally add to the html
        div_holder.appendChild(div_user_holder);

        var hr = document.createElement("hr");

        div_holder.appendChild(hr);

        // var li = document.createElement("li");
        // li.appendChild(document.createTextNode(msg.split("TFGED-"+room+"-").join("")));
        // ul.appendChild(li);
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
