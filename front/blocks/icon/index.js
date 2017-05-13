import './icon.pcss';
import iconsSprite from './icons-sprite.svg';
import { create, prependTo, css } from '../utils/dom';

prependTo(
  css(
    create('div', { html: iconsSprite }).firstChild,
    {
      position: 'absolute',
      width: 0,
      height: 0,
      overflow: 'hidden'
    }
  ),
  document.body
);
