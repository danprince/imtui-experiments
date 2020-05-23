# Immediate Mode Terminal UI

Experiments with [immediate mode](https://en.wikipedia.org/wiki/Immediate_mode_GUI) rendering for emulated terminals.

Originally started as a port of the [bearlibterminal api](http://foo.wyrd.name/en:bearlibterminal:reference) for webgl, which became a slightly simpler model, but with a full immediate mode rendering library too.

Eventually ripped out the rendering terminal rendering layer as [termgl](https://github.com/danprince/termgl)—a more general purpose way to render bitmap fonts to a console in a browser.

There's a continuation of this work in [termgl/ui](https://github.com/danprince/termgl/tree/master/ui) that started with a better model for processing events, but the examples/demos here are more complete. This codebase also supports a canvas renderer, whereas termgl only works with webgl.
