/* Professional Studio Admin Dashboard
 * Task 3.24: safer, honest frontend interactions.
 * This page remains a static preview until protected admin APIs are implemented.
 */
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.sidebar-nav');

  if (menuButton && nav) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('active');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('active');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }));
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const animateCounter = counter => {
    const target = Number(counter.dataset.target);
    if (!Number.isFinite(target)) return;
    const start = performance.now();
    const duration = 900;
    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(target * eased).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(step);
      else counter.textContent = target.toLocaleString('en-IN');
    };
    requestAnimationFrame(step);
  };

  const counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    }), { threshold: 0.35 });
    counters.forEach(counter => observer.observe(counter));
  } else counters.forEach(animateCounter);

  const bars = document.querySelectorAll('.progress-fill');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const width = Number(entry.target.dataset.width);
      if (Number.isFinite(width)) entry.target.style.width = `${Math.max(0, Math.min(100, width))}%`;
      observer.unobserve(entry.target);
    }), { threshold: 0.4 });
    bars.forEach(bar => observer.observe(bar));
  } else bars.forEach(bar => {
    const width = Number(bar.dataset.width);
    if (Number.isFinite(width)) bar.style.width = `${Math.max(0, Math.min(100, width))}%`;
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  function notify(message, type = 'info') {
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-relevant', 'additions');
      document.body.appendChild(container);
    }
    const item = document.createElement('div');
    item.className = `notification notification-${type}`;
    const icon = document.createElement('span');
    icon.className = 'notification-icon';
    icon.textContent = type === 'success' ? '✓' : 'i';
    const text = document.createElement('span');
    text.className = 'notification-message admin-notification-message';
    text.textContent = message;
    const close = document.createElement('button');
    close.className = 'notification-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close notification');
    close.textContent = '×';
    item.append(icon, text, close);
    container.appendChild(item);
    requestAnimationFrame(() => item.classList.add('show'));
    const remove = () => {
      item.classList.remove('show');
      window.setTimeout(() => item.remove(), 300);
    };
    close.addEventListener('click', remove);
    window.setTimeout(remove, 5000);
  }

  // Search and filter the photographer sample table without implying data is saved.
  const photographerTable = Array.from(document.querySelectorAll('table')).find(table =>
    Array.from(table.querySelectorAll('thead th')).some(th => th.textContent.trim().toLowerCase() === 'photographer') &&
    Array.from(table.querySelectorAll('thead th')).some(th => th.textContent.trim().toLowerCase() === 'location')
  );
  const toolbar = photographerTable?.closest('.table-panel')?.querySelector('.table-toolbar');
  if (photographerTable && toolbar) {
    const search = toolbar.querySelector('input[type="search"]');
    const selects = toolbar.querySelectorAll('select');
    const planSelect = selects[0];
    const statusSelect = selects[1];
    const rows = Array.from(photographerTable.querySelectorAll('tbody tr'));
    const applyFilters = () => {
      const term = (search?.value || '').trim().toLocaleLowerCase();
      const plan = (planSelect?.value || 'All Plans').trim().toLocaleLowerCase();
      const status = (statusSelect?.value || 'All Status').trim().toLocaleLowerCase();
      let visible = 0;
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowText = row.textContent.toLocaleLowerCase();
        const rowPlan = (cells[2]?.textContent || '').trim().toLocaleLowerCase();
        const rowStatus = (cells[3]?.textContent || '').trim().toLocaleLowerCase();
        const matches = (!term || rowText.includes(term)) && (plan === 'all plans' || rowPlan === plan) && (status === 'all status' || rowStatus === status);
        row.hidden = !matches;
        if (matches) visible++;
      });
      let empty = photographerTable.querySelector('.admin-table-empty');
      if (!visible && !empty) {
        empty = document.createElement('tr');
        empty.className = 'admin-table-empty';
        const cell = document.createElement('td');
        cell.colSpan = photographerTable.querySelectorAll('thead th').length || 1;
        cell.textContent = 'No photographers match these filters.';
        empty.appendChild(cell);
        photographerTable.querySelector('tbody')?.appendChild(empty);
      } else if (visible && empty) empty.remove();
      else if (empty) empty.querySelector('td').colSpan = photographerTable.querySelectorAll('thead th').length || 1;
    };
    search?.addEventListener('input', applyFilters);
    planSelect?.addEventListener('change', applyFilters);
    statusSelect?.addEventListener('change', applyFilters);
  }

  // Admin operations are intentionally not simulated. The API and role checks do not exist yet.
  const unavailableActions = new Map([
    ['view', 'Viewing account details requires the protected admin API.'],
    ['approve', 'Account approval is disabled until server-side admin authorization is implemented.'],
    ['review', 'Account review requires the protected admin API.'],
    ['open', 'Opening support tickets requires the protected support API.'],
    ['manage', 'Management actions are not connected to the backend yet.'],
    ['view details', 'Details are sample data. Connect the protected admin API to load real records.'],
    ['view leaderboard', 'Leaderboard data is sample data and is not live.'],
    ['+ add photographer', 'Adding photographers is unavailable until a protected admin API is implemented.'],
    ['export report', 'Report export is not implemented yet.'],
    ['send announcement', 'Announcements cannot be sent until the protected backend endpoint exists.'],
    ['save changes', 'Settings are not saved. A protected backend endpoint is required.']
  ]);
  document.querySelectorAll('button').forEach(button => {
    if (button.matches('.menu-toggle, .notification-close')) return;
    button.addEventListener('click', () => {
      const label = button.textContent.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
      if (unavailableActions.has(label)) {
        notify(unavailableActions.get(label), 'info');
        return;
      }
      if (button.classList.contains('setting-card')) {
        const title = button.querySelector('strong, h3, h4')?.textContent?.trim() || 'This setting';
        notify(`${title} is a preview only. Saving it requires a protected backend API.`, 'info');
        return;
      }
      if (button.classList.contains('icon-button')) {
        notify('Notifications are sample data. Live admin notifications are not connected.', 'info');
        return;
      }
      if (button.classList.contains('secondary-button') || button.closest('.subscription-card')) {
        notify('This action is not connected to the backend yet. No changes were made.', 'info');
      }
    });
  });

  document.querySelectorAll('table tbody tr').forEach(row => {
    row.addEventListener('click', event => {
      if (event.target.closest('button') || row.closest('#photographers') === null) return;
      row.closest('tbody')?.querySelectorAll('tr.selected').forEach(item => item.classList.remove('selected'));
      row.classList.add('selected');
    });
  });

  document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
  document.body.classList.add('dashboard-ready');
});
