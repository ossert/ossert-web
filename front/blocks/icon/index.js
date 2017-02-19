import './icon.pcss';
import iconsSprite from './icons-sprite.svg';

const tmpWrapper = document.createElement('div');

tmpWrapper.innerHTML = iconsSprite;
tmpWrapper.firstChild.style = 'position: absolute; width: 0; height: 0; overflow: hidden;';

document.body.insertBefore(tmpWrapper.firstChild, document.body.firstChild);
