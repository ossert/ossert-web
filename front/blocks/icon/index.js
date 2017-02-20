import './icon.pcss';
import iconsSprite from './icons-sprite.svg';

const tmp = document.createElement('div');
tmp.innerHTML = iconsSprite;

const svg = tmp.firstChild;
svg.style.position = 'absolute';
svg.style.width = 0;
svg.style.height = 0;
svg.style.overflow = 'hidden';

document.body.insertBefore(svg, document.body.firstChild);
