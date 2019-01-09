import { spawn } from "child_process";

export class Recorder {
  constructor(win, { output = "recording.mp4", fps = 30, crf = 0 } = {}) {
    this.win = win;

    const command = "ffmpeg";
    // const args = `-y -f image2pipe -framerate ${fps} -vcodec png -i - -c:v libx264 -crf ${crf} ${output}`;
    const args = `-y -f image2pipe -framerate ${fps} -vcodec png -i - -vcodec prores_ks -pix_fmt yuva444p10le -profile:v 4444 -q:v 15 test.mov`;
    // + "-pix_fmt yuv420p" Doesn't work

    this.process = spawn(command, args.split(" "));

    // ffmpeg outputs non-errors to stderr to leave stdout free
    this.process.stderr.on("data", data => console.log(`ffmpeg:\n${data}`));
    this.process.on("close", code => console.log(`ffmpeg finished with code: ${code}`));
  }

  // readFrameOutput() {
  //   const re = /frame=\s*(\S+)\s*fps=\s*(\S+)\s*\s*size=\s*(\S+)\s*.*speed=(\S+)/;
  //   const match = re.exec("frame=  246 fps=7.0 q=0.0 size=    1792kB time=00:00:07.53 bitrate=1948.7kbits/s dup=41 drop=0 speed=0.213x    ");
  //   console.log(match)
  // }

  captureFrame() {
    return new Promise((resolve, reject) => {
      const { win, process } = this;

      win.capturePage(image => {
        const png = image.toPNG();
        if (png.length === 0) console.log("missing png");

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
