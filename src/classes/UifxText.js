import '../uifx.css';

class UifxText {
  constructor(selector) {
    this.containers = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    this.containers.forEach(container => {
      const { pause, speed, delay, threshold, route, repeat, clickTrigger, animationType, isIncrement } = this.getContainerAttributes(container);

      if (isIncrement) {
        this.setupIncrement(container, speed, delay, threshold, repeat, clickTrigger);
      } else if (route) {
        this.wrapContent(container, route, speed, animationType);
        if (clickTrigger) {
          this.setupClickTrigger(container, speed, route, delay, clickTrigger, animationType);
        } else {
          this.observeElement(container, pause, speed, delay, threshold, route, repeat, animationType);
        }
      } else {
        this.storeInitialText(container);
        this.observeElement(container, pause, speed, delay, threshold, null, repeat, animationType);
      }
    });
  }

  getContainerAttributes(container) {
    return {
      pause: this.getPause(container),
      speed: this.getSpeed(container),
      delay: this.getDelay(container),
      threshold: this.getThreshold(container),
      route: container.classList.contains('uifx-up') ? 'up' : container.classList.contains('uifx-down') ? 'down' : null,
      repeat: container.getAttribute('uifx-repeat') === 'true',
      clickTrigger: container.getAttribute('uifx-click'),
      animationType: container.classList.contains('uifx-word') ? 'word' : container.classList.contains('uifx-symbol') ? 'symbol' : null,
      isIncrement: container.classList.contains('uifx_increment')
    };
  }

  storeInitialText(container) {
    container.querySelectorAll('span').forEach(span => {
      span.dataset.initialText = span.textContent;
      span.textContent = '';
    });
  }

