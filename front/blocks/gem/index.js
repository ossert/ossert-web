import './gem.pcss';
import { query, create, on, appendTo } from './../utils/dom';

const MAX_HEIGHT = 120;

export function gemDescriptionCollapser() {
  const descriptionContainer = query('.gem__description-container');
  const description = query(descriptionContainer, '.gem__description');

  if (description && description.offsetHeight > MAX_HEIGHT) {
    description.classList.add('gem__description_has-collapser');
    description.classList.add('gem__description_collapsed');

    const toggleButton = create('button', { className: 'gem__description-toggler', text: 'See Full' });

    appendTo(toggleButton, descriptionContainer);

    on(toggleButton, 'click', () => {
      const collapsed = description.classList.contains('gem__description_collapsed');

      description.classList.toggle('gem__description_collapsed', !collapsed);
      toggleButton.textContent = collapsed ? 'Collapse' : 'See full';
    });
  }
}
