$(function () {
  'use strict';
  var KEY = 'fs-pedidos-v1', filter = 'all', query = '', MIN = 60000;
  var LABEL = { pendiente: 'Pendiente', preparando: 'Preparando', listo: 'Listo' };

  // 1. Lectura de pedidos desde localStorage
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(s) ? s : []; }
    catch (e) { return []; }
  }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
  function esc(s) { return $('<i>').text(s).html(); }

  function tiempo(pl) {
    var txt = 'Estimado: ' + pl.tiempoEstimado + ' min';
    if (pl.estado !== 'preparando' || !pl.inicio) return '<small>' + txt + '</small>';
    var rest = pl.tiempoEstimado - Math.floor((Date.now() - pl.inicio) / MIN);
    return rest >= 0
      ? '<small>⏱ ' + txt + ' · quedan ' + rest + ' min</small>'
      : '<small class="late">⏱ ' + txt + ' · retrasado ' + (-rest) + ' min</small>';
  }

  function render() {
    var pedidos = load();
    ['pendiente', 'preparando', 'listo'].forEach(function (e) {
      $('#c' + e.charAt(0).toUpperCase() + e.slice(1)).text(pedidos.filter(function (p) { return p.estado === e; }).length);
    });
    var html = pedidos.filter(function (p) {
      var txt = ('mesa ' + p.mesa + ' ' + p.mesero).toLowerCase();
      return (filter === 'all' || p.estado === filter) && txt.indexOf(query) > -1;
    }).map(function (p) {
      var items = p.platillos.map(function (pl, i) {
        var btn = pl.estado === 'preparando'
          ? '<button type="button" class="btn-sm" data-a="listo" data-i="' + i + '">Marcar Listo</button>'
          : pl.estado === 'listo' ? '<span aria-label="Listo">✅</span>' : '';
        return '<li class="platillo is-' + pl.estado + '"><div class="n">' + pl.q + '× ' + esc(pl.nombre) + tiempo(pl) + '</div>' + btn + '</li>';
      }).join('');
      var inicio = p.estado === 'pendiente'
        ? '<button type="button" class="btn" data-a="iniciar">Iniciar Preparación</button>' : '';
      return '<article class="pedido s-' + p.estado + '" data-id="' + p.id + '">' +
        '<h3>Mesa ' + p.mesa + '</h3>' +
        '<small>' + esc(p.mesero) + ' · pedido #' + p.id + '</small>' +
        '<span class="badge">' + LABEL[p.estado] + '</span>' +
        '<ul class="platillos">' + items + '</ul>' + inicio + '</article>';
    }).join('');
    $('#pedidos').html(html || '<p class="empty">No hay pedidos con ese filtro.</p>');
  }

  function mutar(id, fn) {
    var pedidos = load(), p = pedidos.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    fn(p); save(pedidos); render();
  }

  // 2. Iniciar Preparación: pendiente → preparando (y arranca el tiempo estimado)
  $('#pedidos').on('click', '[data-a="iniciar"]', function () {
    mutar(+$(this).closest('.pedido').data('id'), function (p) {
      p.estado = 'preparando';
      p.platillos.forEach(function (pl) { pl.estado = 'preparando'; pl.inicio = Date.now(); });
    });
  });

  // Marcar Listo (platillo) + 3. si todos están listos, el pedido pasa a "listo"
  $('#pedidos').on('click', '[data-a="listo"]', function () {
    var i = +$(this).data('i');
    mutar(+$(this).closest('.pedido').data('id'), function (p) {
      p.platillos[i].estado = 'listo';
      var todos = p.platillos.every(function (pl) { return pl.estado === 'listo'; });
      if (todos) p.estado = 'listo';
    });
  });

  $('.filters').on('click', '.chip', function () {
    filter = $(this).data('f');
    $('.filters .chip').attr('aria-pressed', 'false'); $(this).attr('aria-pressed', 'true');
    render();
  });
  $('#q').on('input', function () { query = $.trim(this.value).toLowerCase(); render(); });
  $('#theme').on('click', function () {
    var root = document.documentElement;
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
  });

  // Pedidos nuevos desde otra pestaña (mesero) y refresco del cronómetro
  window.addEventListener('storage', function (e) { if (e.key === KEY) render(); });
  setInterval(render, 5000);
  render();
});