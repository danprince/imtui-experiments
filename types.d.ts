declare namespace Ursine {
  export type Id = any;

  export type Color = string;

  export type Char = number;

  export type Rectangle = {
    x: number,
    y: number,
    width: number,
    height: number,
  }

  export type Style = {
    fg?: Color,
    bg?: Color,
  }

  export type FlexDirection =
    | "row"
    | "column";

  export type FlexAlign =
    | "start"
    | "end"
    | "center"
    | "stretch"

  export type FlexJustify =
    | "start"
    | "end"
    | "center"
    | "stretch"
    | "space-around"
    | "space-between"

  export type FlexItem = {
    x?: number,
    y?: number,
    width?: number,
    height?: number
  }

  export type Context<T> = {
    defaultValue: T,
  }

  export type Padding = {
    top?: number,
    left?: number,
    right?: number,
    bottom?: number,
  }
}
