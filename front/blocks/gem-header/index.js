import './gem-header.pcss';

import $ from 'jquery';
const $header = $('#sticky-project-header');
const $fixed = $header.find('.gem-header__fixed');

const $document = $(document);

export function onScroll() {
  $fixed.toggleClass('gem-header__fixed_hidden', !isWillBeVisible($document.scrollTop() - $header.height() - 15));
}

export function getHeight() {
  return $fixed.height();
}

export function isWillBeVisible(targetOffset) {
  return getHeaderOffsetTop() < targetOffset;
}

function getHeaderOffsetTop() {
  return $header.offset().top;
}
