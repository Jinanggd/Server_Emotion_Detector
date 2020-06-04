let debugFlag = true;
let videoWidth, videoHeight;
// whether streaming video from the camera.
let streaming = false;

let video = document.getElementById('video');
let canvasOutput = document.getElementById('canvasOutput');
let canvasOutputCtx = canvasOutput.getContext('2d');
let stream = null;
let readyOpenCV = document.getElementById('OpenCV_ready');
let readyModel = document.getElementById('Emotion_ready');
let readyCamera = document.getElementById('Camera_ready');

let detectFace = document.getElementById('face');
//let detectEye = document.getElementById('eye');

let emotionOutput = document.getElementById('Emotion');

function startCamera() {
    if (streaming) return;
    //Getting the video data stream
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function(s) {
            stream = s;
            video.srcObject = s;
            video.play();
        })
        .catch(function(err) {
            console.log("An error occured! " + err);
        });

    video.addEventListener("canplay", function(ev){
        if (!streaming) {
            videoWidth = video.videoWidth;
            videoHeight = video.videoHeight;
            video.setAttribute("width", videoWidth);
            video.setAttribute("height", videoHeight);
            canvasOutput.width = videoWidth;
            canvasOutput.height = videoHeight;
            streaming = true;
        }
        startVideoProcessing(); // Prints out the stream to the canvas
    }, false);
}

let faceClassifier = null;
let eyeClassifier = null;
let profileClassifier = null;
let EmotionModel = null;
let emotion_labels = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"];

let canvasInput = null;
let canvasInputCtx = null;

let canvasBuffer = null;
let canvasBufferCtx = null;

//Pretrained Emotion Model
async function createModel(path){
    //Load the emotion model
    let model = await tf.loadLayersModel(path);
    if(debugFlag) console.log("[DEBUG] Emotion Model is ready");
    readyModel.innerHTML = "Emotion Model is ready";

    startCamera();
    if(debugFlag) console.log("[DEBUG] Camera is starting ... ");
    readyCamera.innerHTML = "Camera is starting";
    return model;
}
async function loadEmotionModel(path){
    EmotionModel = await createModel(path);
}

function startVideoProcessing() {
    if (!streaming) { console.warn("Please startup your webcam"); return; }

    canvasInput = document.createElement('canvas');
    canvasInput.width = videoWidth;
    canvasInput.height = videoHeight;
    canvasInputCtx = canvasInput.getContext('2d');

    canvasBuffer = document.createElement('canvas');
    canvasBuffer.width = videoWidth;
    canvasBuffer.height = videoHeight;
    canvasBufferCtx = canvasBuffer.getContext('2d');

    srcMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
    grayMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);

    readyCamera.innerHTML = "Camera is OK";
    requestAnimationFrame(processVideo); // Main loop here!
}

function processVideo() {
    canvasInputCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
    let imageData = canvasInputCtx.getImageData(0, 0, videoWidth, videoHeight);
    srcMat.data.set(imageData.data);
    cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);
    let faces = [];
    let eyes = [];

    if (detectFace.checked) {
        let faceVect = new cv.RectVector();//Final detected Objects in detectMultiScale
        let profVect = new cv.RectVector();
        //size = grayMat.size();

        //DOWNSAMPLE OF THE IMAGE
        let faceMat = new cv.Mat();
        cv.pyrDown(grayMat, faceMat); //DownSample
        cv.pyrDown(faceMat, faceMat);
        size = faceMat.size();


        faceClassifier.detectMultiScale(faceMat, faceVect);
        for (let i = 0; i < faceVect.size(); i++) {
            let face = faceVect.get(i);
            faces.push(new cv.Rect(face.x, face.y, face.width, face.height));
            //Eye Detector
            // if (detectEye.checked) {
            //     let eyeVect = new cv.RectVector();
            //     let eyeMat = faceMat.getRoiRect(face);
            //     eyeClassifier.detectMultiScale(eyeMat, eyeVect);
            //     for (let i = 0; i < eyeVect.size(); i++) {
            //         let eye = eyeVect.get(i);
            //         eyes.push(new cv.Rect(face.x + eye.x, face.y + eye.y, eye.width, eye.height));
            //     }
            //     eyeMat.delete();
            //     eyeVect.delete();
            // }
        }
        //In case we didnt match a frontal face ( It works as shit )
        // if(faces.length == 0){
        //     profileClassifier.detectMultiScale(grayMat,profVect);
        //     for(let i=0;i<profVect.size();++i){
        //         let face = profVect.get(i);
        //         faces.push(new cv.Rect(face.x,face.y,face.width,face.height));
        //     }
        //     profVect.delete();
        // }

        //faceMat.delete();
        faceVect.delete();
    }
    //Eye Detector
    // else {
    //     if (detectEye.checked) {
    //         let eyeVect = new cv.RectVector();
    //         let eyeMat = new cv.Mat();
    //         cv.pyrDown(grayMat, eyeMat);
    //         size = eyeMat.size();
    //         eyeClassifier.detectMultiScale(eyeMat, eyeVect);
    //         for (let i = 0; i < eyeVect.size(); i++) {
    //             let eye = eyeVect.get(i);
    //             eyes.push(new cv.Rect(eye.x, eye.y, eye.width, eye.height));
    //         }
    //         eyeMat.delete();
    //         eyeVect.delete();
    //     }
    // }
    canvasOutputCtx.drawImage(canvasInput, 0, 0, videoWidth, videoHeight);
    drawAndComputeEmotions(canvasOutputCtx, faces, 'red', size);
    //drawResults(canvasOutputCtx, eyes, 'yellow', size);
    requestAnimationFrame(processVideo);
}

