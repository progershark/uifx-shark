import '../uifx.css';
class UifxFade {
  constructor(selector) {
    this.containers = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    this.containers.forEach(container => {
      const { threshold, delay, affect, speed, repeat, clickTrigger, route, cut, translate } = this.getContainerAttributes(container);

      if (cut) {
        this.wrapContent(container);
      }

      this.setInitialState(container, affect, route, cut, translate);

      if (clickTrigger) {
        this.setupClickTrigger(container, speed, route, delay, affect, clickTrigger, cut, translate);
      } else {
        this.observeElement(container, threshold, delay, affect, speed, repeat, route, cut, translate);
      }
    });
  }

  getContainerAttributes(container) {
    return {
      threshold: this.getThreshold(container),
      delay: this.getDelay(container),
      affect: this.getAffect(container),
      speed: this.getSpeed(container),
      repeat: container.getAttribute('uifx-repeat') === 'true',
      clickTrigger: container.getAttribute('uifx-click'),
      route: container.classList.contains('uifx-up') ? 'up' :
        container.classList.contains('uifx-down') ? 'down' :
          container.classList.contains('uifx-right') ? 'right' :
            container.classList.contains('uifx-left') ? 'left' : null,
      cut: container.getAttribute('uifx-cut') === 'true',
      translate: this.getTranslate(container)
    };
  }

  wrapContent(element) {
    const content = element.innerHTML;
    element.innerHTML = `<div>${content}</div>`;
    element.style.overflow = 'hidden';
  }

  setInitialState(element, affect, route, cut, translate) {
    if (cut) {
      const innerElement = element.querySelector('div');
      this.applyInitialState(innerElement, affect, route, translate);
    } else {
      this.applyInitialState(element, affect, route, translate);
    }
  }

  applyInitialState(element, affect, route, translate) {
    if (affect.startsWith('blur-')) {
      const blurValue = affect.split('-')[1];
      element.style.filter = `blur(${blurValue}px)`;
    }

    if (route) {
      switch (route) {
        case 'up':
          element.style.transform = `translateY(${translate.up})`;
          break;
        case 'down':
          element.style.transform = `translateY(${translate.down})`;
          break;
        case 'right':
          element.style.transform = `translateX(${translate.right})`;
          break;
        case 'left':
          element.style.transform = `translateX(${translate.left})`;
          break;
      }
    }

    if (affect === 'opacity') {
      element.style.opacity = '0';
    }
  }

  observeElement(element, threshold, delay, affect, speed, repeat, route, cut, translate) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(element, delay, affect, speed, route, cut, translate);
          if (!repeat) {
            observer.unobserve(entry.target);
          }
        } else if (repeat) {
          this.resetAnimation(element, affect, route, cut, translate);
        }
      });
    }, { threshold: threshold });

    observer.observe(element);
  }

  setupClickTrigger(element, speed, route, delay, affect, clickTrigger, cut, translate) {
    document.querySelectorAll(`[uifx-trigger-open="${clickTrigger}"]`).forEach(button => {
      button.addEventListener('click', () => {
        this.animateElement(element, delay, affect, speed, route, cut, translate);
      });
    });

    document.querySelectorAll(`[uifx-trigger-close="${clickTrigger}"]`).forEach(button => {
      button.addEventListener('click', () => {
        this.resetAnimation(element, affect, route, cut, translate);
      });
    });

    document.querySelectorAll(`[uifx-trigger="${clickTrigger}"]`).forEach(button => {
      button.addEventListener('click', () => {
        this.resetAnimation(element, affect, route, cut, translate);
        setTimeout(() => {
          this.animateElement(element, delay, affect, speed, route, cut, translate);
        }, 0);
      });
    });
  }

  animateElement(element, delay, affect, speed, route, cut, translate) {
    setTimeout(() => {
      if (cut) {
        const innerElement = element.querySelector('div');
        this.applyAnimation(innerElement, affect, speed, route, translate);
      } else {
        this.applyAnimation(element, affect, speed, route, translate);
      }
      element.classList.add('active');
    }, delay);
  }

  resetAnimation(element, affect, route, cut, translate) {
    element.classList.remove('active');
    if (cut) {
      const innerElement = element.querySelector('div');
      this.resetStyles(innerElement, affect, route, translate);
    } else {
      this.resetStyles(element, affect, route, translate);
    }
  }

  applyAnimation(element, affect, speed, route, translate) {
    element.style.transition = `transform ${speed}ms ease-in-out, opacity ${speed * 1.5}ms ease-in-out, filter ${speed * 1.5}ms ease-in-out`;
    element.style.transform = 'translate(0, 0)';
    element.style.opacity = '1';
    element.style.filter = 'blur(0px)';

    if (affect.startsWith('blur-')) {
      const blurValue = affect.split('-')[1];
      element.style.filter = `blur(${blurValue}px)`;
      setTimeout(() => {
        element.style.filter = 'blur(0px)';
      }, 0);
    }

    if (route) {
      switch (route) {
        case 'up':
          element.style.transform = 'translateY(0)';
          break;
        case 'down':
          element.style.transform = 'translateY(0)';
          break;
        case 'right':
          element.style.transform = 'translateX(0)';
          break;
        case 'left':
          element.style.transform = 'translateX(0)';
          break;
      }
    }
  }

  resetStyles(element, affect, route) {
    element.style.transition = '';
    element.style.transform = '';
    element.style.opacity = '';
    element.style.filter = '';

    if (affect.startsWith('blur-')) {
      const blurValue = affect.split('-')[1];
      element.style.filter = `blur(${blurValue}px)`;
    }

    if (route) {
      switch (route) {
        case 'up':
          element.style.transform = 'translateY(200%)';
          break;
        case 'down':
          element.style.transform = 'translateY(-200%)';
          break;
        case 'right':
          element.style.transform = 'translateX(200%)';
          break;
        case 'left':
          element.style.transform = 'translateX(-200%)';
          break;
      }
    }

    if (affect === 'opacity') {
      element.style.opacity = '0';
    }
  }

  getThreshold(element) {
    return parseFloat(element.getAttribute('uifx-threshold')) || 0.1;
  }

  getDelay(element) {
    return parseInt(element.getAttribute('uifx-delay'), 10) || 0;
  }

  getAffect(element) {
    return element.getAttribute('uifx-affect') || 'opacity';
  }

  getSpeed(element) {
    return parseInt(element.getAttribute('uifx-speed'), 10) || 500;
  }

  getTranslate(element) {
    const translate = element.getAttribute('uifx-translate');
    if (translate) {
      return {
        up: translate,
        down: `-${translate}`,
        right: translate,
        left: `-${translate}`
      };
    } else {
      return {
        up: '200%',
        down: '-200%',
        right: '200%',
        left: '-200%'
      };
    }
  }
}
export default UifxFade;