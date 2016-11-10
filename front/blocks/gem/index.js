import $ from 'jquery';

const MAX_HEIGHT = 120;

export function gemDescriptionCollapser() {
  const $descriptionContainer = $('.gem__description-container');
  const $description = $descriptionContainer.find('.gem__description');
  const $togglerButton = $('<button/>', { class: 'gem__description-toggler', text: 'See Full' });


  if ($description.height() > MAX_HEIGHT) {
    $description.addClass('gem__description_has-collapser gem__description_collapsed');
    $descriptionContainer.append($togglerButton);
  }

  $togglerButton.on('click', () => {
    const collapsed = $description.hasClass('gem__description_collapsed');

    $description.toggleClass('gem__description_collapsed', !collapsed);
    $togglerButton.text(collapsed ? 'Collapse' : 'See full');
  });
}
