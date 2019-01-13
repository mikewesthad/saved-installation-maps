export default function createSketch(p, showImage = false, isRecording = false) {
  p.setup = function() {
    p.createCanvas(1920, 1080);
  };

  p.draw = () => {
    p.rect(p.mouseX, p.mouseY, 10, 10);
  };
}
