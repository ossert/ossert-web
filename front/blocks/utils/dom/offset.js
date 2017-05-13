import query from './query';

export default function offset(target) {
  const rect = query(target).getBoundingClientRect();

  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft
  };
}
