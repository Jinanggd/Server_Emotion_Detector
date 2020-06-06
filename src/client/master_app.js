var inputroom = document.getElementById("room");
var btn_visualize = document.getElementById("btn_Visualize");
var room = null;
btn_visualize.addEventListener('click', function (e) {

    room = inputroom.innerHTML;

    inputroom.innerHTML = "";
})
