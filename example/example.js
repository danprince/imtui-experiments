import {
  Font,
  //Terminal,
  UI,
  View,
  Group,
  Box,
  Frame,
  Text,
  Button,
  WrappedText,
  HorizontalSlider,
  Checkbox,
  RadioButton,
  FontPicker,
  Flex,
  ScrollView,
  SelectableList,
} from "../index.js";

//import { Terminal } from "../index.js";
import { WebGlTerminal as Terminal } from "../webgl.js";

class Example extends View {
  code = "";

  async enter() {
    let res = await fetch("./example.js");
    this.code = await res.text();
    this.ui.enqueueRender();
  }

  render() {
    Frame({}, () => {
      Flex({
        direction: "row",
        justify: "stretch",
        align: "stretch",
        children: [
          { width: 10, render: () => this.renderMenu() },
          { render: () => this.renderExample() },
        ]
      });
    });
  }

  scrollX = 0;
  scrollY = 0;

  renderMenu() {
    localStorage.currentExample = SelectableList({
      value: localStorage.currentExample,
      defaultValue: "layout-example",
      items: [
        { value: "layout-example", label: "Layout" },
        { value: "scroll-example", label: "Scrolling" },
        { value: "form-example", label: "Forms" },
        { value: "misc-example", label: "Misc" },
      ]
    });
  }

  renderExample() {
    let example = localStorage.currentExample;

    if (example in this) {
      this[example]();
    }
  }

  scrollCodeX = 0;
  scrollCodeY = 0;

  "scroll-example" = () => {
    Group({ x: 1, y: 0 }, () => {
      if (Button({ id: "scroll-up", text: "up" })) {
        this.scrollCodeY -= 1;
      }

      if (Button({ id: "scroll-down", text: "down", x: 5 })) {
        this.scrollCodeY += 1;
      }

      let lines = this.code.split("\n");
      let height = lines.length;
      let width = Math.max(...lines.map(l => l.length));

      Frame({ y: 1, width: 40, height: 20 }, () => {
        [this.scrollCodeX, this.scrollCodeY] = ScrollView({
          scrollX: this.scrollCodeX,
          scrollY: this.scrollCodeY,
          scrollHeight: height,
          scrollWidth: width,
        }, () => {
          WrappedText({
            height: 8,
            text: lines.join("\n"),
            wrap: "hard",
          });
        });
      });

      Text({ text: `x=${this.scrollCodeX}   y=${this.scrollCodeY}`, x: 12 });
    });
  }

  /**
   * @type {Ursine.FlexDirection}
   */
  direction = "row";

  /**
   * @type {Ursine.FlexJustify}
   */
  justify = "start";

  /**
   * @type {Ursine.FlexAlign}
   */
  align = "start";

  basis = 1;