function drawAndComputeEmotions(ctx, results, color, size) {
    for (let i = 0; i < results.length; ++i) {
        let rect = results[i];
        let xRatio = videoWidth/size.width;
        let yRatio = videoHeight/size.height;

        //Emotion Compute

        let cT = ctx.getImageData(rect.x*xRatio,rect.y*yRatio,rect.width*xRatio,rect.height*yRatio);
        cT = preprocess(cT);

        //Circumplex model fer el mapping
        //Valence Arousal
        //Aurélien Géron - Hands on Machine Learning with Scikit-Learn & TensorFlow
        try{
            if(EmotionModel && cT){
                z=EmotionModel.predict(cT);

                let index = z.argMax(1).dataSync()[0];
                let label = emotion_labels[index];
                if(emotionOutput.innerHTML !== "Your Emotion is: "+label)
                    emotionOutput.innerHTML = "Your Emotion is: "+label;
            }

        }
        catch(err){
            console.log(err);
        }

        //Face Detection
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.strokeRect(rect.x*xRatio, rect.y*yRatio, rect.width*xRatio, rect.height*yRatio);
        //ctx.fillText(label,rect.x*xRatio,rect.y*yRatio);
    }
}

function preprocess(imgData){
    return tf.tidy(()=>{
        let tensor = tf.browser.fromPixels(imgData).toFloat();
        tensor = tensor.resizeBilinear([100, 100]);

        tensor = tf.cast(tensor, 'float32');
        const offset = tf.scalar(255.0);
        // Normalize the image
        const normalized = tensor.div(offset);
        //We add a dimension to get a batch shape
        const batched = normalized.expandDims(0);
        //console.log(batched);
        return batched
    })
}

function stopVideoProcessing() {
    if (src != null && !src.isDeleted()) src.delete();
    if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
    if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
    if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
}

function stopCamera() {
    if (!streaming) return;
    stopVideoProcessing();
    document.getElementById("canvasOutput").getContext("2d").clearRect(0, 0, width, height);
    video.pause();
    video.srcObject=null;
    stream.getVideoTracks()[0].stop();
    streaming = false;
}

function opencvIsReady() {
    if(debugFlag) console.log('[DEBUG] OpenCV is ready');

    //LOADING PRETRAINED CLASSIFIERS FOR FACE DETECTION
    faceClassifier = new cv.CascadeClassifier();
    faceClassifier.load('haarcascade_frontalface_default.xml');

    profileClassifier = new cv.CascadeClassifier();
    profileClassifier.load('haarcascade_profileface.xml');
    eyeClassifier = new cv.CascadeClassifier();
    eyeClassifier.load('haarcascade_eye.xml');

    readyOpenCV.innerHTML = "OpenCV is ready";

    loadEmotionModel('client/Resources/model.json');
}
