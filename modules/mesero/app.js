$(function () {
  'use strict';
  var KEY = 'fs-mesero-v1', KEY_PED = 'fs-pedidos-v1', ME = 'Kellys D';
  var MENU = [
    {id:1,n:'Camarón zarandeado',p:270,c:'cocina',e:'🦐',t:25},
    {id:2,n:'Margarita',p:95,c:'bar',e:'🍹',t:5},
    {id:3,n:'Camarón empanizado',p:230,c:'cocina',e:'🍤',t:18},
    {id:4,n:'Aguachile negro',p:230,c:'cocina',e:'🥣',t:12},
    {id:5,n:'Mojito',p:90,c:'bar',e:'🍃',t:6},
    {id:6,n:'Clericot',p:90,c:'bar',e:'🍷',t:4},
    {id:7,n:'Ceviche tostada',p:120,c:'cocina',e:'🥑',t:10},
    {id:8,n:'Cerveza',p:55,c:'bar',e:'🍺',t:1}
  ];
  var now = Date.now(), min = 60000;
  var state = null, filter = 'all', query = '', cat = 'all', current = null;

  function seed() {
    function t(id, st, w, ago, items) { return {id:id, st:st, w:w, since:ago ? now - ago*min : null, items:items || []}; }
    return [
      t(1,'busy',ME,22,[{id:1,q:1},{id:2,q:2},{id:4,q:1},{id:6,q:1}]), t(2,'busy','Anna R',55,[{id:3,q:2}]),
      t(3,'free'), t(4,'busy',ME,62,[{id:7,q:1},{id:8,q:2}]), t(5,'free'),
      t(6,'busy','Anna R',85,[{id:4,q:2}]), t(7,'free'), t(8,'free'),
      t(9,'alert','Anna R',5,[{id:3,q:2},{id:3,q:2}].slice(0,1))
    ];
  }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(s) && s.length) return s; } catch (e) {}
    return seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function esc(s) { return $('<i>').text(s).html(); }
  function money(n) { return '$' + n.toLocaleString('es-MX'); }
  function find(id) { return state.filter(function (m) { return m.id === id; })[0]; }
  function dish(id) { return MENU.filter(function (d) { return d.id === id; })[0]; }
  function elapsed(since) {
    if (!since) return '';
    var m = Math.max(0, Math.round((Date.now() - since) / min));
    return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2) + ' h';
  }
  var LABEL = {free:'Libre', busy:'Con pedido', alert:'Requiere atención'};

  // ===== Cocina: enviar pedidos a localStorage =====
  function loadPedidos() {
    try { var p = JSON.parse(localStorage.getItem(KEY_PED)); return Array.isArray(p) ? p : []; } catch (e) { return []; }
  }
  function savePedidos(p) { try { localStorage.setItem(KEY_PED, JSON.stringify(p)); } catch (e) {} }

  // Convierte los items de una mesa en un pedido para cocina (solo lo que aún no se ha enviado)
  function armarPedido(m, pedidos) {
    m.sent = m.sent || {};
    var platillos = [];
    m.items.forEach(function (it) {
      var d = dish(it.id), nuevos = it.q - (m.sent[it.id] || 0);
      if (d.c === 'cocina' && nuevos > 0) {
        platillos.push({id:d.id, nombre:d.n, q:nuevos, tiempoEstimado:d.t, estado:'pendiente', inicio:null});
      }
      m.sent[it.id] = it.q;
    });
    if (!platillos.length) return false;
    var abierto = null;
    for (var i = pedidos.length - 1; i >= 0; i--) {
      if (pedidos[i].mesa === m.id && pedidos[i].estado !== 'listo') {
        abierto = pedidos[i];
        break;
      }
    }
    if (abierto) {
      if (abierto.estado === 'preparando') {
        platillos.forEach(function (pl) { pl.estado = 'preparando'; pl.inicio = Date.now(); });
      }
      abierto.platillos = abierto.platillos.concat(platillos);
      return true;
    }
    var nextId = pedidos.reduce(function (mx, p) { return Math.max(mx, p.id); }, 0) + 1;
    pedidos.push({id:nextId, mesa:m.id, mesero:m.w, estado:'pendiente', creado:Date.now(), platillos:platillos});
    return true;
  }
  function enviarACocina(m) {
    var pedidos = loadPedidos();
    var hay = armarPedido(m, pedidos);
    if (hay) savePedidos(pedidos);
    return hay;
  }
  // Primera vez: las mesas de ejemplo con pedido también aparecen en cocina
  function sembrarCocina() {
    if (localStorage.getItem(KEY_PED) !== null) return;
    var pedidos = [];
    state.forEach(function (m) { if (m.st !== 'free') armarPedido(m, pedidos); });
    savePedidos(pedidos); save();
  }

  function toast(msg) {
    var $t = $('#toast').text(msg).removeClass('hidden');
    clearTimeout(toast.id);
    toast.id = setTimeout(function () { $t.addClass('hidden'); }, 2400);
  }

  function renderMesas() {
    var q = query.toLowerCase();
    var list = state.filter(function (m) {
      var okF = filter === 'all' || m.st === filter;
      var txt = ('mesa ' + m.id + ' ' + (m.w || '')).toLowerCase();
      return okF && txt.indexOf(q) > -1;
    });
    var html = list.map(function (m) {
      var meta = m.st === 'free' ? 'Disponible' : esc(m.w) + ' · ' + elapsed(m.since);
      return '<button type="button" class="mesa s-' + m.st + '" data-id="' + m.id + '">' +
        '<h3>Mesa ' + m.id + '</h3><small>' + meta + '</small>' +
        '<span class="badge">' + LABEL[m.st] + '</span></button>';
    }).join('');
    $('#grid').html(html || '<p class="empty">No hay mesas con ese filtro. Prueba con otra búsqueda.</p>');
  }

  function renderMenu() {
    var html = MENU.filter(function (d) { return cat === 'all' || d.c === cat; }).map(function (d) {
      return '<button type="button" class="plato" data-id="' + d.id + '" aria-label="Agregar ' + esc(d.n) + ', ' + money(d.p) + '">' +
        '<span class="em" aria-hidden="true">' + d.e + '</span><b>' + esc(d.n) + '</b><span>' + money(d.p) + '</span></button>';
    }).join('');
    $('#menu').html(html);
  }

  function renderTicket() {
    var m = find(current), total = 0;
    var html = m.items.map(function (it) {
      var d = dish(it.id); total += d.p * it.q;
      return '<li class="line" data-id="' + d.id + '"><div class="n">' + it.q + '× ' + esc(d.n) + '<small>' + money(d.p * it.q) + '</small></div>' +
        '<div class="qty"><button type="button" data-a="-" aria-label="Quitar uno de ' + esc(d.n) + '">−</button>' +
        '<output>' + it.q + '</output><button type="button" data-a="+" aria-label="Agregar uno de ' + esc(d.n) + '">+</button></div></li>';
    }).join('');
    $('#lines').html(html || '<li class="empty" style="padding:1rem">Toca un platillo para agregarlo a la comanda.</li>');
    $('#total').text(money(total));
    $('#warn').toggleClass('hidden', m.st !== 'alert');
    $('#send').prop('disabled', !m.items.length).text(m.st === 'free' ? 'Enviar comanda' : m.st === 'alert' ? 'Confirmar y enviar' : 'Actualizar comanda');
    $('#close').toggleClass('hidden', m.st === 'free');
  }

  function show(view) {
    $('#vMesas').toggleClass('hidden', view !== 'mesas');
    $('#vComanda').toggleClass('hidden', view !== 'comanda');
    $('#q').closest('.search').toggleClass('hidden', view !== 'mesas');
    window.scrollTo(0, 0);
  }
  function openMesa(id) {
    current = id; cat = 'all';
    $('.tab').attr('aria-selected', function () { return $(this).data('c') === 'all'; });
    $('#tCom').text('Mesa ' + id + ' · ' + ME);
    renderMenu(); renderTicket(); show('comanda');
    $('#tCom').attr('tabindex', -1).trigger('focus');
  }

  // Eventos
  $('#grid').on('click', '.mesa', function () { openMesa(+$(this).data('id')); });
  $('.filters').on('click', '.chip', function () {
    filter = $(this).data('f');
    $('.filters .chip').attr('aria-pressed', 'false'); $(this).attr('aria-pressed', 'true');
    renderMesas();
  });
  $('#q').on('input', function () { query = $.trim(this.value); renderMesas(); });
  $('#back').on('click', function () { show('mesas'); renderMesas(); });
  $('.tabs').on('click', '.tab', function () {
    cat = $(this).data('c');
    $('.tab').attr('aria-selected', 'false'); $(this).attr('aria-selected', 'true');
    renderMenu();
  });
  $('#menu').on('click', '.plato', function () {
    var id = +$(this).data('id'), m = find(current);
    var it = m.items.filter(function (x) { return x.id === id; })[0];
    if (it) it.q++; else m.items.push({id:id, q:1});
    save(); renderTicket();
  });
  $('#lines').on('click', '.qty button', function () {
    var id = +$(this).closest('.line').data('id'), m = find(current);
    var it = m.items.filter(function (x) { return x.id === id; })[0];
    it.q += $(this).data('a') === '+' ? 1 : -1;
    if (it.q <= 0) m.items = m.items.filter(function (x) { return x !== it; });
    save(); renderTicket();
  });
  $('#send').on('click', function () {
    var m = find(current);
    if (m.st === 'free') { m.st = 'busy'; m.w = ME; m.since = Date.now(); }
    else m.st = 'busy';
    var aCocina = enviarACocina(m);      // <-- manda lo nuevo a cocina
    save(); renderTicket();
    toast(aCocina ? 'Comanda enviada a cocina · Mesa ' + m.id : 'Comanda actualizada (solo bar) · Mesa ' + m.id);
  });
  $('#close').on('click', function () {
    var m = find(current);
    if (!window.confirm('¿Cerrar la mesa ' + m.id + '? Se borrará la comanda actual.')) return;
    m.st = 'free'; m.w = null; m.since = null; m.items = []; m.sent = {};
    save(); toast('Mesa ' + m.id + ' liberada'); show('mesas'); renderMesas();
  });
  $('#theme').on('click', function () {
    var root = document.documentElement;
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
  });

  state = load(); save(); sembrarCocina(); renderMesas();
  setInterval(function () { if (!$('#vMesas').hasClass('hidden')) renderMesas(); }, 30000);
});