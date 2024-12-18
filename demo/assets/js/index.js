document.addEventListener('DOMContentLoaded', function() {
  // Текущий год
  const currentYearElement = document.getElementById('current-year');
  const currentYear = new Date().getFullYear();
  currentYearElement.textContent = currentYear;

  // Табы
  const tabBlocks = document.querySelectorAll('.tabBlock');

  tabBlocks.forEach(tabBlock => {
    // Обработка основных табов
    const mainTabButtons = tabBlock.querySelectorAll('nav .tabButton');
    const mainTabPanels = tabBlock.querySelectorAll('section[role="tabpanel"]');

    let mainCurrentIndex = Array.from(mainTabButtons).findIndex(button => button.classList.contains('active'));

    function updateMainTabs() {
      mainTabButtons.forEach((button, index) => {
        if (index === mainCurrentIndex) {
          button.setAttribute('aria-selected', 'true');
          button.classList.add('active');
        } else {
          button.setAttribute('aria-selected', 'false');
          button.classList.remove('active');
        }
      });

      mainTabPanels.forEach((panel, index) => {
        if (index === mainCurrentIndex) {
          panel.style.display = 'block';
          setTimeout(() => {
            panel.classList.add('active');
            panel.classList.remove('hiddenTagContent');
          }, 0);
        } else {
          panel.classList.remove('active');
          panel.classList.add('hiddenTagContent');
          panel.style.display = 'none';
        }
      });
    }

    mainTabButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        mainCurrentIndex = index;
        updateMainTabs();
      });
    });

    updateMainTabs();

    // Обработка вложенных табов
    const nestedTabGroups = tabBlock.querySelectorAll('.c-card__preview-tabs');

    nestedTabGroups.forEach(nestedTabGroup => {
      const nestedTabButtons = nestedTabGroup.querySelectorAll('.tabButton');
      const nestedTabPanels = nestedTabGroup.closest('.c-card__preview').querySelectorAll('.c-card__preview-body');

      let nestedCurrentIndex = Array.from(nestedTabButtons).findIndex(button => button.classList.contains('active'));

      function updateNestedTabs() {
        nestedTabButtons.forEach((button, index) => {
          if (index === nestedCurrentIndex) {
            button.setAttribute('aria-selected', 'true');
            button.classList.add('active');
          } else {
            button.setAttribute('aria-selected', 'false');
            button.classList.remove('active');
          }
        });

        nestedTabPanels.forEach((panel, index) => {
          if (index === nestedCurrentIndex) {
            panel.style.display = 'flex';
            setTimeout(() => {
              panel.classList.add('active');
              panel.classList.remove('hiddenTagContent');
            }, 0);
          } else {
            panel.classList.remove('active');
            panel.classList.add('hiddenTagContent');
            panel.style.display = 'none';
          }
        });
      }

      nestedTabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          nestedCurrentIndex = index;
          updateNestedTabs();
        });
      });

      updateNestedTabs();
    });
  });

  // подсветка якорных ссылок
  const sections = document.querySelectorAll('.c-card');
  const navLinks = document.querySelectorAll('.c-sidebar__btn');

  function highlightActiveLink() {
    let currentSection = '';

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom >= 150) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === currentSection) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightActiveLink);
  window.addEventListener('resize', highlightActiveLink);
  window.addEventListener('click', highlightActiveLink);
  highlightActiveLink(); // Initial check

  // копировать

  // Подключаем uifx
  /*new UifxFade('.UifxFade');
  new UifxText('.UifxText');*/

});