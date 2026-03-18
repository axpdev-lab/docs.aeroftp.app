// AeroFTP Docs — Sidebar enhancements

(function() {
  'use strict';

  // Inject favicon
  var link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = 'favicon.svg';
  document.head.appendChild(link);

  // Collapsible sidebar sections
  function initCollapsible() {
    var partTitles = document.querySelectorAll('.sidebar .part-title');
    partTitles.forEach(function(title) {
      // Find the next sibling items until the next part-title
      var items = [];
      var next = title.nextElementSibling;
      while (next && !next.classList.contains('part-title')) {
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollapsible);
  } else {
    // Small delay to let mdBook render
    setTimeout(initCollapsible, 100);
  }
})();
