/* AI VEIKIA – bendras scenarijus. Be jo svetainė veikia, jis tik prideda patogumų. */
(function () {
  var root = document.documentElement;

  /* Įžanga: praleidžiama paspaudus „Praleisti“, bet kur ekrane arba Esc; rodoma kartą per sesiją */
  function endIntro() {
    root.classList.add('no-intro');
    try { sessionStorage.setItem('aiv-intro', '1'); } catch (e) {}
  }
  if (document.querySelector('.skip') && !root.classList.contains('no-intro')) {
    document.addEventListener('pointerdown', endIntro, { once: true });
    setTimeout(endIntro, 2700);
  }

  /* El. pašto kopijavimas */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var mail = btn.getAttribute('data-copy');
      var out = document.getElementById(btn.getAttribute('aria-describedby') || '') || btn.parentNode.parentNode.querySelector('.copied');
      function done(msg) { if (out) { out.textContent = msg; setTimeout(function () { out.textContent = ''; }, 2500); } }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(mail).then(function () { done('Nukopijuota: ' + mail); },
          function () { location.href = 'mailto:' + mail; });
      } else {
        location.href = 'mailto:' + mail;
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!root.classList.contains('no-intro') && document.querySelector('.skip')) endIntro();
    var m = document.querySelector('.mmenu');
    if (m && m.open) { m.open = false; m.querySelector('summary').focus(); }
  });
})();
