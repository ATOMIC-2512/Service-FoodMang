$(function () {
  'use strict';
  var KEY = 'fs-pedidos-v1', MKEY = 'fs-mesero-v1';
  var min = 60000, now = Date.now();
  var LABEL = {pendiente:'Pendiente', preparando:'Preparando', listo:'Listo', entregado:'Entregado', pagado:'Pagado'};
  var orders = null, filter = 'activos', paying = null, method = 'efectivo';

  function seed() {
    function o(id, mesa, w, st, ago, items) { return {id:id, mesa:mesa, w:w, st:st, t:now - ago*min, items:items}; }
    function i(n, p, q) { return {n:n, p:p, q:q}; }
    return [
      o(101, 1, 'Kellys D', 'pendiente',  3, [i('Camarón zarandeado',270,1), i('Margarita',95,2), i('Aguachile negro',230,1), i('Clericot',90,1)]),
      o(102, 2, 'Anna R',   'preparando', 14, [i('Camarón empanizado',230,2)]),
      o(103, 4, 'Kellys D', 'listo',      26, [i('Ceviche tostada',120,1), i('Cerveza',55,2)]),
      o(104, 6, 'Anna R',   'entregado',  48, [i('Aguachile negro',230,2)]),
      o(105, 9, 'Anna R',   'entregado',  63, [i('Camarón empanizado',230,1), i('Mojito',90,1)])
    ];
  }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(s) && s.length) return s; } catch (e) {}
    return seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(orders)); } catch (e) {} }
  function esc(s) { return $('<i>').text(s).html(); }
  function money(n) { return '$' + n.toLocaleString('es-MX', {minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2}); }
  function find(id) { return orders.filter(function (o) { return o.id === id; })[0]; }
  function total(o) { return o.items.reduce(function (s, i) { return s + i.p * i.q; }, 0); }
  function elapsed(t) {
    var m = Math.max(0, Math.round((Date.now() - t) / min));
    return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2) + ' h';
  }

  function toast(msg) {
    var $t = $('#toast').text(msg).removeClass('hidden');
    clearTimeout(toast.id);
    toast.id = setTimeout(function () { $t.addClass('hidden'); }, 2400);
  }

  // ---------- Tabla ----------
  function action(o) {
    if (o.st === 'pendiente')  return '<button type="button" class="btn sec sm" data-a="next">Iniciar preparación</button>';
    if (o.st === 'preparando') return '<button type="button" class="btn sec sm" data-a="next">Marcar listo</button>';
    if (o.st === 'listo')      return '<button type="button" class="btn sm" data-a="deliver">Marcar entregado</button>';
    if (o.st === 'entregado')  return '<button type="button" class="btn sm" data-a="pay" aria-label="Cobrar pedido ' + o.id + ', mesa ' + o.mesa + '">Cobrar</button>';
    return '<span class="done">Pagado con ' + (o.paid ? o.paid.m : '—') + '</span>';
  }

  function renderTable() {
    var counts = {activos:0, pendiente:0, preparando:0, listo:0, entregado:0, pagado:0};
    orders.forEach(function (o) { counts[o.st]++; if (o.st !== 'pagado') counts.activos++; });
    $('.filters .chip').each(function () { $(this).find('.cnt').text(counts[$(this).data('f')]); });

    var list = orders.filter(function (o) {
      return filter === 'activos' ? o.st !== 'pagado' : o.st === filter;
    }).sort(function (a, b) { return a.t - b.t; });

    var html = list.map(function (o) {
      var items = o.items.map(function (i) { return i.q + '× ' + esc(i.n); }).join(', ');
      return '<tr data-id="' + o.id + '">' +
        '<td data-l="Pedido">#' + o.id + '<small>' + elapsed(o.t) + '</small></td>' +
        '<td data-l="Mesa">Mesa ' + o.mesa + '</td>' +
        '<td data-l="Mesero">' + esc(o.w || '—') + '</td>' +
        '<td data-l="Platillos" class="items">' + items + '</td>' +
        '<td data-l="Total" class="total-c">' + money(total(o)) + '</td>' +
        '<td data-l="Estado"><span class="badge e-' + o.st + '">' + LABEL[o.st] + '</span></td>' +
        '<td class="act">' + action(o) + '</td></tr>';
    }).join('');
    $('#rows').html(html);
    $('#empty').toggleClass('hidden', !!list.length);
    $('.orders').toggleClass('hidden', !list.length);
  }

  // ---------- Modal de cobro ----------
  var $dlg = $('#pay'), dlg = $dlg[0];

  function setMethod(m) {
    method = m;
    $('.pay .tab').each(function () {
      var on = $(this).data('m') === m;
      $(this).attr({'aria-selected': on, tabindex: on ? 0 : -1});
    });
    $('#pEf').toggleClass('hidden', m !== 'efectivo');
    $('#pTj').toggleClass('hidden', m !== 'tarjeta');
    updateCash();
  }

  function updateCash() {
    var t = total(paying), v = parseFloat($('#cash').val());
    var ok = !isNaN(v) && v >= t;
    if (method === 'efectivo') {
      $('#change').text(ok ? money(Math.round((v - t) * 100) / 100) : (isNaN(v) ? money(0) : 'Faltan ' + money(Math.round((t - v) * 100) / 100)));
      $('#changeBox').toggleClass('short', !isNaN(v) && !ok);
      $('#payOk').prop('disabled', !ok);
    } else {
      $('#payOk').prop('disabled', false);
    }
  }

  function openPay(o) {
    paying = o;
    $('#tPay').text('Cobrar · Mesa ' + o.mesa);
    $('#payTotal').text(money(total(o)));
    $('#payForm')[0].reset();
    clearErrors();
    setMethod('efectivo');
    dlg.showModal();
  }
  function closePay() { dlg.close(); }
  // Los datos de tarjeta nunca se guardan: se limpian al cerrar.
  $dlg.on('close', function () { $('#payForm')[0].reset(); clearErrors(); paying = null; });

  function clearErrors() {
    $('.pay .field input').removeAttr('aria-invalid');
    $('.pay .err').text('');
  }

  function validateCard() {
    var fields = [
      ['#cNum', '#eNum', 'Escribe el número de tarjeta.'],
      ['#cName', '#eName', 'Escribe el nombre que aparece en la tarjeta.'],
      ['#cExp', '#eExp', 'Escribe el vencimiento.'],
      ['#cCvv', '#eCvv', 'Escribe el CVV.']
    ], first = null;
    clearErrors();
    fields.forEach(function (f) {
      var $i = $(f[0]);
      if (!$.trim($i.val())) {
        $i.attr('aria-invalid', 'true'); $(f[1]).text(f[2]);
        if (!first) first = $i;
      }
    });
    if (first) first.trigger('focus');
    return !first;
  }

  function freeMesa(mesaId) {
    if (orders.some(function (o) { return o.mesa === mesaId && o.st !== 'pagado'; })) return;
    try {
      var ms = JSON.parse(localStorage.getItem(MKEY));
      if (!Array.isArray(ms)) return;
      ms.forEach(function (m) {
        if (m.id === mesaId) { m.st = 'free'; m.w = null; m.since = null; m.items = []; }
      });
      localStorage.setItem(MKEY, JSON.stringify(ms));
    } catch (e) {}
  }

  function confirmPay() {
    var t = total(paying), rec = null;
    if (method === 'efectivo') {
      rec = parseFloat($('#cash').val());
      if (isNaN(rec) || rec < t) { updateCash(); return; }
    } else if (!validateCard()) return;

    var o = paying;
    o.st = 'pagado';
    o.paid = {m: method === 'efectivo' ? 'efectivo' : 'tarjeta', at: Date.now(), total: t};
    if (method === 'efectivo') { o.paid.recibido = rec; o.paid.cambio = Math.round((rec - t) * 100) / 100; }
    save(); freeMesa(o.mesa);
    var msg = 'Pedido #' + o.id + ' pagado · Mesa ' + o.mesa + (method === 'efectivo' && o.paid.cambio ? ' · Cambio ' + money(o.paid.cambio) : '');
    closePay(); renderTable(); toast(msg);
  }

  // ---------- Eventos ----------
  $('.filters').on('click', '.chip', function () {
    filter = $(this).data('f');
    $('.filters .chip').attr('aria-pressed', 'false'); $(this).attr('aria-pressed', 'true');
    renderTable();
  });

  $('#rows').on('click', 'button[data-a]', function () {
    var o = find(+$(this).closest('tr').data('id')), a = $(this).data('a');
    if (a === 'next') {
      o.st = o.st === 'pendiente' ? 'preparando' : 'listo';
      save(); renderTable(); toast('Pedido #' + o.id + ' · ' + LABEL[o.st]);
    } else if (a === 'deliver') {
      o.st = 'entregado';
      save(); renderTable(); toast('Pedido #' + o.id + ' entregado · Mesa ' + o.mesa);
    } else if (a === 'pay') {
      openPay(o);
    }
  });

  $('.pay .tab').on('click', function () { setMethod($(this).data('m')); });
  $('.pay .tabs').on('keydown', '.tab', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var m = $(this).data('m') === 'efectivo' ? 'tarjeta' : 'efectivo';
    setMethod(m); $('.pay .tab[data-m="' + m + '"]').trigger('focus');
  });

  $('#cash').on('input', updateCash);
  $('#cNum').on('input', function () {
    var d = this.value.replace(/\D/g, '').slice(0, 19);
    this.value = d.replace(/(.{4})/g, '$1 ').trim();
  });
  $('#cExp').on('input', function () {
    var d = this.value.replace(/\D/g, '').slice(0, 4);
    this.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });
  $('#cCvv').on('input', function () { this.value = this.value.replace(/\D/g, ''); });
  $('.pay .field input').on('input', function () {
    $(this).removeAttr('aria-invalid').closest('.field').find('.err').text('');
  });

  $('#payForm').on('submit', function (e) { e.preventDefault(); confirmPay(); });
  $('#payX, #payCancel').on('click', closePay);
  $dlg.on('click', function (e) { if (e.target === dlg) closePay(); });

  $('#theme').on('click', function () {
    var root = document.documentElement;
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
  });

  orders = load(); save(); renderTable();
  setInterval(function () { renderTable(); }, 30000);
});