# Soybean Maps

Maps of genetic and seed saving information about soybean, accompanying the installation _Saved_ by Mike Hadley and Elaine Reynolds.

## Installation

Make sure you have [node](https://nodejs.org/en/) installed. Download this repository (via `git clone` or downloading the [zipped project](https://github.com/mikewesthad/seed-installation/archive/master.zip)), and then open a terminal in the project folder and run:

```
npm install
```

This will install the necessary dependencies to run the project.

## Usage

Open up a terminal in the project folder and run:

```
npm run dev:electron
```

This will start up a new Electron window running the project. It will provide the options for playing or recording the genetic map and the savers map. Recording captures the full screen (1920x1080) to a video file that supports transparent video. See the console for recording progress output. Playing just plays the map animation in full screen without recording anything.

Other scripts:

- `npm run join-savers-data` will parse the raw data stored in join-savers-data/ and combine it into one JSON dataset about soybean seed saving and production
