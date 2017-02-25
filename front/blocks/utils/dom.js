export const qs = document.querySelector.bind(document);
export const qsa = selector => Array.from(document.querySelectorAll(selector));

export { default as animate } from './dom/animate';
export { default as closest } from './dom/closest';
export { default as create } from './dom/create';
export { default as css } from './dom/css';
export { default as offset } from './dom/offset';
export { default as off } from './dom/off';
export { default as on } from './dom/on';
