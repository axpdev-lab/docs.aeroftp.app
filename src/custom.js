// AeroFTP Docs — Sidebar enhancements

(function() {
  'use strict';

  // Inject favicon
  var link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  var baseEl = document.querySelector('base');
  var baseUrl = baseEl ? baseEl.getAttribute('href') : '/';
  link.href = baseUrl + 'favicon.svg';
  document.head.appendChild(link);

  // Inject logo into sidebar
  function injectLogo() {
    var scrollbox = document.querySelector('.sidebar-scrollbox, mdbook-sidebar-scrollbox');
    if (!scrollbox) return;
    if (scrollbox.querySelector('.sidebar-logo')) return;

    var logoDiv = document.createElement('div');
    logoDiv.className = 'sidebar-logo';

    var img = document.createElement('img');
    // Resolve path relative to site root, not current page
    var base = document.querySelector('base');
    var baseHref = base ? base.getAttribute('href') : '/';
    img.src = baseHref + 'logo.png';
    img.alt = 'AeroFTP';

    var text = document.createElement('span');
    text.textContent = 'AeroFTP';

    logoDiv.appendChild(img);
    logoDiv.appendChild(text);

    // For mdbook 0.5 custom element, use shadowRoot or prepend
    if (scrollbox.shadowRoot) {
      var style = document.createElement('style');
      style.textContent = '.sidebar-logo{display:flex;flex-direction:column;align-items:center;padding:20px 16px 16px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:8px;}.sidebar-logo img{width:48px;height:48px;margin-bottom:8px;}.sidebar-logo span{font-size:18px;font-weight:700;color:#e2e8f0;letter-spacing:0.5px;}';
      scrollbox.shadowRoot.prepend(style);
      scrollbox.shadowRoot.prepend(logoDiv);
    } else {
      scrollbox.prepend(logoDiv);
    }
  }

  // Collapsible sidebar sections
  function initCollapsible() {
    var partTitles = document.querySelectorAll('.sidebar .part-title');
    partTitles.forEach(function(title) {
      // Find the next sibling items until the next part-title or separator
      var items = [];
      var next = title.nextElementSibling;
      while (next && !next.classList.contains('part-title') && !next.classList.contains('spacer')) {
        // Stop at affix items that are not inside a section (like About & Credits)
        if (next.classList.contains('chapter-item') && next.classList.contains('affix')) break;
        items.push(next);
        next = next.nextElementSibling;
      }

      if (items.length === 0) return;

      // Create wrapper
      var wrapper = document.createElement('div');
      wrapper.className = 'chapter-group';
      wrapper.style.overflow = 'hidden';
      wrapper.style.transition = 'max-height 0.3s ease';

      title.parentNode.insertBefore(wrapper, items[0]);
      items.forEach(function(item) {
        wrapper.appendChild(item);
      });

      // Check if any child is active
      var hasActive = wrapper.querySelector('.active') !== null;
      if (!hasActive) {
        wrapper.style.maxHeight = '0px';
        title.classList.add('collapsed');
      } else {
        wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
      }

      // Add toggle arrow
      var arrow = document.createElement('span');
      arrow.className = 'section-arrow';
      arrow.style.cssText = 'float:right;transition:transform 0.2s ease;font-size:10px;';
      arrow.textContent = '\u25BC';
      if (!hasActive) {
        arrow.style.transform = 'rotate(-90deg)';
      }
      title.appendChild(arrow);
      title.style.cursor = 'pointer';
      title.style.pointerEvents = 'auto';
      title.style.userSelect = 'none';

      title.addEventListener('click', function() {
        var isCollapsed = title.classList.toggle('collapsed');
        if (isCollapsed) {
          wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
          requestAnimationFrame(function() {
            wrapper.style.maxHeight = '0px';
          });
          arrow.style.transform = 'rotate(-90deg)';
        } else {
          wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
          arrow.style.transform = 'rotate(0deg)';
          wrapper.addEventListener('transitionend', function handler() {
            wrapper.style.maxHeight = 'none';
            wrapper.removeEventListener('transitionend', handler);
          });
        }
      });
    });
  }

  // Run after DOM is ready
  function init() {
    injectLogo();
    initCollapsible();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();