  "layout-example" = () => {
    WrappedText({ x: 1, y: 1, text: `Basic implementation of the browsers flexible box model` });

    Group({ id: "flex-settings", y: 3, x: 1 }, () => {
      Text({ text: "direction", fg: "#888" });

      this.direction = SelectableList({
        id: "direction",
        y: 1,
        width: 10,
        value: this.direction,
        items: [
          { value: "row" },
          { value: "column" },
        ]
      });

      Text({ text: "align", fg: "#888", x: 11 });

      this.align = SelectableList({
        id: "align",
        y: 1,
        x: 11,
        width: 10,
        value: this.align,
        items: [
          { value: "start" },
          { value: "center" },
          { value: "end" },
          { value: "stretch" },
        ]
      });

      Text({ text: "justify", fg: "#888", x: 22 });

      this.justify = SelectableList({
        x: 22,
        y: 1,
        id: "justify",
        value: this.justify,
        width: 14,
        items: [
          { value: "start" },
          { value: "center" },
          { value: "end" },
          { value: "space-around" },
          { value: "space-between" },
          { value: "stretch" },
        ]
      });

      Text({ text: "basis", fg: "#888", x: 37 });

      this.basis = SelectableList({
        x: 37,
        y: 1,
        id: "basis",
        value: this.basis,
        width: 14,
        items: [
          { value: 0, label: "0" },
          { value: 1 },
          { value: 2 },
          { value: 3 },
          { value: 4 },
          { value: 5 },
        ]
      });
    });

    Frame({
      y: 11,
      width: 20,
      height: 16,
    }, () => {
      Text({ y: -1, text: "Fixed sizes" });

      Flex({
        justify: this.justify,
        align: this.align,
        direction: this.direction,
        basis: this.basis,
        children: [
          { width: 2, height: 2, render: () => Box({ bg: "green" }) },
          { width: 4, height: 4, render: () => Box({ bg: "red" }) },
          { width: 6, height: 6, render: () => Box({ bg: "yellow" }) },
        ]
      });
    });

    Frame({
      x: 20,
      y: 11,
      width: 20,
      height: 16,
    }, () => {
      Text({ y: -1, text: "Flexible widths" });

      Flex({
        justify: this.justify,
        align: this.align,
        direction: this.direction,
        basis: this.basis,
        children: [
          { width: null, height: 2, render: () => Box({ bg: "green" }) },
          { width: null, height: 4, render: () => Box({ bg: "red" }) },
          { width: null, height: 6, render: () => Box({ bg: "yellow" }) },
        ]
      });
    });

    Frame({
      x: 40,
      y: 11,
      width: 20,
      height: 16,
    }, () => {
      Text({ y: -1, text: "Flexible heights" });

      Flex({
        justify: this.justify,
        align: this.align,
        direction: this.direction,
        basis: this.basis,
        children: [
          { width: 2, height: null, render: () => Box({ bg: "green" }) },
          { width: 4, height: null, render: () => Box({ bg: "red" }) },
          { width: 6, height: null, render: () => Box({ bg: "yellow" }) },
        ]
      });
    });
  }

  value = 2;
  option = "a";
  on = false;

  "form-example" = () => {
    Group({ id: "slider", x: 1 }, () => {
      this.value = HorizontalSlider({
        id: "slide-me",
        value: this.value,
        length: 20,
        max: 100,
        min: 0,
        y: 2,
      });

      Text({ text: `Slider: ${this.value}`, y: 1 });
    });

    Group({ id: "buttons", x: 1, y: 5 }, () => {
      if (Button({ id: 1, text: "Button 1" })) {
        console.log(1);
      }

      if (Button({ id: 2, x: 12, text: "Button 2" })) {
        console.log(2);
      }

      if (Button({ id: 3, x: 24, text: "Button 3" })) {
        console.log(3);
      }
    });

    Group({ x: 1, y: 8 }, () => {
      this.on = Checkbox({ id: "check", value: this.on });
      Text({ text: "Checkbox", x: 2 });
    })

    Group({ id: "radio", x: 1, y: 11 }, () => {
      this.option = RadioButton({ id: "a", y: 0, value: this.option });
      Text({ text: "Radio Button A", y: 0, x: 2 });
      this.option = RadioButton({ id: "b", y: 1, value: this.option });
      Text({ text: "Radio Button B", y: 1, x: 2 });
      this.option = RadioButton({ id: "c", y: 2, value: this.option });
      Text({ text: "Radio Button C", y: 2, x: 2 });
    });
  }

  "misc-example" = () => {
    let char = FontPicker({ x: 2, y: 2 });

    Group({ x: 1, y: 19 }, () => {
      Text({ text: `code: ${char || "-"} hex: ${char ? char.toString(16) : "-"} ` });
      Text({ text: `char:  `, y: 1 });
      this.ui.put(6, 1, char, null, null);
    });
  }
}

async function start() {
  let font = await Font.load("./font.png");
  let term = new Terminal({ font, scale: 2, width: 70, height: 34 });

  let ui = new UI(term);

  ui.pushView(new Example);

  document.body.appendChild(term.canvas);
}

start();
