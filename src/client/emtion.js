function emotionRegister() {
    this.id; // index of the emotion
    this.label; // Emtion label
    this.startTime; // Date
    this.endTime; // Date
    this.diffTime; // endtime - starttime
    this.duration; // in seconds round(diffTime/1000)
    this.user_id;
    this.user_name;
    this.msg_type;
    this.room = "ED";

}

emotionRegister.prototype.setDiffTime = function (endtime){
    this.endTime = endtime;
    this.diffTime = this.startTime ?  this.endTime - this.startTime : this.endTime;
    this.duration = this.diffTime/1000;
}
