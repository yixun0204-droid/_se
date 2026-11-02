document.addEventListener('DOMContentLoaded', () => {
  for (const form of document.querySelectorAll('form[data-confirm]')) {
    form.addEventListener('submit', (event) => {
      const message = form.getAttribute('data-confirm');
      if (message && !window.confirm(message)) {
        event.preventDefault();
      }
    });
  }
});
