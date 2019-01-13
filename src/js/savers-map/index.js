import React, { PureComponent } from "react";
import SketchWrapper from "../components/sketch-wrapper";
import createSketch from "./sketch";

const style = { width: "1920px", height: "1080px", display: "flex" };

export default class SaversMap extends PureComponent {
  createSketch = p => {
    const { showImage, isRecording } = this.props;
    createSketch(p, showImage, isRecording);
  };

  render() {
    return <SketchWrapper sketch={this.createSketch} style={style} />;
  }
}
