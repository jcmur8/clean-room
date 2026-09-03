import { el } from "./ui.js";

const paths = {
  battle: ["M5 4l15 15", "M19 4L4 19", "M3 3l4 1-3 3z", "M21 3l-4 1 3 3z"],
  book: ["M4 5c4-2 7-1 8 1v14c-1-2-4-3-8-1z", "M20 5c-4-2-7-1-8 1v14c1-2 4-3 8-1z"],
  lock: ["M7 10V7a5 5 0 0110 0v3", "M5 10h14v11H5z", "M12 14v3"],
  settings: ["M12 8a4 4 0 100 8 4 4 0 000-8z", "M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"],
  check: ["M4 12l5 5L20 6"],
  close: ["M5 5l14 14M19 5L5 19"],
  instructions: ["M6 3h12v18H6z", "M9 8h6M9 12h6M9 16h4"],
  help: ["M12 21a9 9 0 100-18 9 9 0 000 18z", "M9.5 9a2.5 2.5 0 015 0c0 2-2.5 2-2.5 4", "M12 17h.01"],
  pause: ["M8 5v14M16 5v14"],
  stop: ["M6 6h12v12H6z"],
  warning: ["M12 3L2 21h20z", "M12 9v5M12 17h.01"],
  back: ["M19 12H5M11 6l-6 6 6 6"],
  play: ["M7 4l13 8-13 8z"],
  add: ["M12 5v14M5 12h14"],
  trash: ["M5 7h14M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"],
  save: ["M5 3h12l2 2v16H5z", "M8 3v6h8V3M8 14h8v7H8z"],
  arrow: ["M5 12h14M13 6l6 6-6 6"],
};

export function icon(name, className = "ui-icon") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (const d of paths[name] || paths.instructions) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    for (const [attribute, value] of Object.entries({ d, fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "square", "stroke-linejoin": "miter" })) path.setAttribute(attribute, value);
    svg.append(path);
  }
  return svg;
}

export function iconLabel(name, label) {
  return el("span", { class: "icon-label" }, icon(name), el("span", { text: label }));
}
