import Datamap from "datamaps";
import zoomto from "datamaps-zoomto";
import { countrySoyData } from "./data/";
import { setFont } from "../utils/canvas-utils";
import palette from "../palette";

const textStyle = { fontFamily: "Roboto", fontSize: 28, fontWeight: 400 };
const boldTextStyle = Object.assign({}, textStyle, { fontWeight: 600 });
const lineHeight = textStyle.fontSize * 1.2;

// See http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177 for rendering to canvas

export default class Legend {
  constructor(p) {
    this.p = p;

    const element = document.querySelector(".legend");
    element.style.left = `${(250 / 1920) * 100}%`;
    element.style.top = `${(100 / 1080) * 100}%`;
    const aspectRatio = 1.48;
    const width = 0.22 * p.width;
    const height = (1 / aspectRatio) * width;
    this.map = new Datamap({
      element,
      width,
      height,
      scope: "world",
      projection: "mercator",
      fills: {
        defaultFill: palette.brown.hex()
      },
      geographyConfig: {
        highlightOnHover: false,
        popupOnHover: false,
        borderWidth: 0.25,
        borderOpacity: 1,
        borderColor: "white" //palette.brown.darken(1).hex()
      }
    });
    this.map.addPlugin("zoomto", zoomto);
    this.map.svg.style.display = "none";

    this.higlightedCountry = null;
  }

  setHighlightedCountry(countryCode, color) {
    this.map.updateChoropleth({ [countryCode]: color }, { reset: true });
    // TODO: instant color update

    this.higlightedCountry = countrySoyData[countryCode];
    const { landArea, lat, long } = this.higlightedCountry;

    let scaleFactor;
    if (landArea >= 9093510) {
      scaleFactor = 1.4; // Canada and up
    } else if (landArea > 10000000) scaleFactor = 2.5;
    else if (landArea > 1000000) scaleFactor = 3.5;
    else if (landArea > 100000) scaleFactor = 5;
    else scaleFactor = 10;

    this.map.zoomto({
      scaleFactor,
      center: {
        lat: lat,
        lng: long
      },
      transition: {
        duration: 0
      }
    });
  }

  draw() {
    const { p, higlightedCountry } = this;
    const { countryName, seeds, taxa, annualProductionRank, landArea } = higlightedCountry;

    const x = 250;
    const y = 500;
    const varietiesPhrase = taxa === 1 ? "soy variety" : "soy varieties";
    const seedPhrase = seeds === 1 ? "soy seed" : "soy seeds";
    const seedNumString = seeds.toLocaleString();
    const taxaNumString = taxa.toLocaleString();

    p.push();
    p.noStroke();
    p.fill(0);
    setFont(p.drawingContext, boldTextStyle);
    p.text(countryName, x, y);
    setFont(p.drawingContext, textStyle);
    p.text(`#${annualProductionRank} world soy producer`, x, y + 1 * lineHeight);
    p.fill(seeds === 0 ? palette.orange.darken(1).hex() : palette.blue.darken(1.5).hex());
    p.text(`${seedNumString} ${seedPhrase} saved in Svalbard`, x, y + 2 * lineHeight);
    p.text(`${taxaNumString} ${varietiesPhrase} saved in Svalbard`, x, y + 3 * lineHeight);
    p.pop();
  }
}
