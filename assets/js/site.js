/* katestrudwick.com */
(function () {
  var phone = window.matchMedia('(max-width: 700px)');

  /* ---------- Home: draggable objects ---------- */
  var layer = document.querySelector('.objects');
  if (layer) {
    var objs = Array.prototype.slice.call(layer.querySelectorAll('.obj'));
    var top = objs.length;
    var hero = layer.closest('.hero');
    var h1 = hero.querySelector('h1');
    var meta = hero.querySelector('.hero-meta');
    // the arrangement, in the units of Kate's layout sketch (desktop) and a compact version for phones
    var BOX = { desk: [1690, 832], mob: [390, 340] };
    var jitter = function () { // a fresh, random landing spot for each object
      objs.forEach(function (el) {
        el._j = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
      });
    };
    var place = function () {
      var mob = phone.matches;
      var vh = window.innerHeight;
      var heroTop = hero.getBoundingClientRect().top + window.scrollY;
      var heroH = Math.max(vh - heroTop, 480);              // hero fills the first screen
      var LW = layer.offsetWidth;                         // the layer runs to the screen edges
      var L = mob ? LW : hero.clientWidth, g0 = (LW - L) / 2; // lay the pile out within the text column
      var hr = h1.getBoundingClientRect(), r0 = hero.getBoundingClientRect();
      var tTop = hr.top - r0.top, tH = hr.height;
      var metaH = meta.offsetHeight;
      var minTop = mob ? tTop + tH * 0.85 : tTop + tH * 0.3;  // how far up into the statement the pile may reach
      var BOX_W = BOX[mob ? 'mob' : 'desk'][0], BOX_H = BOX[mob ? 'mob' : 'desk'][1];
      var prefW = mob ? L * 0.98 : L * 0.906;
      var minW = mob ? L * 0.75 : L * 0.6;
      var bottom = heroH - 20 - metaH - 14;
      var w = Math.max(minW, Math.min(prefW, (bottom - minTop) / (BOX_H / BOX_W)));
      var s = w / BOX_W, h = BOX_H * s;
      if (minTop + h > bottom) { bottom = minTop + h; heroH = bottom + 14 + metaH + 20; } // too short: let the hero grow
      hero.style.minHeight = Math.round(heroH) + 'px';
      var left0 = (mob ? L * 0.01 : L * 0.054) + (prefW - w) / 2, top0 = bottom - h;
      objs.forEach(function (el, i) {
        var p = (mob ? el.dataset.m : el.dataset.o).split(',').map(Number); // left, top, width, rotation in layout units
        var j = el._j;
        var ow = p[2] * s;
        var x = left0 + p[0] * s + j[0] * w * 0.06;
        var y = top0 + p[1] * s + j[1] * h * 0.07;
        x = Math.min(Math.max(x, -L * 0.03), L * 1.03 - ow) + g0;
        el.style.width = Math.round(ow) + 'px';
        el.style.left = (x / LW * 100).toFixed(2) + '%';
        el.style.top = Math.round(y) + 'px';
        el.style.zIndex = i + 1;
        el.querySelector('img').style.rotate = (p[3] + j[2] * 12).toFixed(1) + 'deg';
        el.style.setProperty('--delay', (120 + i * 110) + 'ms');
      });
      if (window.ksTidied && window.ksTidied()) window.ksToEdges();
    };
    jitter();
    place();
    // once someone has moved an object, leave everything where they put it
    // (until they tidy up or come back to the page)
    var moved = false;
    var relayout = function () { if (!moved) place(); };
    window.ksPlaceObjects = relayout;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    if (phone.addEventListener) phone.addEventListener('change', function () { moved = false; place(); });
    var lastW = window.innerWidth, rt;
    window.addEventListener('resize', function () {
      // phones resize when the address bar shows or hides as you scroll: ignore anything but a width change
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(rt); rt = setTimeout(relayout, 200);
    });
    var tidy = document.querySelector('.tidy');
    var tidied = false;
    var animate = function (on) { // glide when tidying, snap otherwise
      objs.forEach(function (el) {
        el.style.transition = on ? 'left .9s cubic-bezier(.2,.7,.1,1), top .9s cubic-bezier(.2,.7,.1,1)' : '';
        el.querySelector('img').style.transition = on ? 'rotate .9s cubic-bezier(.2,.7,.1,1), scale .16s ease' : '';
      });
    };
    var toEdges = function () { // park each object just off screen, peeking in round the edges
      var mob = phone.matches;
      var L = layer.offsetWidth, lr = layer.getBoundingClientRect();
      var leftEdge = -lr.left, rightEdge = document.documentElement.clientWidth - lr.left;
      var hr = h1.getBoundingClientRect(), r0 = hero.getBoundingClientRect();
      var heroH = hero.offsetHeight, metaH = meta.offsetHeight;
      var top = hr.top - r0.top, below = hr.bottom - r0.top + 16, bottom = heroH - metaH - 30;
      // where each object tucks away (van, coral, coin, surfboard, potato, sewing machine, shark, cats):
      // right edge, left edge (below the statement) or peeking up from the bottom
      var sides = mob ? ['r', 'l', 'r', 'l', 'l', 'l', 'r', 'r'] : ['r', 'l', 'r', 'b', 'l', 'l', 'r', 'b'];
      var groups = { l: [], r: [], b: [] };
      objs.forEach(function (el, i) { groups[sides[i % sides.length]].push(el); });
      var bottomX = mob ? [0.3, 0.72] : [0.27, 0.73];
      ['l', 'r', 'b'].forEach(function (s) {
        var g = groups[s];
        g.forEach(function (el, k) {
          var w = el.offsetWidth, h = el.offsetHeight, x, y, rot;
          if (s === 'b') {
            var showH = Math.min(h * 0.38, mob ? 70 : 120);
            x = leftEdge + (rightEdge - leftEdge) * bottomX[k % 2] - w / 2;
            y = heroH - showH;
            rot = (Math.random() * 2 - 1) * 10;
          } else {
            var from = s === 'l' || mob ? below : top + 10;
            var cy = from + (bottom - from) * ((k + 0.5) / g.length);
            cy = Math.max(from + h * 0.3, Math.min(bottom - h * 0.55, cy)); // keep clear of the line along the bottom
            var show = Math.max(mob ? 34 : 56, Math.min(w * 0.3, mob ? 60 : 120)); // how much peeks in, in px
            x = s === 'l' ? leftEdge - (w - show) : rightEdge - show;
            y = cy - h / 2;
            rot = (s === 'l' ? 1 : -1) * (6 + Math.random() * 14);
          }
          el.style.left = (x / L * 100).toFixed(2) + '%';
          el.style.top = Math.round(y) + 'px';
          el.querySelector('img').style.rotate = rot.toFixed(1) + 'deg';
        });
      });
    };
    window.ksTidied = function () { return tidied; };
    window.ksToEdges = toEdges;
    if (tidy) tidy.addEventListener('click', function () {
      if (!tidied) {
        moved = false; animate(true); toEdges(); tidied = true; tidy.textContent = 'bring them back';
        setTimeout(function () { animate(false); }, 950);
      } else {
        tidied = false; tidy.textContent = 'tidy up';
        moved = false; jitter(); place();
        objs.forEach(function (el) { // replay the fall
          var im = el.querySelector('img');
          im.style.animation = 'none'; void im.offsetWidth; im.style.animation = '';
        });
      }
    });

    objs.forEach(function (el) {
      var d = null;
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        var r = layer.getBoundingClientRect();
        d = { sx: e.clientX, sy: e.clientY, ox: parseFloat(el.style.left), oy: parseFloat(el.style.top), w: r.width };
        el.style.zIndex = ++top;
        moved = true;
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
    print.innerHTML = '<img alt=""><span class="e"></span>';
    var emo = print.querySelector('.e');
    document.body.appendChild(print);
    var pimg = print.querySelector('img');
    var tilts = [-6, 5, -3, 7, -8, 4, -5, 6, -4];
    var ratio = {}; // learn each picture's shape up front
    Array.prototype.forEach.call(list.querySelectorAll('.row[data-print]'), function (row) {
      var im = new Image();
      im.onload = function () { ratio[row.dataset.print] = im.naturalWidth / im.naturalHeight; };
      im.src = row.dataset.print;
    });
    Array.prototype.forEach.call(list.querySelectorAll('.row'), function (row, i) {
      row.addEventListener('mouseenter', function () {
        // confidential projects show a 🤫, and projects with no picture show their own emoji
        var e = row.hasAttribute('data-hush') ? '🤫' : row.dataset.emoji;
        var hush = !!e;
        if (e) emo.textContent = e;
        print.classList.toggle('hush', hush);
        if (!hush) {
          pimg.src = row.dataset.print;
          var a = ratio[row.dataset.print] || 0.8; // width / height
          print.style.width = Math.round(Math.min(380, Math.sqrt(64000 * a))) + 'px'; // same area whatever the shape
        }
        print.style.rotate = tilts[i % tilts.length] + 'deg';
        print.classList.add('on');
      });
      row.addEventListener('mouseleave', function () { print.classList.remove('on'); });
    });
    list.addEventListener('mousemove', function (e) {
      var x = e.clientX + 28;
      if (x + print.offsetWidth + 20 > window.innerWidth) x = e.clientX - print.offsetWidth - 28;
      print.style.left = x + 'px';
      print.style.top = (e.clientY - print.offsetHeight / 2) + 'px';
    });
  }

  /* ---------- Project page: gallery + info panel ---------- */
  var p = document.querySelector('.p');
  if (p) {
    var imgs = Array.prototype.slice.call(p.querySelectorAll('.p-stage > img, .p-stage > .vid'));
    var cap = p.querySelector('.cap');
    var count = p.querySelector('.count');
    var dots = Array.prototype.slice.call(p.querySelectorAll('.p-dots span'));
    var i = 0, n = imgs.length;
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    var show = function (k) {
      i = (k + n) % n;
      imgs.forEach(function (im, j) {
        im.classList.toggle('on', j === i);
        var fr = im.querySelector && im.querySelector('iframe');
        if (fr) { if (j === i) { if (!fr.src) fr.src = fr.dataset.src; } else if (fr.src) { fr.removeAttribute('src'); } } // load when shown, stop when leaving
      });
      dots.forEach(function (dt, j) { dt.classList.toggle('on', j === i); });
      cap.textContent = 'Fig. ' + pad(i + 1) + ': ' + imgs[i].dataset.caption;
      if (imgs[i].dataset.note) { // a small aside, e.g. for AI-generated mockups
        var nt = document.createElement('span'); nt.className = 'note'; nt.textContent = imgs[i].dataset.note; cap.appendChild(nt);
      }
      if (count) count.textContent = pad(i + 1) + ' / ' + pad(n);
      var nxt = imgs[(i + 1) % n]; if (nxt.loading === 'lazy') nxt.loading = 'eager';
      if (n < 2) p.classList.add('single');
    };
    show(0);
    var stage = p.querySelector('.p-stage');
    var swiped = false;
    stage.addEventListener('click', function (e) { if (e.target.closest('.vid')) return; if (!swiped) show(i + 1); swiped = false; });
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

// Statement ends where the "Work" link starts
(function () {
  var w = document.getElementById('nav-work'), h = document.querySelector('.hero h1');
  if (!w || !h) return;
  var lastW = 0;
  function fit() {
    if (window.innerWidth === lastW) return; // phones fire resize on scroll; only a width change matters
    lastW = window.innerWidth;
    var r = w.getBoundingClientRect().left - h.getBoundingClientRect().left;
    h.style.setProperty('--stmt', Math.round(r) + 'px');
    if (window.ksPlaceObjects) window.ksPlaceObjects();
  }
  fit(); window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { lastW = 0; fit(); });
})();
