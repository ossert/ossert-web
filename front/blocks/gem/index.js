import './gem.pcss';
import { create } from './../utils/dom';

const MAX_HEIGHT = 120;

export function gemDescriptionCollapser() {
  const descriptionContainer = document.querySelector('.gem__description-container');
  const description = descriptionContainer && descriptionContainer.querySelector('.gem__description');

  if (description && description.offsetHeight > MAX_HEIGHT) {
    description.classList.add('gem__description_has-collapser');
    description.classList.add('gem__description_collapsed');

    const toggleButton = create('button', { className: 'gem__description-toggler', text: 'See Full' });

    descriptionContainer.appendChild(toggleButton);

    toggleButton.addEventListener('click', () => {
      const collapsed = description.classList.contains('gem__description_collapsed');

      description.classList.toggle('gem__description_collapsed', !collapsed);
      toggleButton.textContent = collapsed ? 'Collapse' : 'See full';
    });
  }
}
