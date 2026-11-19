/* katestrudwick.com */
(function () {
  var phone = window.matchMedia('(max-width: 700px)');

  /* ---------- Home: draggable objects ---------- */
  var layer = document.querySelector('.objects');
  if (layer) {
    var objs = Array.prototype.slice.call(layer.querySelectorAll('.obj'));
    var top = objs.length;
    var place = function () {
      var key = phone.matches ? 'mob' : 'desk';
      objs.forEach(function (el, i) {
        var p = el.dataset[key].split(',').map(Number); // x%, y px, width px, rotation deg
        el.style.left = p[0] + '%';
        el.style.top = p[1] + 'px';
        el.style.width = phone.matches ? p[2] + 'px' : 'clamp(' + Math.round(p[2] * 0.6) + 'px, ' + (p[2] / 14.4).toFixed(2) + 'vw, ' + p[2] + 'px)';
        el.style.zIndex = i + 1;
        el.querySelector('img').style.rotate = p[3] + 'deg';
        el.style.setProperty('--delay', (120 + i * 110) + 'ms');
      });
    };
    place();
    if (phone.addEventListener) phone.addEventListener('change', place);
    var tidy = document.querySelector('.tidy');
    if (tidy) tidy.addEventListener('click', place);

    objs.forEach(function (el) {
      var d = null;
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        var r = layer.getBoundingClientRect();
        d = { sx: e.clientX, sy: e.clientY, ox: parseFloat(el.style.left), oy: parseFloat(el.style.top), w: r.width };
        el.style.zIndex = ++top;
      });
      el.addEventListener('pointermove', function (e) {
        if (!d) return;
        el.style.left = (d.ox + (e.clientX - d.sx) / d.w * 100) + '%';
        el.style.top = (d.oy + (e.clientY - d.sy)) + 'px';
      });
      var end = function () { d = null; };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    });
  }

  /* ---------- Home: print follows the cursor over the work list ---------- */
  var list = document.querySelector('.work');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (list && fine.matches) {
    var print = document.createElement('div');
    print.className = 'hover-print';
    print.setAttribute('aria-hidden', 'true');
    print.innerHTML = '<img alt="">';
    document.body.appendChild(print);
    var pimg = print.querySelector('img');
    var tilts = [-6, 5, -3, 7, -8, 4, -5, 6, -4];
    Array.prototype.forEach.call(list.querySelectorAll('.row'), function (row, i) {
      row.addEventListener('mouseenter', function () {
        pimg.src = row.dataset.print;
        print.style.rotate = tilts[i % tilts.length] + 'deg';
        print.classList.add('on');
      });
      row.addEventListener('mouseleave', function () { print.classList.remove('on'); });
    });
    list.addEventListener('mousemove', function (e) {
      var x = e.clientX + 28;
      if (x + 250 > window.innerWidth) x = e.clientX - 248;
      print.style.left = x + 'px';
      print.style.top = (e.clientY - 150) + 'px';
    });
  }

  /* ---------- Project page: gallery + info panel ---------- */
  var p = document.querySelector('.p');
  if (p) {
    var imgs = Array.prototype.slice.call(p.querySelectorAll('.p-stage img'));
    var cap = p.querySelector('.cap');
    var count = p.querySelector('.count');
    var dots = Array.prototype.slice.call(p.querySelectorAll('.p-dots span'));
    var i = 0, n = imgs.length;
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    var show = function (k) {
      i = (k + n) % n;
      imgs.forEach(function (im, j) { im.classList.toggle('on', j === i); });
      dots.forEach(function (dt, j) { dt.classList.toggle('on', j === i); });
      cap.textContent = 'Fig. ' + pad(i + 1) + ': ' + imgs[i].dataset.caption;
      if (count) count.textContent = pad(i + 1) + ' / ' + pad(n);
      var nxt = imgs[(i + 1) % n]; if (nxt.loading === 'lazy') nxt.loading = 'eager';
    };
    show(0);
    var stage = p.querySelector('.p-stage');
    var swiped = false;
    stage.addEventListener('click', function () { if (!swiped) show(i + 1); swiped = false; });
    p.querySelector('.prev').addEventListener('click', function () { show(i - 1); });
    p.querySelector('.nextimg').addEventListener('click', function () { show(i + 1); });
    var tx = null;
    stage.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 40) { swiped = true; show(i + (dx < 0 ? 1 : -1)); }
    });

    var panel = p.querySelector('.p-panel');
    var toggles = Array.prototype.slice.call(document.querySelectorAll('[data-toggle-panel]'));
    var setOpen = function (open) {
      document.body.classList.toggle('panel-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      toggles.forEach(function (b) {
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (b.dataset.label) b.firstChild.textContent = open ? 'Close' : b.dataset.label;
      });
      if (open) panel.querySelector('.close').focus({ preventScroll: true });
    };
    toggles.forEach(function (b) {
      b.addEventListener('click', function () { setOpen(!document.body.classList.contains('panel-open')); });
    });
    var scrim = p.querySelector('.scrim');
    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input,textarea')) return;
      if (e.key === 'ArrowRight') show(i + 1);
      else if (e.key === 'ArrowLeft') show(i - 1);
      else if (e.key === 'Escape') setOpen(false);
    });
  }
})();