  observeElement(element, pause, speed, delay, threshold, route, repeat, animationType) {
    let timers = [];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (route) {
            this.animateTextFade(element, speed, route, delay, animationType, timers);
            if (repeat) {
              this.resetAnimationFade(element, speed);
            }
          } else if (!element.dataset.animationStarted) {
            setTimeout(() => {
              this.animateText(element, pause, speed);
              element.dataset.animationStarted = 'true';
            }, delay);
          }
        } else if (repeat) {
          this.resetAnimationFade(element, speed);
          timers.forEach(clearTimeout);
          timers = [];
        }
      });
    }, { threshold: threshold });

    observer.observe(element);
  }

  setupClickTrigger(element, speed, route, delay, clickTrigger, animationType) {
    let timers = [];

    document.querySelectorAll(`[uifx-trigger="${clickTrigger}"]`).forEach(button => {
      button.addEventListener('click', () => {
        this.handleClickTrigger(element, speed, route, delay, animationType, timers);
      });
    });

    document.querySelectorAll(`[uifx-trigger-open="${clickTrigger}"]`).forEach(button => {
      button.addEventListener('click', () => {
        this.animateTextFade(element, speed, route, delay, animationType, timers);
      });
    });

    document.querySelectorAll(`[uifx-trigger-close="${clickTrigger}"]`).forEach(button => {
      button.addEventListener('click', () => {
        this.resetAnimationFade(element, speed, null, null, animationType);
        timers.forEach(clearTimeout);
        timers = [];
      });
    });
  }

  handleClickTrigger(element, speed, route, delay, animationType, timers) {
    this.resetAnimationFade(element, speed);
    timers.forEach(clearTimeout);
    timers.length = 0;
    setTimeout(() => {
      this.animateTextFade(element, speed, route, delay, animationType, timers);
    }, 0);
  }

  resetAnimationFade(element, speed) {
    element.removeAttribute('data-animated');
    element.classList.remove('active');
    element.style.transitionDuration = '';
    element.style.transform = '';
    element.style.opacity = '';

    element.querySelectorAll('div > span').forEach(span => {
      span.style.transitionDuration = '';
      span.style.transform = '';
      span.style.opacity = '';
    });

    if (element.classList.contains('uifx-symbol')) {
      const symbolSpans = element.querySelectorAll('.symbol-wrapper > span');
      symbolSpans.forEach(span => {
        span.style.transitionDuration = `${speed}ms`;
        span.style.transform = element.classList.contains('uifx-up') ? 'translateY(200%)' : 'translateY(-100%)';
        span.style.opacity = '0';
      });
    } else {
      element.querySelectorAll('div > span').forEach(span => {
        span.style.transform = element.classList.contains('uifx-up') ? 'translateY(200%)' : 'translateY(-100%)';
        span.style.opacity = '0';
      });
    }
  }

  wrapContent(element, route, speed, animationType) {
    let content = element.innerHTML.trim();

    const brTags = [];
    content = content.replace(/<br[^>]*>/gi, (match) => {
      brTags.push(match);
      return `[[BR${brTags.length - 1}]]`;
    });

    const parts = content.split(/(\s+|\[\[BR\d+\]\])/);

    element.innerHTML = '';

    parts.forEach((part, index) => {
      const brMatch = part.match(/\[\[BR(\d+)\]\]/);
      if (brMatch) {
        const brElement = document.createElement('div');
        brElement.innerHTML = brTags[parseInt(brMatch[1])];
        element.appendChild(brElement.firstChild);
      } else if (/\S/.test(part)) {
        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word-wrapper');

        const innerDiv = document.createElement('div');
        innerDiv.style.display = 'flex';
        innerDiv.style.width = 'max-content';
        innerDiv.style.alignItems = 'flex-start';

        const wrapperSpan = document.createElement('span');

        if (animationType === 'symbol') {
          part.split('').forEach(symbol => {
            const symbolWrapper = document.createElement('span');
            symbolWrapper.classList.add('symbol-wrapper');

            const symbolSpan = document.createElement('span');
            symbolSpan.textContent = symbol;
            symbolSpan.setAttribute('uifx-speed', speed);
            symbolSpan.style.transitionDuration = `${speed}ms`;
            symbolSpan.style.transform = 'translateY(200%)';
            symbolSpan.style.opacity = '0';

            symbolWrapper.appendChild(symbolSpan);
            wrapperSpan.appendChild(symbolWrapper);
          });
        } else {
          wrapperSpan.textContent = part;
          wrapperSpan.setAttribute('uifx-speed', speed);

          if (!element.classList.contains('uifx-symbol') && !element.classList.contains('uifx-word')) {
            wrapperSpan.style.transitionDuration = `${speed}ms`;
          }
        }

        innerDiv.appendChild(wrapperSpan);

        if (parts[index + 1] && /\s+/.test(parts[index + 1])) {
          const spaceSpan = document.createElement('span');
          spaceSpan.innerHTML = '&nbsp;';
          spaceSpan.setAttribute('uifx-speed', speed);
          spaceSpan.style.transitionDuration = `${speed}ms`;

          const spaceDiv = document.createElement('div');
          spaceDiv.appendChild(spaceSpan);
          innerDiv.appendChild(spaceDiv);
        }

        wordDiv.appendChild(innerDiv);
        element.appendChild(wordDiv);
      }
    });

    element.removeAttribute('uifx-speed');
    element.style.transitionDuration = '';
  }

  animateTextFade(element, speed, route, delay, animationType, timers = []) {
    if (!route) {
      const timer = setTimeout(() => {
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
        element.classList.add('active');
      }, delay);
      timers.push(timer);
    }

    const spans = element.querySelectorAll('div > span');
    if (spans) {
      if (animationType === 'word') {
        spans.forEach((span, index) => {
          const timer = setTimeout(() => {
            span.style.transform = 'translateY(0)';
            span.style.opacity = '1';
          }, delay + index * speed);
          timers.push(timer);
        });
      } else if (animationType === 'symbol') {
        this.animateSymbols(element, speed, delay, timers);
      } else {
        spans.forEach(span => {
          const timer = setTimeout(() => {
            span.style.transitionDuration = `${speed}ms`;
            span.style.transform = 'translateY(0)';
            span.style.opacity = '1';
          }, delay);
          timers.push(timer);
        });
      }
    }

    const finalTimer = setTimeout(() => {
      element.classList.add('active');
      element.setAttribute('data-animated', 'true');
    }, 0);
    timers.push(finalTimer);
  }

  animateSymbols(element, speed, delay, timers = []) {
    const symbols = element.querySelectorAll('.symbol-wrapper > span');
    symbols.forEach((symbol, index) => {
      const timer = setTimeout(() => {
        symbol.style.transform = 'translateY(0)';
        symbol.style.opacity = '1';
      }, delay + index * speed);
      timers.push(timer);
    });
  }

  animateText(element, pause, speed) {
    const spans = element.querySelectorAll('span');
    let index = 0;

    const printText = (span) => {
      let text = span.dataset.initialText;
      span.textContent = '';
      let charIndex = 0;

      const printChar = () => {
        if (charIndex < text.length) {
          span.textContent = text.slice(0, charIndex + 1);
          charIndex++;
          setTimeout(printChar, speed);
        } else {
          setTimeout(() => {
            this.eraseText(span, speed, () => {
              setTimeout(() => {
                index++;
                if (index < spans.length) {
                  printText(spans[index]);
                } else {
                  index = 0;
                  printText(spans[index]);
                }
              }, 100);
            });
          }, pause);
        }
      };

      printChar();
    };

    printText(spans[index]);
  }

  eraseText(span, speed, callback) {
    let text = span.textContent.slice(0, -1);
    span.textContent = text;
    let charIndex = text.length;

    const eraseChar = () => {
      if (charIndex > 0) {
        span.textContent = text.slice(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseChar, speed);
      } else {
        span.textContent = '';
        if (callback) callback();
      }
    };

    eraseChar();
  }

  resetAnimation(element) {
    element.querySelectorAll('span').forEach(span => {
      span.textContent = '';
    });
  }

  getPause(element) {
    return parseInt(element.getAttribute('uifx-pause'), 10) || 500;
  }

  getSpeed(element) {
    return parseInt(element.getAttribute('uifx-speed'), 10) || 50;
  }

  getDelay(element) {
    return parseInt(element.getAttribute('uifx-delay'), 10) || 0;
  }

  getThreshold(element) {
    return parseFloat(element.getAttribute('uifx-threshold')) || 0.1;
  }

  setupIncrement(element, speed, delay, threshold, repeat, clickTrigger) {
    const target = parseInt(element.textContent, 10);
    element.textContent = 0;

    if (clickTrigger) {
      this.setupIncrementClickTrigger(element, target, speed, delay, clickTrigger);
    } else {
      this.observeIncrementElement(element, target, speed, delay, threshold, repeat);
    }
  }

  observeIncrementElement(element, target, speed, delay, threshold, repeat) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            this.animateIncrement(element, target, speed);
            element.classList.add('active');
            if (!repeat) {
              observer.unobserve(entry.target);
            }
          }, delay);
        } else if (repeat) {
          element.classList.remove('active');
        }
      });
    }, { threshold: threshold });

    observer.observe(element);
  }

  setupIncrementClickTrigger(element, target, speed, delay, clickTrigger) {
    document.querySelectorAll(`[uifx-trigger="${clickTrigger}"]`).forEach(button => {
      button.addEventListener('click', () => {
        element.classList.remove('active');
        element.textContent = 0;
        setTimeout(() => {
          this.animateIncrement(element, target, speed);
          element.classList.add('active');
        }, delay);
      });
    });

    document.querySelectorAll(`[uifx-trigger-open="${clickTrigger}"]`).forEach(button => {
      button.addEventListener('click', () => {
        if (!element.classList.contains('active')) {
          element.textContent = 0;
          setTimeout(() => {
            this.animateIncrement(element, target, speed);
            element.classList.add('active');
          }, delay);
        }
      });
    });

    document.querySelectorAll(`[uifx-trigger-close="${clickTrigger}"]`).forEach(button => {
      button.addEventListener('click', () => {
        element.classList.remove('active');
        element.textContent = 0;
      });
    });
  }

  animateIncrement(element, target, speed) {
    let current = 0;
    const interval = setInterval(() => {
      if (current >= target) {
        clearInterval(interval);
        element.textContent = target;
      } else {
        current += 1;
        element.textContent = current;
      }
    }, speed);
  }
}
export default UifxText;