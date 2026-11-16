/*
 * CANAMO - funciones extra para la tienda (canamo.com.ar, Empretienda)
 *
 * Se publica con GitHub Pages y se carga desde Etiquetas HTML <head> con una sola linea:
 *   <script src="https://hagenbuchgabriel-byte.github.io/canamo-tienda/canamo.js" defer></script>
 *
 * Que hace, solo en las paginas de producto:
 *   1. Solapas: "Descripcion" (abierta), "Tipo de horma" (abierta, segun el producto: ver HORMAS),
 *      "Entregas" y "Cambios".
 *      Los textos de Entregas y Cambios salen de las paginas /entregas y /cambios-y-devoluciones
 *      (Mi tienda > Editar paginas). Para cambiar esos textos se editan esas paginas, no este archivo.
 *   2. Bloque "Combina con": "Lo viste recien" + 2 productos que se compran juntos + 1 collar + 1 cinturon,
 *      cada uno con boton "Sumar" que agrega al carrito.
 *
 * Para hacer un cambio: editar este archivo en GitHub y guardar con "Commit changes".
 * GitHub Pages lo publica en 1-2 minutos y los navegadores lo renuevan en 10 minutos como maximo.
 */
(function () {
  'use strict';
  // Se ejecuta cuando la pagina termino de cargar (el archivo se pide de forma asincronica)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', canamo);
  } else {
    canamo();
  }

  function canamo() {
  var form = document.getElementById('add_to_cart-form');
  if (!form || typeof stock === 'undefined') return; // no es una pagina de producto

  /* ------------------------------------------------------------------ */
  /* Estilos                                                            */
  /* ------------------------------------------------------------------ */
  var css = [
    /* Combina con */
    '.cx{margin:28px 0 8px}',
    '.cx h4{font-size:1.1rem;font-weight:700;text-transform:uppercase;margin:0 0 12px}',
    '.cx-c{display:flex;gap:12px;align-items:center;border:1px solid #0002;border-radius:6px;padding:10px;margin-bottom:10px;background:#fff}',
    '.cx-c img{width:84px;height:84px;object-fit:cover;border-radius:4px}',
    '.cx-c>div{flex:1;min-width:0}',
    '.cx-t{font-size:.72rem;text-transform:uppercase;opacity:.7;margin:0}',
    '.cx-n{font-weight:600;display:block;color:inherit}',
    '.cx-c p{margin:2px 0 6px}',
    '.cx-c s{opacity:.5;margin-left:6px}',
    '.cx-c select{height:36px;border:1px solid #0004;border-radius:4px;margin-right:6px;max-width:150px}',
    '.cx-b{height:36px;padding:0 18px;border:0;border-radius:4px;font-weight:600}',
    /* Solapas */
    '.cxa{border-top:1px solid #0002}',
    '.cxw .cxa:last-child,.cxd{border-bottom:1px solid #0002}',
    '.cxa>button{width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:0;padding:16px 0;font-size:1.15rem;font-weight:600;color:inherit;text-align:left;cursor:pointer}',
    '.cxa>button:after{content:"";width:9px;height:9px;border:solid;border-width:0 2px 2px 0;transform:rotate(45deg);margin:0 6px 4px}',
    '.cxa>button.on:after{transform:rotate(-135deg);margin:4px 6px 0}',
    '.cxa>div{padding-bottom:12px}',
    '.cxw{margin-top:24px}',
    '.cxw p{margin:0 0 10px}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var path = location.pathname.replace(/\/$/, '');

  /* ------------------------------------------------------------------ */
  /* 1. Solapas                                                         */
  /* ------------------------------------------------------------------ */
  function solapa(titulo, abierta) {
    var d = document.createElement('div');
    var b = document.createElement('button');
    var c = document.createElement('div');
    d.className = 'cxa';
    b.type = 'button';
    b.textContent = titulo;
    b.className = abierta ? 'on' : '';
    c.hidden = !abierta;
    b.addEventListener('click', function () {
      c.hidden = !c.hidden;
      b.className = c.hidden ? '' : 'on';
    });
    d.appendChild(b);
    d.appendChild(c);
    return { caja: d, contenido: c };
  }

  // Descripcion: envuelve la descripcion que ya trae la tienda (hay una para compu y otra para celular)
  document.querySelectorAll('.product-vip__description').forEach(function (desc) {
    var s = solapa('Descripción', true);
    s.caja.className += ' cxd';
    if (desc.classList.contains('uk-visible@m')) s.caja.classList.add('uk-visible@m');
    desc.parentNode.insertBefore(s.caja, desc);
    s.contenido.appendChild(desc);
  });

  // Tipo de horma: depende del producto. Para cambiar un texto o agregar un producto, editar HORMAS.
  var HORMAS = {
    borcego: {
      titulo: 'Horma normal - amplia',
      texto: ['Pedí el talle que usás habitualmente. Ej.: si calzás 43, pedí 43.',
              '¿Dudás entre dos talles? Elegí el más chico. Ej.: si calzás 39 o 40, pedí 39.']
    },
    zapato: {
      titulo: 'Horma angosta - chica',
      texto: ['Te recomendamos pedir un talle más del que usás habitualmente.',
              'Ej.: si calzás 41, en este modelo pedí 42.']
    },
    normal: {
      titulo: 'Horma normal',
      texto: ['Elegí el talle que usás habitualmente.']
    },
    chica: {
      titulo: 'Horma chica',
      texto: ['¿Dudás entre dos talles? Elegí el más grande.']
    },
    angosta: {
      titulo: 'Horma angosta',
      texto: ['Pedí el talle que usás habitualmente.',
              '¿Dudás entre dos talles? Elegí el más grande.']
    },
    panchaLona: {
      titulo: 'Horma angosta',
      texto: ['Pedí el talle que usás habitualmente.',
              'Si tenés pie ancho, pedí un talle más.',
              '¿Dudás entre dos talles? Elegí el más grande.']
    },
    panchaJean: {
      titulo: 'Horma chica',
      texto: ['Si tenés pie ancho, pedí un talle más.',
              '¿Dudás entre dos talles? Elegí el más grande.']
    }
  };
  function hormaDe(p) {
    if (p.indexOf('/borcegos/') === 0) return HORMAS.borcego;
    if (p.indexOf('/zapatos/') === 0 && /nazare|tolhuin|holbox/.test(p)) return HORMAS.zapato;
    var z = p.replace('/zapatillas/', '');
    if (['zapatilla-dolce-negra-gamuza', 'zapatilla-canamo-estilo-urbano-blanca-gris',
         'dc-negra-cosida-zapatilla-urbana-base-negra'].indexOf(z) > -1) return HORMAS.normal;
    if (z === 'pancha-azul-jean') return HORMAS.panchaJean;
    if (['pancha-canamo-lona-tostado', 'pancha-canamo-lona-negra'].indexOf(z) > -1) return HORMAS.panchaLona;
    if (['zapatillas-londres-blancas', 'londres-negra-cosida-zapatilla-urbana'].indexOf(z) > -1) return HORMAS.chica;
    if (['nautico-kansas-tostado', 'nautico-kansas-negro-gris-lona'].indexOf(z) > -1) return HORMAS.angosta;
    return null;
  }

  // Tipo de horma, Entregas y Cambios: debajo de "Calcula el costo de envio"
  var envio = document.getElementById('shipment_cost-form');
  if (envio) {
    var grupo = document.createElement('div');
    grupo.className = 'cxw';
    envio.parentNode.appendChild(grupo);
    var horma = hormaDe(path);
    if (horma) {
      var sh = solapa('Tipo de horma', true);
      var h = '<p><strong>' + horma.titulo + '</strong></p>';
      horma.texto.forEach(function (t) { h += '<p>' + t + '</p>'; });
      sh.contenido.innerHTML = h;
      grupo.appendChild(sh.caja);
    }
    [
      ['Entregas', '/entregas'],
      ['Cambios', '/cambios-y-devoluciones']
    ].forEach(function (x) {
      var s = solapa(x[0], false);
      grupo.appendChild(s.caja);
      fetch(x[1]).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
        var cont = new DOMParser().parseFromString(html, 'text/html').querySelector('.page__content');
        if (cont) s.contenido.innerHTML = cont.innerHTML;
        else s.caja.remove();
      }).catch(function () { s.caja.remove(); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. Combina con                                                     */
  /* ------------------------------------------------------------------ */
  var B = '/borcegos/borcego-tison-', Z = '/zapatos/', A = '/accesorios/', W = '/zapatillas/';
  var TISON_N = B + 'negro', TISON_R = B + 'roble', TISON_T = B + 'tostado', TISON_C = B + 'camel-edicion-limitada';
  var CINTO_N = A + 'cinturon-negro-cuero-vacuno', CINTO_M = A + 'cinturon-marron-cuero-vacuno-chocolate-p4';
  var PENDULO = A + 'pendulo-de-cuarzo-cristal', ONIX = A + 'collar-de-onix-negro-proteccion';
  var NAZ_N = Z + 'zapato-nazare-negro', NAZ_M = Z + 'zapato-nazare-marron-chocolate';
  var TOL_N = Z + 'zapatos-botita-tolhuin-acordonado-negro', TOL_M = Z + 'zapatos-botita-tolhuin-acordonado-marron';
  var LON_N = W + 'londres-negra-cosida-zapatilla-urbana', LON_B = W + 'zapatillas-londres-blancas';
  var PAN_N = W + 'pancha-canamo-lona-negra', PAN_T = W + 'pancha-canamo-lona-tostado';
  var KAN_N = W + 'nautico-kansas-negro-gris-lona', KAN_T = W + 'nautico-kansas-tostado';

  var OTRO_COLOR = 'Mismo modelo, otro color';
  var JUNTOS = 'Se lleva mucho con este modelo';
  var COMBINA = 'Combina en color';

  // Los 2 productos principales que se compran junto con cada uno (ventas abril-noviembre 2026)
  var REGLAS = {};
  function regla(p, a, ta, b, tb) { REGLAS[p] = [[a, ta], [b, tb]]; }
  regla(TISON_N, TISON_T, OTRO_COLOR, TISON_R, OTRO_COLOR);
  regla(TISON_R, TISON_T, OTRO_COLOR, TISON_N, OTRO_COLOR);
  regla(TISON_T, TISON_N, OTRO_COLOR, TISON_R, OTRO_COLOR);
  regla(TISON_C, TISON_N, OTRO_COLOR, TISON_R, OTRO_COLOR);
  regla('/borcegos/borcego-negro-milan-con-cierre', TISON_T, JUNTOS, TISON_R, JUNTOS);
  regla(NAZ_N, NAZ_M, OTRO_COLOR, TISON_T, JUNTOS);
  regla(Z + 'zapato-nazare-negro-base-negra-acordonado', NAZ_M, OTRO_COLOR, TISON_N, JUNTOS);
  regla(NAZ_M, NAZ_N, OTRO_COLOR, TISON_R, JUNTOS);
  regla(Z + 'nazare-chocolate-tornasolado', NAZ_N, OTRO_COLOR, TISON_R, JUNTOS);
  regla(TOL_N, TOL_M, OTRO_COLOR, TISON_T, JUNTOS);
  regla(TOL_M, TOL_N, OTRO_COLOR, TISON_N, JUNTOS);
  regla(Z + 'zapato-holbox-marron', NAZ_N, JUNTOS, TISON_R, JUNTOS);
  regla(LON_N, LON_B, OTRO_COLOR, TISON_N, JUNTOS);
  regla(LON_B, LON_N, OTRO_COLOR, TISON_N, JUNTOS);
  regla(PAN_N, PAN_T, OTRO_COLOR, TISON_N, JUNTOS);
  regla(PAN_T, PAN_N, OTRO_COLOR, TISON_T, JUNTOS);
  regla(KAN_N, KAN_T, OTRO_COLOR, TISON_N, JUNTOS);
  regla(KAN_T, KAN_N, OTRO_COLOR, TISON_T, JUNTOS);
  regla(CINTO_N, TISON_N, COMBINA, NAZ_N, COMBINA);
  regla(CINTO_M, TISON_R, COMBINA, NAZ_M, COMBINA);
  // Si un producto no tiene regla o falta alguno, se completa con estos
  var RESERVA = [[TISON_N, JUNTOS], [TISON_T, JUNTOS], [TISON_R, JUNTOS], [TISON_C, JUNTOS], [LON_N, JUNTOS]];

  // "Lo viste recien": el ultimo producto que miro esta persona (se guarda en su navegador)
  var visto = null;
  try {
    visto = localStorage.getItem('cxv');
    localStorage.setItem('cxv', path);
  } catch (e) {}
  if (visto === path) visto = null;

  var usados = [path, visto];
  function libre(u) { return u && usados.indexOf(u) === -1; }

  var lista = [];
  (REGLAS[path] || []).concat(RESERVA).forEach(function (x) {
    if (lista.length < 2 && libre(x[0])) {
      var etiqueta = (path.indexOf('tison') > -1 && x[0].indexOf('tison') > -1) ? OTRO_COLOR : x[1];
      lista.push([x[0], etiqueta]);
      usados.push(x[0]);
    }
  });
  var esMarron = /marron|roble|tostado|camel|chocolate|suela/.test(path);
  var collar = [PENDULO, ONIX].filter(libre)[0];
  var cinto = (esMarron ? [CINTO_M, CINTO_N] : [CINTO_N, CINTO_M]).filter(libre)[0];
  if (collar) lista.push([collar, 'Sumale un collar']);
  if (cinto) lista.push([cinto, 'Completá el look']);
  if (visto) lista.unshift([visto, 'Lo viste recién']);

  function leer(html, nombre) {
    var m = html.match(new RegExp('var ' + nombre + ' = (.*?);\\s*\\n'));
    try { return JSON.parse(m[1]); } catch (e) { return null; }
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; });
  }
  function precio(n) { return '$' + Math.round(n).toLocaleString('de-DE'); }

  // Lee de la pagina de cada producto recomendado: id, variantes con stock, atributos, precio, nombre, foto
  function cargar(item) {
    return fetch(item[0]).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
      var id = (html.match(/name="product" value="(\d+)"/) || [])[1];
      var variantes = leer(html, 'stock'), info = leer(html, 's_producto');
      if (!id || !variantes || !info || !info.stock) return null;
      variantes = variantes.filter(function (v) { return v.s_ilimitado == 1 || v.s_cantidad > 0; });
      if (!variantes.length) return null;
      return {
        url: item[0], etiqueta: item[1], id: id, variantes: variantes,
        atributos: leer(html, 'atributos') || [], info: info,
        nombre: leer(html, 'p_nombre'), foto: leer(html, 'i_link_principal')
      };
    }).catch(function () { return null; });
  }

  function tarjeta(p, i) {
    var ids = p.variantes.map(function (v) { return v.idStock; });
    var selects = '';
    p.atributos.forEach(function (a) {
      var valores = Object.keys(a.valores).filter(function (k) {
        return a.valores[k].some(function (id) { return ids.indexOf(id) > -1; });
      });
      if (valores.length > 1) {
        selects += '<select data-a="' + a.idAtributos + '" data-n="' + esc(a.at_nombre) + '"><option value="">' + esc(a.at_nombre) + '</option>' +
          valores.map(function (k) { return '<option>' + esc(k) + '</option>'; }).join('') + '</select>';
      }
    });
    var antes = p.info.precio_anterior > p.info.precio ? '<s>' + precio(p.info.precio_anterior) + '</s>' : '';
    return '<div class="cx-c" data-i="' + i + '">' +
      '<a href="' + p.url + '"><img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy"></a>' +
      '<div><p class="cx-t text--primary">' + esc(p.etiqueta) + '</p>' +
      '<a class="cx-n" href="' + p.url + '">' + esc(p.nombre) + '</a>' +
      '<p>' + precio(p.info.precio) + antes + '</p>' + selects +
      '<button type="button" class="cx-b background--primary contrast_text--primary">Sumar</button>' +
      '<p class="cx-m"></p></div></div>';
  }

  function sumar(p, el) {
    var boton = el.querySelector('.cx-b'), msg = el.querySelector('.cx-m');
    var ids = p.variantes.map(function (v) { return v.idStock; }), falta = '';
    msg.textContent = '';
    el.querySelectorAll('select').forEach(function (s) {
      if (!s.value) { falta = falta || s.getAttribute('data-n'); return; }
      var a = p.atributos.filter(function (x) { return x.idAtributos == s.getAttribute('data-a'); })[0];
      var ok = a.valores[s.value] || [];
      ids = ids.filter(function (id) { return ok.indexOf(id) > -1; });
    });
    if (falta) { msg.textContent = 'Elegí ' + falta.toLowerCase(); return; }
    if (!ids.length) { msg.textContent = 'Sin stock'; return; }
    var datos = new FormData();
    datos.append('product', p.id);
    datos.append('stock', ids[0]);
    datos.append('quantity', 1);
    boton.disabled = true;
    boton.textContent = 'Sumando…';
    $.ajax({
      headers: { 'X-CSRF-TOKEN': csrf_token }, url: '/v4/cart/add', method: 'POST',
      dataType: 'JSON', data: datos, contentType: false, processData: false
    }).done(function (r) {
      boton.textContent = '¡Sumado!';
      build_cart(r.data, true, r.message && r.message.description);
      setTimeout(function () { boton.disabled = false; boton.textContent = 'Sumar'; }, 2500);
    }).fail(function (x) {
      var j = x.responseJSON || {};
      msg.textContent = (j.message && j.message.description) || 'No se pudo sumar';
      boton.disabled = false;
      boton.textContent = 'Sumar';
    });
  }

  Promise.all(lista.slice(0, 5).map(cargar)).then(function (productos) {
    productos = productos.filter(Boolean);
    var campos = document.querySelector('.product-vip__fields');
    if (!productos.length || !campos) return;
    var bloque = document.createElement('div');
    bloque.className = 'cx';
    bloque.innerHTML = '<h4 class="text--primary">Combiná con</h4>' + productos.map(tarjeta).join('');
    campos.parentNode.insertBefore(bloque, campos.nextSibling);

    // Si el cliente toca un talle arriba, se copia en los calzados recomendados (no en cinturones)
    var attrs = document.getElementById('product-vip__attributes');
    if (attrs) attrs.addEventListener('click', function () {
      setTimeout(function () {
        var id = +form.querySelector('[name=stock]').value;
        var v = stock.filter(function (x) { return x.idStock == id; })[0];
        var talle = v && v.valoratributo.filter(function (a) { return a.at_nombre == 'Talle'; })[0];
        if (!talle) return;
        bloque.querySelectorAll('select[data-n="Talle"]:not([data-x])').forEach(function (s) {
          if ([].some.call(s.options, function (o) { return o.value == talle.valor.vat_valor; })) s.value = talle.valor.vat_valor;
        });
      }, 100);
    });

    bloque.querySelectorAll('.cx-c').forEach(function (el) {
      var p = productos[el.getAttribute('data-i')];
      el.querySelectorAll('select').forEach(function (s) {
        s.addEventListener('change', function () { s.setAttribute('data-x', 1); });
      });
      el.querySelector('.cx-b').addEventListener('click', function () { sumar(p, el); });
    });
  });
  } // fin de canamo()
})();
