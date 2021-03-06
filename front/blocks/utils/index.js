import cssVars from '../../postcss/css-vars';

const MOBILE_LAYOUT_WIDTH = (cssVars.layoutGridColumn + cssVars.layoutGridGutter) * 9; // 6 + 3

export function isMobileView() {
  return window.innerWidth < MOBILE_LAYOUT_WIDTH;
}

export function arrayFromNodes(nodes) {
  return Array.prototype.slice.call(nodes);
}

export const DOM = {
  closest: (elem, selector) => {
    while (elem) {
      if (elem.matches(selector)) {
        return elem;
      }

      elem = elem.parentElement;
    }

    return null;
  }
};
