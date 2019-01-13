import { spawn } from "child_process";

// Encode to an h264 format, where crf controls the quality. This does not support alpha.
const h264Args = (fps, crf = 12, output = "recording.mp4") =>
  `-y -f image2pipe -framerate ${fps} -vcodec png -i - -c:v libx264 -crf ${crf} ${output}`;

// Encode to the prores format, where q:v controls the quality. This does support alpha!
const proresArgs = (fps, qv = 15, output = "recording.mov") =>
  `-y -f image2pipe -framerate ${fps} -vcodec png -i - -vcodec prores_ks -pix_fmt yuva444p10le -profile:v 4444 -q:v ${15} ${output}`;

/**
 *
 *
 * @export
 * @class Recorder
 */
export default class Recorder {
  constructor(win, { output, fps = 30, quality = 0 } = {}) {
    this.win = win;

    const command = "ffmpeg";
    const args = proresArgs(fps, quality, output);

    this.process = spawn(command, args.split(" "));

    // ffmpeg outputs non-errors to stderr to leave stdout free
    this.process.stderr.on("data", data => console.log(`ffmpeg:\n${data}`));
    this.process.on("close", code => console.log(`ffmpeg finished with code: ${code}`));
  }

  captureFrame() {
    return new Promise((resolve, reject) => {
      const { win, process } = this;

      win.capturePage(image => {
        const png = image.toPNG();
        if (png.length === 0) console.log("Unable to capture PNG from electron window.");

        process.stdin.write(png, error => {
          if (error) {
            console.log(`Problem writing frame to stream: ${error}`);
            reject(error);
          } else {
            resolve();
          }
        });
      });
    });
  }

  end() {
    this.process.stdin.end();
  }
}
