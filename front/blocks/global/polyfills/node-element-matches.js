if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||

    function matchesFn(selector) {
      let matches = (this.document || this.ownerDocument).querySelectorAll(selector);
      let length = matches.length;

      while (--length >= 0 && matches.item(length) !== this) {} // eslint-disable-line

      return length > -1;
    };
}
