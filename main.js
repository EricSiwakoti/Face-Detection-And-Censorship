const video = document.querySelector(".webcam");
const canvas = document.querySelector(".video");
const ctx = canvas.getContext("2d");
const faceCanvas = document.querySelector(".face");
const faceCtx = faceCanvas.getContext("2d");
const faceDetector = new window.FaceDetector();
const optionsInputs = document.querySelectorAll(
  '.controls input[type="range"]'
);

const options = {
  SIZE: 10,
  SCALE: 1.35,
};

function handleOption(event) {
  const { value, name } = event.currentTarget;
  options[name] = parseFloat(value);
}
optionsInputs.forEach((input) => input.addEventListener("input", handleOption));

//Function that will populate the users video
async function populateVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1080, height: 720 },
  });
  video.srcObject = stream;
  await video.play();
  //Canvas size be the same size as video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  faceCanvas.width = video.videoWidth;
  faceCanvas.height = video.videoHeight;
}

async function detect() {
  const faces = await faceDetector.detect(video);
  //Ask the browser when next animation frame is & tell it to run detect
  faces.forEach(drawFace);
  faces.forEach(censor);
  requestAnimationFrame(detect);
}

function drawFace(face) {
  const { width, height, top, left } = face.boundingBox;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ffc600";
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, width, height);
}

function censor({ boundingBox: face }) {
  faceCtx.imageSmoothingEnabled = false;
  faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  //Draw the small face
  faceCtx.drawImage(
    //5 source args
    video, //Source come from
    face.x, //We start the source pull from
    face.y,
    face.width,
    face.height,
    //4 draw args
    face.x, //Where we start drawing x and y
    face.y,
    options.SIZE,
    options.SIZE
  );
  //Draw the small face back on but scale up
  const width = face.width * options.SCALE;
  const height = face.height * options.SCALE;

  faceCtx.drawImage(
    faceCanvas, //Source
    face.x, //We start the source pull from
    face.y,
    options.SIZE,
    options.SIZE,
    //Drawing args
    face.x - (width - face.width) / 2,
    face.y - (height - face.height) / 2,
    width,
    height
  );
}

populateVideo().then(detect);
