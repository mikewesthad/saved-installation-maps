import React, { PureComponent } from "react";
import p5 from "p5";

/**
 * Wrapper around a p5 sketch that expects a "sketch" prop which is a p5 function closure:
 *  https://github.com/processing/p5.js/wiki/Global-and-instance-mode
 *
 * @export
 * @class SketchWrapper
 * @extends {Component}
 */
export default class SketchWrapper extends PureComponent {
  p = null;
  containerRef = React.createRef();

  createSketch = p => {
    this.removeSketch = () => p.remove();
    this.props.sketch(p);
  };

  componentDidMount() {
    this.p = new p5(
      this.createSketch,
      this.containerRef.current,
      true // Synchronously
    );
  }

  componentWillUnmount() {
    if (this.p) this.p.remove();
    this.p = null;
  }

  render() {
    const { sketch, children, ...otherProps } = this.props;
    return (
      <div ref={this.containerRef} {...otherProps}>
        {children}
      </div>
    );
  }
}
