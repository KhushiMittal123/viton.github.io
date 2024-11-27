// DOM Elements
const videoElement = document.getElementById('videoElement');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

// Set canvas dimensions to match video
canvas.width = videoElement.clientWidth;
canvas.height = videoElement.clientHeight;

// Load Sunglasses Image
const sunglassesImage = new Image();
sunglassesImage.src = 'assets/sunglasses.png'; // Path to your sunglasses image

// Initialize Mediapipe FaceMesh
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

// Mediapipe FaceMesh Callback
faceMesh.onResults((results) => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Check if any face landmarks are detected
  if (results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];

    // Extract key points for sunglasses placement
    const leftEye = landmarks[33]; // Left eye landmark
    const rightEye = landmarks[263]; // Right eye landmark

    // Calculate dimensions for sunglasses
    const sunglassesWidth = Math.abs(rightEye.x - leftEye.x) * canvas.width * 2;
    const sunglassesHeight = sunglassesWidth / 2; // Maintain aspect ratio
    const centerX = (leftEye.x + rightEye.x) / 2 * canvas.width;
    const centerY = (leftEye.y + rightEye.y) / 2 * canvas.height;

    // Draw the sunglasses on the canvas
    ctx.drawImage(
      sunglassesImage,
      centerX - sunglassesWidth / 2,
      centerY - sunglassesHeight / 2,
      sunglassesWidth,
      sunglassesHeight
    );
  }
});

// Camera Utils for Video Streaming
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
camera.start();
