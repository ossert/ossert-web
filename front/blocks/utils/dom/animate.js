import query from './query';

export default function animate(target, to, duration, easing = easeInOut) {
  const node = query(target);
  const computedCss = to.css && window.getComputedStyle(node);
  const elemProps = Object.keys(to).filter(prop => prop !== 'css' && isNumeric(node[prop]));
  const cssProps = to.css ? Object.keys(to.css).filter(prop => isNumeric(computedCss[prop])) : [];
  const from = {
    props: elemProps.reduce((acc, prop) => {
      acc[prop] = parseValue(node[prop]);
      return acc;
    }, {}),
    css: cssProps.reduce((acc, prop) => {
      acc[prop] = parseValue(computedCss[prop]);
      return acc;
    }, {})
  };
  const change = {
    props: elemProps.reduce((acc, prop) => {
      const parsedValue = parseValue(to[prop]);

      if (from.props[prop][1] !== parsedValue[1]) {
        console.error(`Different units in current and to values of prop: ${from.props[prop][1]} -> ${parsedValue[1]}`);
      }

      acc[prop] = parsedValue[0] - from.props[prop][0];
      return acc;
    }, {}),
    css: cssProps.reduce((acc, prop) => {
      const parsedValue = parseValue(to.css[prop]);

      if (from.css[prop][1] !== parsedValue[1]) {
        console.error(`Different units in current and to values of css: ${from.css[prop][1]} -> ${parsedValue[1]}`);
      }

      acc[prop] = parsedValue[0] - from.css[prop][0];
      return acc;
    }, {})
  };
  let startTime = Date.now();
  let rafId = null;

  function animateStep(elapsedTime) {
    if (elapsedTime < duration) {
      rafId = requestAnimationFrame(() => {
        elemProps.forEach((prop) => {
          node[prop] = formatValue([
            easing(elapsedTime, from.props[prop][0], change.props[prop], duration),
            from.props[prop][1]
          ]);
        });
        cssProps.forEach((prop) => {
          node.style[prop] = formatValue([
            easing(elapsedTime, from.css[prop][0], change.css[prop], duration),
            from.css[prop][1]
          ]);
        });

        animateStep(Date.now() - startTime);
      });
    }
  }

  animateStep(0);

  return function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}


const IS_NUMERIC = /^(\d+(?:\.\d+)?)(px|em|%)?$/;
function isNumeric(value) {
  return typeof value === 'number' || (typeof value === 'string' && IS_NUMERIC.test(value));
}

function parseValue(value) {
  if (typeof value === 'number') {
    return [value, null];
  }


  const matches = `${value}`.match(IS_NUMERIC);
  return [parseInt(matches[1], 10), matches[2] || null];
}

function formatValue(value) {
  return typeof value[0] === 'number' && value[1] === null ? value[0] : value.join('');
}

export function easeInOut(time, start, change, duration) {
  time /= (duration / 2);

  if (time < 1) {
    return (((change / 2) * time) * time) + start;
  }
  time -= 1;
  return ((-change / 2) * ((time * (time - 2)) - 1)) + start;
}
