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
 *   2. Bloque "Combina con": 1 cinturon + 1 calzado de otro modelo + 1 collar,
 *      cada uno con boton "Sumar" que agrega al carrito.
 *   3. Datos para Google (no se ven): precio, stock, fotos y categoria de cada producto,
 *      para que aparezcan en los resultados de busqueda.
 *   4. Compra confirmada (pagina /order): avisa a Tag Manager con monto y numero de pedido,
 *      para medir ventas reales en Google Analytics y Google Ads.
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
  try { medirCompra(); } catch (e) {}
  try { textosCategoria(); } catch (e) {}
  try { datosEmpresa(); } catch (e) {}
  try { guiaTalles(); } catch (e) {}
  try { historia(); } catch (e) {}
  try { notaBlog(); } catch (e) {}
  var form = document.getElementById('add_to_cart-form');
  if (!form || typeof stock === 'undefined') return; // no es una pagina de producto

  try { datosParaGoogle(); } catch (e) {}

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
    zueco: {
      titulo: 'Horma chica',
      texto: ['Te recomendamos pedir un talle más del que usás habitualmente.',
              'Ej.: si calzás 41, en este modelo pedí 42.']
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
    if (/zueco/.test(z)) return HORMAS.zueco; // todos los zuecos (Coco y futuros colores)
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
      h += '<p><a href="/guia-de-talles" style="text-decoration:underline">Ver guía de talles con medidas en cm</a></p>';
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

  var usados = [path];
  function libre(u) { return u && usados.indexOf(u) === -1; }

  // Un solo calzado, y de otro modelo (no el mismo en otro color)
  function modelo(u) { var m = u.match(/tison|milan|nazare|tolhuin|holbox|londres|pancha|kansas|cinturon/); return m ? m[0] : u; }
  var esMarron = /marron|roble|tostado|camel|chocolate|suela/.test(path);
  var lista = [];
  (REGLAS[path] || []).concat([[esMarron ? NAZ_M : NAZ_N, COMBINA]], RESERVA).forEach(function (x) {
    if (lista.length < 1 && libre(x[0]) && modelo(x[0]) !== modelo(path) && x[1] !== OTRO_COLOR) {
      lista.push(x);
      usados.push(x[0]);
    }
  });
  var collar = [PENDULO, ONIX].filter(libre)[0];
  var cinto = (esMarron ? [CINTO_M, CINTO_N] : [CINTO_N, CINTO_M]).filter(libre)[0];
  if (cinto) lista.unshift([cinto, 'Completá el look']);
  if (collar) lista.push([collar, 'Sumale un collar']);

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
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'combina_sumar', cx_sumado: p.nombre, cx_tipo: p.etiqueta, cx_desde: path, cx_valor: Number(p.info.precio) });
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

  /* ------------------------------------------------------------------ */
  /* Compra confirmada: avisa a Tag Manager (evento "compra_confirmada") */
  /* con el monto y el numero de pedido, para Google Analytics y Ads.   */
  /* Solo en la pagina /order que ve el cliente al terminar la compra.  */
  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /* Texto y preguntas frecuentes debajo de las categorias (SEO)         */
  /* ------------------------------------------------------------------ */
  function datosCategorias() { // dentro de una funcion: canamo() puede correr antes que estas lineas
  var ENVIO = ['¿Hacen envíos?', 'Sí, a todo el país. Calculá el costo y el plazo con tu código postal en la página de cada producto.'];
  var RETIRO = ['¿Puedo retirar en persona?', 'Sí, sin cargo en nuestro taller de Av. Larrazábal 1642 (CABA), coordinando antes por WhatsApp.'];
  var CAMBIO = ['¿Puedo cambiarlos?', 'Sí, tenés hasta 10 días desde que recibís la compra.'];
  return {
    '/borcegos': {
      titulo: 'Borcegos de hombre hechos a mano',
      texto: 'En Canamo fabricamos borcegos de hombre en nuestro taller de Buenos Aires. El Borcego Tison viene en negro, roble, tostado y camel, y el Borcego Milan tiene cierre para ponértelo y sacártelo más rápido. Son resistentes, cómodos y con diseño urbano para usar todos los días. Talles del 35 al 46.',
      faq: [ENVIO, RETIRO,
        ['¿Qué talle pido?', 'El Tison tiene horma normal-amplia: pedí tu talle de siempre. En cada producto vas a ver la solapa "Tipo de horma".'],
        CAMBIO]
    },
    '/zapatos': {
      titulo: 'Zapatos de hombre hechos a mano',
      texto: 'Zapatos Nazare y Tolhuin fabricados en nuestro taller de Buenos Aires, con base de Spanzor antideslizante. Modelos elegantes para la oficina o un evento, en negro y marrón chocolate. También armamos combos de zapato + cinturón de cuero vacuno.',
      faq: [['¿Cómo calzan los Nazare?', 'Tienen horma chica: te recomendamos pedir un talle más del que usás habitualmente.'],
        ENVIO, RETIRO, CAMBIO]
    },
    '/zapatillas': {
      titulo: 'Zapatillas urbanas de diseño propio',
      texto: 'Zapatillas urbanas diseñadas y fabricadas por Canamo en Buenos Aires: modelos Dolce, Londres y más, para usar todos los días.',
      faq: [['¿Qué talle pido?', 'Cada producto tiene la solapa "Tipo de horma" con la recomendación de talle.'],
        ENVIO, RETIRO, ['¿Puedo cambiarlas?', CAMBIO[1]]]
    }
  };
  }
  function textosCategoria() {
    var cat = datosCategorias()[location.pathname.replace(/\/$/, '').toLowerCase()];
    var feed = document.querySelector('section.category-feed');
    if (!cat || !feed || document.querySelector('.cx-cat')) return;
    var s = document.createElement('section');
    s.className = 'cx-cat uk-container';
    s.style.cssText = 'max-width:820px;margin:32px auto 40px;line-height:1.55';
    var h = '<h1 style="font-size:1.5rem;font-weight:700;margin:0 0 12px">' + cat.titulo + '</h1>' +
      '<p style="margin:0 0 20px">' + cat.texto + '</p>' +
      '<h2 style="font-size:1.15rem;font-weight:700;margin:0 0 10px">Preguntas frecuentes</h2>';
    cat.faq.forEach(function (q) {
      h += '<h3 style="font-size:1rem;font-weight:600;margin:14px 0 4px">' + q[0] + '</h3><p style="margin:0">' + q[1] + '</p>';
    });
    s.innerHTML = h;
    feed.parentNode.insertBefore(s, feed.nextSibling);
  }

  /* ------------------------------------------------------------------ */
  /* Datos de la empresa para Google (solo en la home): nombre, logo,   */
  /* direccion, horarios, telefono y redes. Une la web con la ficha de  */
  /* Google Maps, Instagram y Facebook.                                 */
  /* ------------------------------------------------------------------ */
  function datosEmpresa() {
    if (location.pathname.replace(/\/$/, '') !== '') return;
    if (document.querySelector('script.cx-empresa')) return;
    var dias = function (d, abre, cierra) {
      return { '@type': 'OpeningHoursSpecification', dayOfWeek: d, opens: abre, closes: cierra };
    };
    var empresa = {
      '@context': 'https://schema.org',
      '@type': 'ShoeStore',
      '@id': 'https://www.canamo.com.ar/#empresa',
      name: 'Canamo',
      alternateName: 'Canamo Fábrica de Calzados',
      url: 'https://www.canamo.com.ar/',
      logo: 'https://d22fxaf9t8d39k.cloudfront.net/3509ce1d12c19379d0be911b24cd471fa5f2629332f58e72183a7ef058193d8410140.png',
      image: 'https://d22fxaf9t8d39k.cloudfront.net/3509ce1d12c19379d0be911b24cd471fa5f2629332f58e72183a7ef058193d8410140.png',
      description: 'Fábrica de calzado en Mataderos, Buenos Aires. Borcegos, zapatos y zapatillas directo de fábrica, con envíos a todo el país.',
      telephone: '+54 11 7840-4747',
      email: 'canhamoindumentaria@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Larrazábal 1642',
        addressLocality: 'Mataderos',
        addressRegion: 'Ciudad Autónoma de Buenos Aires',
        postalCode: 'C1440CUV',
        addressCountry: 'AR'
      },
      openingHoursSpecification: [
        dias(['https://schema.org/Monday', 'https://schema.org/Wednesday', 'https://schema.org/Friday'], '13:00', '19:00'),
        dias('https://schema.org/Saturday', '10:00', '13:00')
      ],
      areaServed: 'AR',
      foundingDate: '2020',
      founder: { '@type': 'Person', '@id': 'https://www.canamo.com.ar/nuestra-historia#gabriel', name: 'Gabriel Guillermo Hagenbuch', url: 'https://www.canamo.com.ar/nuestra-historia' },
      sameAs: [
        'https://www.instagram.com/canamo.calzado/',
        'https://www.facebook.com/Canamo-100576335054386'
      ]
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.className = 'cx-empresa';
    s.textContent = JSON.stringify(empresa);
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------ */
  /* Guia de talles (/guia-de-talles): el texto se carga en Empretienda */
  /* (Editar paginas). Aca solo se le da diseno: tablas de cm,          */
  /* calculadora "¿que talle soy?", tarjetas y botones.                 */
  /* ------------------------------------------------------------------ */
  function guiaTalles() {
    if (location.pathname.replace(/\/$/, '') !== '/guia-de-talles') return;
    var c = document.querySelector('.page__content');
    if (!c || c.classList.contains('gt')) return;
    c.classList.add('gt');

    var css = '.gt{max-width:860px;margin:0 auto;font-size:15px;line-height:1.6;color:#222}' +
      '.gt>p:first-child{font-size:17px;background:#f6f1ea;border-radius:14px;padding:18px 20px;margin-bottom:8px}' +
      '.gt h2{font-size:22px;margin:38px 0 12px;padding-bottom:8px;border-bottom:2px solid #111;text-transform:none;letter-spacing:0}' +
      '.gt h3{font-size:16px;margin:0 0 4px;text-transform:none}' +
      '.gt ol{list-style:none;counter-reset:p;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}' +
      '.gt ol li{counter-increment:p;background:#fff;border:1px solid #e6e0d8;border-radius:12px;padding:14px;font-size:14px}' +
      '.gt ol li:before{content:counter(p);display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#111;color:#fff;font-weight:700;margin-bottom:8px}' +
      '.gt .gt-tip{background:#fff8ec;border-left:4px solid #8a5a2b;border-radius:8px;padding:12px 14px}' +
      '.gt .gt-tabla{overflow-x:auto;margin:10px 0 6px;border:1px solid #e6e0d8;border-radius:12px}' +
      '.gt table{border-collapse:collapse;width:100%;min-width:520px;text-align:center;font-size:14px}' +
      '.gt th,.gt td{padding:9px 6px;border-right:1px solid #eee}' +
      '.gt th{background:#111;color:#fff;font-weight:600}.gt td{background:#fff}' +
      '.gt th:first-child,.gt td:first-child{text-align:left;padding-left:12px;white-space:nowrap}' +
      '.gt td.gt-on{background:#8a5a2b;color:#fff;font-weight:700}' +
      '.gt .gt-nota{font-size:13px;color:#666}' +
      '.gt .gt-calc{background:#111;color:#fff;border-radius:16px;padding:20px;margin:24px 0}' +
      '.gt .gt-calc h2{color:#fff;border-color:#fff;margin-top:0}' +
      '.gt .gt-calc .gt-f{display:flex;flex-wrap:wrap;gap:10px;align-items:center}' +
      '.gt .gt-calc select,.gt .gt-calc input{height:44px;border-radius:10px;border:0;padding:0 12px;font-size:16px;color:#111;background:#fff}' +
      '.gt .gt-calc input{width:110px}' +
      '.gt .gt-res{margin-top:14px;font-size:17px;min-height:26px}' +
      '.gt .gt-res b{font-size:26px;color:#f3c98b}' +
      '.gt h3{background:#f6f1ea;border-radius:10px 10px 0 0;padding:12px 14px;margin-top:12px}' +
      '.gt h3+p{border:1px solid #f0e9df;border-top:0;border-radius:0 0 10px 10px;padding:10px 14px;margin:0}' +
      '.gt .gt-btns{display:flex;flex-wrap:wrap;gap:10px;margin:30px 0 10px}' +
      '.gt .gt-btns a{flex:1 1 150px;text-align:center;background:#111;color:#fff;border-radius:999px;padding:12px 16px;font-weight:600;text-decoration:none}' +
      '.gt .gt-btns a.gt-wa{background:#25d366}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    // "Que talle pedir" destacado
    c.querySelectorAll('p').forEach(function (p) {
      if (/^Qué talle pedir/.test(p.textContent.trim())) p.className = 'gt-tip';
    });

    // Listas "Talle 39: 25,5 cm" -> tablas
    var grupos = [];
    c.querySelectorAll('ul').forEach(function (ul) {
      var filas = [];
      ul.querySelectorAll('li').forEach(function (li) {
        var m = li.textContent.match(/^Talle (\d{2}): ([\d,]+)(?: a ([\d,]+))? cm\s*(\((.+)\))?/);
        if (m) filas.push({ talle: m[1], cm: m[3] ? m[2] + '–' + m[3] : m[2], max: parseFloat((m[3] || m[2]).replace(',', '.')), nota: m[5] || '' });
      });
      if (filas.length < 3) return;
      var h2 = ul.previousElementSibling;
      while (h2 && h2.tagName !== 'H2') h2 = h2.previousElementSibling;
      var nombre = h2 ? h2.textContent.split(':')[0].trim() : 'Modelo';
      var notas = filas.filter(function (f) { return f.nota; }).map(function (f) { return 'Talle ' + f.talle + ': ' + f.nota + '.'; });
      var t = '<table><tr><th>Talle</th>' + filas.map(function (f) { return '<th>' + f.talle + '</th>'; }).join('') + '</tr>' +
        '<tr><td>Plantilla</td>' + filas.map(function (f) { return '<td data-t="' + f.talle + '">' + f.cm + '</td>'; }).join('') + '</tr></table>';
      var caja = document.createElement('div');
      caja.innerHTML = '<div class="gt-tabla">' + t + '</div>' + (notas.length ? '<p class="gt-nota">' + notas.join(' ') + '</p>' : '');
      var prev = ul.previousElementSibling;
      if (prev && /Largo de plantilla/.test(prev.textContent)) prev.remove();
      ul.parentNode.replaceChild(caja, ul);
      grupos.push({ nombre: nombre, filas: filas, caja: caja });
    });

    // Calculadora: medida del pie en cm -> talle
    if (grupos.length) {
      var calc = document.createElement('div');
      calc.className = 'gt-calc';
      calc.innerHTML = '<h2>¿Qué talle soy?</h2><p>Elegí el modelo, poné cuánto mide tu pie y te decimos el talle.</p>' +
        '<div class="gt-f"><select>' + grupos.map(function (g, i) { return '<option value="' + i + '">' + g.nombre + '</option>'; }).join('') +
        '</select><input type="number" inputmode="decimal" step="0.1" min="20" max="33" placeholder="Ej: 26,5"> <span>cm</span></div><div class="gt-res"></div>';
      var pasos = c.querySelector('ol');
      (pasos ? pasos : c.firstElementChild).insertAdjacentElement('afterend', calc);
      var sel = calc.querySelector('select'), inp = calc.querySelector('input'), res = calc.querySelector('.gt-res');
      var calcular = function () {
        c.querySelectorAll('td.gt-on').forEach(function (td) { td.classList.remove('gt-on'); });
        var cm = parseFloat(String(inp.value).replace(',', '.'));
        if (!cm) { res.textContent = ''; return; }
        var g = grupos[sel.value], elegido = null;
        for (var i = 0; i < g.filas.length; i++) { if (g.filas[i].max >= cm) { elegido = g.filas[i]; break; } }
        if (!elegido) { res.innerHTML = 'Tu medida supera nuestro talle más grande en este modelo. Escribinos y te asesoramos.'; return; }
        res.innerHTML = 'Tu talle en ' + g.nombre + ': <b>' + elegido.talle + '</b> (plantilla de ' + elegido.cm + ' cm)';
        var td = g.caja.querySelector('td[data-t="' + elegido.talle + '"]');
        if (td) td.classList.add('gt-on');
      };
      sel.addEventListener('change', calcular);
      inp.addEventListener('input', calcular);
    }

    // Botones al final
    var btns = document.createElement('div');
    btns.className = 'gt-btns';
    btns.innerHTML = '<a href="/borcegos">Ver borcegos</a><a href="/zapatos">Ver zapatos</a><a href="/zapatillas">Ver zapatillas</a>' +
      '<a class="gt-wa" href="https://wa.me/541178404747?text=Hola!%20Tengo%20una%20duda%20con%20el%20talle" target="_blank" rel="noopener">Consultar por WhatsApp</a>';
    c.appendChild(btns);
  }

  /* ------------------------------------------------------------------ */
  /* Nuestra historia (/nuestra-historia): el texto se carga en         */
  /* Empretienda (Editar paginas). Aca: portada con foto, linea de      */
  /* tiempo, fotos, numeros grandes, botones y datos de Gabriel para    */
  /* Google. Fotos: archivos historia-*.jpg en el repo de GitHub.       */
  /* ------------------------------------------------------------------ */
  function historia() {
    if (location.pathname.replace(/\/$/, '') !== '/nuestra-historia') return;
    var c = document.querySelector('.page__content');
    if (!c || c.classList.contains('nh')) return;
    c.classList.add('nh');
    var F = 'https://hagenbuchgabriel-byte.github.io/canamo-tienda/';
    var URL_P = 'https://www.canamo.com.ar/nuestra-historia';

    document.title = 'Gabriel Guillermo Hagenbuch, fundador de Canamo | Nuestra historia';
    var md = document.querySelector('meta[name="description"]');
    if (!md) { md = document.createElement('meta'); md.name = 'description'; document.head.appendChild(md); }
    md.content = 'La historia de Canamo y de su fundador y CEO, Gabriel Guillermo Hagenbuch: emprendedor, consultor en comercio y marketing digital y Experto Universitario (UTN).';

    var css = '.nh{max-width:900px;margin:0 auto;font-size:16px;line-height:1.7;color:#222}' +
      '.nh-hero{position:relative;border-radius:18px;overflow:hidden;min-height:420px;display:flex;align-items:flex-end;background:#111 45% 15%/cover no-repeat;margin-bottom:34px}' +
      '.nh-hero:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 30%,rgba(0,0,0,.8))}' +
      '.nh-hero div{position:relative;padding:28px;color:#fff}' +
      '.nh-hero .nh-big{font-size:30px;line-height:1.2;font-weight:700;margin:0 0 8px}' +
      '.nh-hero .nh-sub{font-size:17px;opacity:.9;margin:0}' +
      '.nh h2{font-size:26px;margin:44px 0 16px;text-transform:none;letter-spacing:0}' +
      '.nh h2:after{content:"";display:block;width:56px;height:4px;background:#8a5a2b;border-radius:2px;margin-top:10px}' +
      '.nh .nh-founder{background:#f6f1ea;border-radius:16px;padding:22px 24px;font-size:17px}' +
      '.nh .nh-founder p{margin:0 0 10px}' +
      '.nh .nh-tl{position:relative;padding-left:30px;border-left:3px solid #e6dccf;margin-left:10px}' +
      '.nh .nh-item{position:relative;margin-bottom:26px}' +
      '.nh .nh-item:before{content:"";position:absolute;left:-40px;top:6px;width:17px;height:17px;border-radius:50%;background:#8a5a2b;border:3px solid #fff;box-shadow:0 0 0 2px #8a5a2b}' +
      '.nh .nh-item h3{font-size:19px;margin:0 0 6px;text-transform:none}' +
      '.nh .nh-item p{margin:0}' +
      '.nh .nh-foto{margin:14px 0 0;max-width:640px;border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.12)}' +
      '.nh .nh-foto img{display:block;width:100%;height:380px;object-fit:cover;object-position:center 30%}' +
      '.nh .nh-foto figcaption{font-size:13px;color:#777;padding:8px 12px;background:#fff}' +
      '.nh .nh-nums{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}' +
      '.nh .nh-nums li{background:#111;color:#fff;border-radius:16px;padding:20px 12px;text-align:center;font-size:14px;line-height:1.4}' +
      '.nh .nh-nums b{display:block;font-size:36px;line-height:1.1;color:#f3c98b;margin-bottom:6px}' +
      '.nh .nh-btns{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 10px}' +
      '.nh .nh-btns a{flex:1 1 160px;text-align:center;background:#111;color:#fff;border-radius:999px;padding:13px 16px;font-weight:600;text-decoration:none}' +
      '.nh .nh-btns a.nh-wa{background:#25d366}' +
      '@media(max-width:600px){.nh-hero{min-height:380px}.nh-hero .nh-big{font-size:24px}.nh .nh-foto img{height:300px}}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var foto = function (archivo, texto) {
      var f = document.createElement('figure');
      f.className = 'nh-foto';
      f.innerHTML = '<img loading="lazy" src="' + F + archivo + '" alt="' + texto + '"><figcaption>' + texto + '</figcaption>';
      f.querySelector('img').onerror = function () { f.remove(); };
      return f;
    };

    // Portada: los dos primeros parrafos sobre la foto de Gabriel
    var p1 = c.querySelector('p'), p2 = p1 && p1.nextElementSibling;
    if (p1) {
      var hero = document.createElement('div');
      hero.className = 'nh-hero';
      hero.style.backgroundImage = 'url(' + F + 'historia-gabriel.jpg)';
      hero.setAttribute('role', 'img');
      hero.setAttribute('aria-label', 'Gabriel Guillermo Hagenbuch, fundador y CEO de Canamo');
      hero.innerHTML = '<div><p class="nh-big">' + p1.innerHTML + '</p>' + (p2 && p2.tagName === 'P' ? '<p class="nh-sub">' + p2.innerHTML + '</p>' : '') + '</div>';
      c.insertBefore(hero, p1);
      p1.remove();
      if (p2 && p2.tagName === 'P') p2.remove();
    }

    // Secciones por h2
    c.querySelectorAll('h2').forEach(function (h2) {
      var t = h2.textContent;
      var sig = [], n = h2.nextElementSibling;
      while (n && n.tagName !== 'H2') { sig.push(n); n = n.nextElementSibling; }
      if (/fundador/i.test(t)) {
        var box = document.createElement('div');
        box.className = 'nh-founder';
        h2.insertAdjacentElement('afterend', box);
        sig.forEach(function (e) { box.appendChild(e); });
      } else if (sig.some(function (e) { return e.tagName === 'H3'; })) {
        var tl = document.createElement('div');
        tl.className = 'nh-tl';
        h2.insertAdjacentElement('afterend', tl);
        var item = null;
        sig.forEach(function (e) {
          if (e.tagName === 'H3') { item = document.createElement('div'); item.className = 'nh-item'; tl.appendChild(item); }
          (item || tl).appendChild(e);
          if (e.tagName === 'P' && item) {
            var h = item.querySelector('h3').textContent;
            if (/desde abajo/i.test(h)) item.appendChild(foto('historia-gabriel-isa.jpg', 'Gabriel con uno de nuestros proveedores'));
            if (/oficio/i.test(h)) item.appendChild(foto('historia-borcegos.jpg', 'Nuestros borcegos en plena producción'));
            if (/^hoy/i.test(h)) item.appendChild(foto('historia-taller.jpg', 'Gabriel en el taller'));
          }
        });
      } else {
        sig.forEach(function (e) {
          if (e.tagName !== 'UL') return;
          e.className = 'nh-nums';
          e.querySelectorAll('li').forEach(function (li) {
            var partes = li.textContent.split(' — ');
            if (partes.length === 2) li.innerHTML = '<b>' + partes[0] + '</b>' + partes[1];
          });
        });
      }
    });

    var btns = document.createElement('div');
    btns.className = 'nh-btns';
    btns.innerHTML = '<a href="/borcegos">Ver borcegos</a><a href="/zapatos">Ver zapatos</a><a href="/zapatillas">Ver zapatillas</a>' +
      '<a class="nh-wa" href="https://wa.me/541178404747?text=Hola!%20Quiero%20visitar%20el%20local" target="_blank" rel="noopener">Escribinos por WhatsApp</a>';
    c.appendChild(btns);

    // Datos de Gabriel para Google (para que aparezca al buscarlo)
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url: URL_P,
      name: 'Nuestra historia - Canamo',
      mainEntity: {
        '@type': 'Person',
        '@id': URL_P + '#gabriel',
        name: 'Gabriel Guillermo Hagenbuch',
        alternateName: 'Gabriel Hagenbuch',
        jobTitle: 'Fundador y CEO de Canamo',
        description: 'Emprendedor y consultor en comercio digital y marketing digital. Fundador y CEO de Canamo, fábrica de calzado en Mataderos, Buenos Aires.',
        image: F + 'historia-gabriel.jpg',
        worksFor: { '@type': 'Organization', '@id': 'https://www.canamo.com.ar/#empresa', name: 'Canamo', url: 'https://www.canamo.com.ar/' },
        hasCredential: { '@type': 'EducationalOccupationalCredential', name: 'Experto Universitario en Negocios Digitales y Marketing Digital', recognizedBy: { '@type': 'CollegeOrUniversity', name: 'Universidad Tecnológica Nacional (UTN)' } },
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidad Tecnológica Nacional (UTN)' },
        knowsAbout: ['Marketing digital', 'Comercio electrónico', 'Negocios digitales', 'Fabricación de calzado'],
        homeLocation: { '@type': 'Place', name: 'Buenos Aires, Argentina' }
      }
    });
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------ */
  /* Notas del blog (/blog/...): el texto se carga en Empretienda        */
  /* (Crear blog). Aca: diseno, tarjetas de productos con precio al dia, */
  /* fotos de modelos, botones y datos de la nota para Google.           */
  /* Para una nota nueva: agregar su direccion en NOTAS.                 */
  /* ------------------------------------------------------------------ */
  function notasBlog() {
    var I = 'https://d22fxaf9t8d39k.cloudfront.net/';
    var BORCEGOS = ['/borcegos/borcego-tison-negro', '/borcegos/borcego-tison-roble', '/borcegos/borcego-tison-tostado',
      '/borcegos/borcego-tison-camel-edicion-limitada', '/borcegos/borcego-negro-milan-con-cierre'];
    return {
      'borcegos-de-hombre-como-elegir-el-tuyo-modelos-colores-y-talles': {
        fecha: '2026-11-24',
        productos: { tras: /nuestros borcegos/i, lista: BORCEGOS },
        fotos: [
          { tras: /qué color/i, imgs: [[I + 'f38a9fd2e2d99fbe0dd654c0443ba1c04148f1cf5adb97ddd492017d391b6d9210140.png', 'Tison Negro: total black'],
            [I + '21ca0fbb6d08f77977419e375721c3d39f529e13702d0126994f5ed17a72b2f510140.jpg', 'Tison Roble'],
            [I + '2335cbfebb0a3137bed493a1f7c2f7af12dbb2b0720410e20f5e0a2cd727b58a10140.jpg', 'Tison Camel']] },
          { tras: /cómo combinarlos/i, imgs: [[I + 'c9239521d47d1b6818fedbab70889a8c73859b85911347affc0364531296e90b10140.jpg', 'Con jean'],
            [I + '3ec355ea81c9de5a305786e54e3bfee7b0b225d76075d84b85bdfe48e6df7a7110140.jpg', 'Con bermuda'],
            [I + '3eaa56d4efc50280aff3939353cebaa0fd5bd0e3cc90371899a16556e77a216010140.jpg', 'Look urbano']] }
        ],
        botones: [['/borcegos', 'Ver todos los borcegos'], ['/guia-de-talles', 'Guía de talles']],
        titulo: 'Borcegos de hombre: cómo elegir el tuyo'
      },
      'borcegos-negros-de-hombre-tison-o-milan-cual-elegir-y-como-usarlos': {
        fecha: '2026-11-24',
        productos: { tras: /nuestros borcegos negros/i, lista: ['/borcegos/borcego-tison-negro', '/borcegos/borcego-negro-milan-con-cierre'] },
        fotos: [
          { tras: /tison o milan/i, imgs: [[I + 'f38a9fd2e2d99fbe0dd654c0443ba1c04148f1cf5adb97ddd492017d391b6d9210140.png', 'Tison Negro'],
            [I + '0744c127ff1710e91daf669c9e7a9216e2920548e69c7d87bcd1293962c07a1210140.jpg', 'Milan Negro con cierre'],
            [I + 'a67e030902393dd6ffe6518c2980f40c2be8450b8ee900f80196c49eb3b8c0ac10140.jpg', 'Milan en la calle']] },
          { tras: /cómo combinar/i, imgs: [[I + '6f8bd52b08e6b3fda62a6a6d9123c526a1bf56315aff1a61addd72cec1a55f7d10140.png', 'Con jean'],
            [I + '71ea4473d921bdd6511f74afda89851e1fd89ce461e55dccded641de2c77cd9410140.jpg', 'Total black'],
            [I + '7e695e26b1efffab5f339230b93ac2c1488cb3962cb19cd254ac658833f8e29410140.jpg', 'Con jean y sweater']] }
        ],
        botones: [['/borcegos', 'Ver todos los borcegos'], ['/guia-de-talles', 'Guía de talles']],
        titulo: 'Borcegos negros: Tison o Milan, cuál elegir'
      },
      'borcegos-marrones-y-camel-para-hombre-roble-tostado-o-camel-cual-elegir': {
        fecha: '2026-11-24',
        productos: { tras: /nuestros borcegos marrones/i, lista: ['/borcegos/borcego-tison-roble', '/borcegos/borcego-tison-tostado', '/borcegos/borcego-tison-camel-edicion-limitada'] },
        fotos: [
          { tras: /cuál te conviene/i, imgs: [[I + '21ca0fbb6d08f77977419e375721c3d39f529e13702d0126994f5ed17a72b2f510140.jpg', 'Tison Roble'],
            [I + 'a599107eef7e9b64e1aef5fa9406283a3488af4ae50e51da19b61198f6b571d310140.jpg', 'Tison Tostado'],
            [I + '2335cbfebb0a3137bed493a1f7c2f7af12dbb2b0720410e20f5e0a2cd727b58a10140.jpg', 'Tison Camel']] },
          { tras: /cómo combinar/i, imgs: [[I + 'c9239521d47d1b6818fedbab70889a8c73859b85911347affc0364531296e90b10140.jpg', 'Camel con jean'],
            [I + '3de47e72bcfa5d59f240db09cae3e7e0090e8de14292789e5bb86baa6177f97710140.jpg', 'Roble en la ciudad'],
            [I + 'ff27009ad8486e7bf619d99856e86895cd58c7b679dcfc5804415df96a1a68e010140.jpg', 'Tostado, look de verano']] }
        ],
        botones: [['/borcegos', 'Ver todos los borcegos'], ['/guia-de-talles', 'Guía de talles']],
        titulo: 'Borcegos marrones y camel: Roble, Tostado o Camel'
      },
      'como-combinar-borcegos-de-hombre-looks-para-cada-ocasion': {
        fecha: '2026-11-24',
        productos: { tras: /elegí tu borcego/i, lista: BORCEGOS },
        fotos: [
          { tras: /todos los días/i, imgs: [[I + 'c9239521d47d1b6818fedbab70889a8c73859b85911347affc0364531296e90b10140.jpg', 'Tison Camel con jean'],
            [I + '6f8bd52b08e6b3fda62a6a6d9123c526a1bf56315aff1a61addd72cec1a55f7d10140.png', 'Tison Negro con jean'],
            [I + '7e695e26b1efffab5f339230b93ac2c1488cb3962cb19cd254ac658833f8e29410140.jpg', 'Milan con jean y sweater']] },
          { tras: /para el trabajo/i, imgs: [[I + 'f38a9fd2e2d99fbe0dd654c0443ba1c04148f1cf5adb97ddd492017d391b6d9210140.png', 'Tison Negro, look prolijo'],
            [I + '3eaa56d4efc50280aff3939353cebaa0fd5bd0e3cc90371899a16556e77a216010140.jpg', 'Milan con campera'],
            [I + '21ca0fbb6d08f77977419e375721c3d39f529e13702d0126994f5ed17a72b2f510140.jpg', 'Tison Roble con saco']] },
          { tras: /fin de semana/i, imgs: [[I + '3ec355ea81c9de5a305786e54e3bfee7b0b225d76075d84b85bdfe48e6df7a7110140.jpg', 'Con bermuda'],
            [I + 'ff27009ad8486e7bf619d99856e86895cd58c7b679dcfc5804415df96a1a68e010140.jpg', 'Look de verano'],
            [I + 'a599107eef7e9b64e1aef5fa9406283a3488af4ae50e51da19b61198f6b571d310140.jpg', 'Tison Tostado en la calle']] },
          { tras: /total black/i, imgs: [[I + '71ea4473d921bdd6511f74afda89851e1fd89ce461e55dccded641de2c77cd9410140.jpg', 'Tison Negro'],
            [I + 'a67e030902393dd6ffe6518c2980f40c2be8450b8ee900f80196c49eb3b8c0ac10140.jpg', 'Milan Negro'],
            [I + '30140df42f54d390b609b5d21b540fc94af2ead48eb112e84020dd1e4a4d3d4510140.png', 'Detalle del Tison Negro']] }
        ],
        botones: [['/borcegos', 'Ver todos los borcegos'], ['/guia-de-talles', 'Guía de talles']],
        titulo: 'Cómo combinar borcegos de hombre: looks para cada ocasión'
      },
      'como-cuidar-tus-borcegos-limpieza-secado-y-trucos-para-que-duren-mas': {
        fecha: '2026-11-24',
        productos: { tras: /hechos para durar/i, lista: BORCEGOS },
        fotos: [
          { tras: /limpieza de todos/i, imgs: [[I + '97ce4d607636e1fffb2d80f997a6018809ce42c703c232c7fe1a848029d5952510140.png', 'Tison Negro'],
            [I + 'b81c6ce20d320f0b31496f1bd5236e45896f684e1d11f9878767488348bd468210140.jpg', 'Milan Negro con cierre'],
            [I + '9c94f8fdaf7b7263ee5d299f8414ad64c18e87380991467354d6d448cb21762310140.jpg', 'Tison Roble']] },
          { tras: /suela y los cordones/i, imgs: [[I + 'e9e1503962092b7b95fc0b2aefb50fc39412874f7fe24b8c843ceb2201862a3010140.jpg', 'Tison Tostado'],
            [I + '65e6db848984bc1499212fd50bcb27bc249ccc9909b7ce4d965df1e54e56b21610140.jpg', 'Tison Camel'],
            [I + 'e93b696360d6e240ad5ca841f3fb830ba4050ad085d97171151903a33f6f16d810140.jpg', 'Milan: base tractor']] }
        ],
        botones: [['/borcegos', 'Ver todos los borcegos'], ['/guia-de-talles', 'Guía de talles']],
        titulo: 'Cómo cuidar tus borcegos para que duren más'
      }
    };
  }
  function notaBlog() {
    var m = location.pathname.match(/^\/blog\/([^\/]+)\/?$/);
    var c = document.querySelector('.blog-article__content');
    if (!m || !c || c.classList.contains('nb')) return;
    c.classList.add('nb');
    var todas = notasBlog();
    var nota = todas[m[1]] || {};

    var css = '.nb{font-size:16px;line-height:1.75;color:#222;max-width:820px;margin:0 auto}' +
      '.nb>p:first-child{font-size:18px;color:#333}' +
      '.nb h2{font-size:24px;margin:40px 0 14px;text-transform:none;letter-spacing:0}' +
      '.nb h2:after{content:"";display:block;width:56px;height:4px;background:#8a5a2b;border-radius:2px;margin-top:10px}' +
      '.nb ul{padding-left:0;list-style:none}.nb ul li{position:relative;padding-left:26px;margin-bottom:8px}' +
      '.nb ul li:before{content:"";position:absolute;left:4px;top:10px;width:10px;height:10px;border-radius:50%;background:#8a5a2b}' +
      '.nb h3{font-size:16px;background:#f6f1ea;border-radius:10px 10px 0 0;padding:12px 14px;margin:12px 0 0;text-transform:none}' +
      '.nb h3+p{border:1px solid #f0e9df;border-top:0;border-radius:0 0 10px 10px;padding:10px 14px;margin:0}' +
      '.nb a{text-decoration:underline}' +
      '.nb .nb-fotos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}' +
      '.nb .nb-fotos figure{margin:0;border-radius:12px;overflow:hidden;background:#f3f3f3}' +
      '.nb .nb-fotos img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover}' +
      '.nb .nb-fotos figcaption{font-size:13px;padding:6px 10px;color:#555}' +
      '.nb .nb-prods{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin:18px 0}' +
      '.nb .nb-prod{display:block;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none!important;color:#111;background:#fff}' +
      '.nb .nb-prod img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#f5f5f5}' +
      '.nb .nb-prod div{padding:10px}.nb .nb-prod b{display:block;font-size:14px;line-height:1.3;min-height:36px}' +
      '.nb .nb-prod s{color:#999;font-size:13px;margin-right:6px}.nb .nb-prod span{font-weight:700;font-size:16px}' +
      '.nb .nb-prod em{display:block;margin-top:8px;text-align:center;background:#111;color:#fff;border-radius:999px;padding:7px;font-style:normal;font-size:13px;font-weight:600}' +
      '.nb .nb-btns{display:flex;flex-wrap:wrap;gap:10px;margin:30px 0 10px}' +
      '.nb .nb-btns a{flex:1 1 160px;text-align:center;background:#111;color:#fff;border-radius:999px;padding:13px 16px;font-weight:600;text-decoration:none}' +
      '.nb .nb-btns a.nb-wa{background:#25d366}' +
      '.nb .nb-prod{display:flex;flex-direction:column}.nb .nb-prod div{display:flex;flex-direction:column;flex:1}.nb .nb-prod em{margin-top:auto}.nb .nb-prod b{margin-bottom:6px}' +
      '.nb .nb-mas{background:#f6f1ea;border-radius:14px;padding:16px 18px;margin-top:20px}.nb .nb-mas p{margin:0 0 6px}.nb .nb-mas a{display:block;padding:6px 0;font-weight:600;color:#111}' +
      '@media(max-width:600px){.nb .nb-fotos{grid-template-columns:repeat(2,1fr)}.nb .nb-fotos figure:nth-child(3){display:none}}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var despuesDe = function (re) {
      var h = [].filter.call(c.querySelectorAll('h2'), function (x) { return re.test(x.textContent); })[0];
      if (!h) return null;
      var e = h;
      while (e.nextElementSibling && e.nextElementSibling.tagName !== 'H2') e = e.nextElementSibling;
      return e;
    };

    (nota.fotos || []).forEach(function (g) {
      var ult = despuesDe(g.tras);
      if (!ult) return;
      var d = document.createElement('div');
      d.className = 'nb-fotos';
      d.innerHTML = g.imgs.map(function (x) { return '<figure><img loading="lazy" src="' + x[0] + '" alt="' + x[1] + '"><figcaption>' + x[1] + '</figcaption></figure>'; }).join('');
      ult.insertAdjacentElement('afterend', d);
    });

    if (nota.productos) {
      var ult = despuesDe(nota.productos.tras);
      if (ult) {
        var grilla = document.createElement('div');
        grilla.className = 'nb-prods';
        ult.insertAdjacentElement('afterend', grilla);
        var fmt = function (n) { return '$' + Math.round(n).toLocaleString('es-AR'); };
        nota.productos.lista.forEach(function (url) {
          var a = document.createElement('a');
          a.className = 'nb-prod';
          a.href = url;
          grilla.appendChild(a);
          fetch(url).then(function (r) { return r.text(); }).then(function (h) {
            var nombre = (h.match(/p_nombre\s*=\s*"([^"]+)"/) || [])[1];
            var img = (h.match(/i_link_principal\s*=\s*['"]([^'"]+)/) || [])[1];
            var sp = (h.match(/s_producto\s*=\s*(\{[^}]*\})/) || [])[1];
            var p = {};
            try { p = JSON.parse(sp); } catch (e) {}
            if (!nombre) { a.remove(); return; }
            a.innerHTML = '<img loading="lazy" src="' + (img || '') + '" alt="' + nombre + '"><div><b>' + nombre.replace(/\s+/g, ' ') + '</b>' +
              (p.precio_anterior > p.precio ? '<s>' + fmt(p.precio_anterior) + '</s>' : '') + (p.precio ? '<span>' + fmt(p.precio) + '</span>' : '') +
              '<em>Ver producto</em></div>';
          }).catch(function () { a.remove(); });
        });
      }
    }

    var btns = document.createElement('div');
    btns.className = 'nb-btns';
    btns.innerHTML = (nota.botones || [['/borcegos', 'Ver borcegos']]).map(function (b) { return '<a href="' + b[0] + '">' + b[1] + '</a>'; }).join('') +
      '<a class="nb-wa" href="https://wa.me/541178404747?text=Hola!%20Tengo%20una%20consulta" target="_blank" rel="noopener">Consultanos por WhatsApp</a>';
    c.appendChild(btns);

    // Seguí leyendo: links a las otras notas
    var otras = Object.keys(todas).filter(function (k) { return k !== m[1] && todas[k].titulo; });
    if (otras.length) {
      var mas = document.createElement('div');
      mas.className = 'nb-mas';
      mas.innerHTML = '<p><strong>Seguí leyendo</strong></p>' + otras.map(function (k) { return '<a href="/blog/' + k + '">' + todas[k].titulo + ' →</a>'; }).join('');
      c.appendChild(mas);
    }

    // Datos de la nota para Google
    var titulo = (document.querySelector('h1') || {}).textContent || document.title;
    var primera = c.querySelector('.nb-fotos img, img');
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    var datos = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: titulo.trim().slice(0, 110),
      mainEntityOfPage: location.origin + location.pathname,
      author: { '@type': 'Person', '@id': 'https://www.canamo.com.ar/nuestra-historia#gabriel', name: 'Gabriel Guillermo Hagenbuch', url: 'https://www.canamo.com.ar/nuestra-historia' },
      publisher: { '@type': 'Organization', '@id': 'https://www.canamo.com.ar/#empresa', name: 'Canamo', logo: { '@type': 'ImageObject', url: 'https://d22fxaf9t8d39k.cloudfront.net/3509ce1d12c19379d0be911b24cd471fa5f2629332f58e72183a7ef058193d8410140.png' } }
    };
    if (nota.fecha) datos.datePublished = nota.fecha;
    if (primera) datos.image = primera.src;
    s.textContent = JSON.stringify(datos);
    document.head.appendChild(s);
  }

  function medirCompra() {
    if (location.pathname.replace(/\/$/, '') !== '/order') return;
    if (typeof order === 'undefined' || !order || !order.number || !order.amount) return;
    var estado = (new URLSearchParams(location.search).get('order_status') || '').toLowerCase();
    if (/rejected|failure|cancel/.test(estado)) return; // pago rechazado: no es venta
    var id = String(order.number);
    try {
      if (localStorage.getItem('cx_compra_' + id)) return; // ya se aviso (el cliente volvio a abrir la pagina)
      localStorage.setItem('cx_compra_' + id, '1');
    } catch (e) {}
    var items = [];
    if (typeof carrito !== 'undefined' && carrito && carrito.productos) {
      Object.keys(carrito.productos).forEach(function (k) {
        var p = carrito.productos[k];
        items.push({ item_id: k, item_name: p.nombre, price: Number(p.precio_unitario), quantity: Number(p.cantidad) });
      });
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: 'compra_confirmada',
      ecommerce: { transaction_id: id, value: Number(order.amount), currency: 'ARS', items: items }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Datos para Google (precio, stock, fotos, categoria)                */
  /* No se ven en la tienda: Google los lee para mostrar precio y       */
  /* disponibilidad en los resultados de busqueda.                      */
  /* ------------------------------------------------------------------ */
  function datosParaGoogle() {
    if (typeof s_producto === 'undefined' || typeof p_nombre === 'undefined') return;
    var canonical = document.querySelector('link[rel="canonical"]');
    var url = canonical ? canonical.href : location.origin + location.pathname.replace(/\/$/, '');
    var meta = document.querySelector('meta[name="description"]');

    var fotos = [];
    if (typeof i_link_principal !== 'undefined' && i_link_principal) fotos.push(i_link_principal);
    document.querySelectorAll('.product-vip__images-grid-mini-image').forEach(function (img) {
      var src = img.getAttribute('data-src') || img.getAttribute('src');
      if (src && fotos.indexOf(src) == -1) fotos.push(src);
    });

    // Precio y stock de cada variante (talle/color)
    var precios = [], hayStock = false;
    stock.forEach(function (v) {
      if (!v.s_mostrar_precio) return;
      precios.push(Number(v.s_oferta ? v.s_precio_oferta : v.s_precio));
      if (v.s_ilimitado || v.s_cantidad > 0) hayStock = true;
    });
    if (!precios.length) precios.push(Number(s_producto.precio));
    var min = Math.min.apply(null, precios), max = Math.max.apply(null, precios);
    // (s_producto.stock no sirve: la tienda lo cambia al cargar la pagina)
    var disponible = hayStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

    var oferta = {
      '@type': min == max ? 'Offer' : 'AggregateOffer',
      url: url,
      priceCurrency: 'ARS',
      availability: disponible,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Canamo' },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'AR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 10,
        returnMethod: 'https://schema.org/ReturnByMail',
        // El cliente paga un envio del cambio (o lo trae sin cargo al local)
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility'
      },
      // Envio a domicilio: el costo real depende del codigo postal;
      // $13.000 cubre casi todo el pais. Despacho 2 a 8 dias habiles.
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 13000, currency: 'ARS' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'AR' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 8, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 7, unitCode: 'DAY' }
        }
      }
    };
    if (min == max) {
      oferta.price = min;
      if (s_producto.precio_anterior > min) {
        oferta.priceSpecification = {
          '@type': 'UnitPriceSpecification',
          priceType: 'https://schema.org/StrikethroughPrice',
          price: Number(s_producto.precio_anterior),
          priceCurrency: 'ARS'
        };
      }
    } else {
      oferta.lowPrice = min;
      oferta.highPrice = max;
      oferta.offerCount = precios.length;
    }

    var producto = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p_nombre,
      url: url,
      image: fotos,
      brand: { '@type': 'Brand', name: 'Canamo' },
      offers: oferta
    };
    if (meta && meta.content) producto.description = meta.content;
    if (stock[0] && stock[0].idStock) producto.sku = String(stock[0].idStock);

    // Ruta: Inicio > Categoria > Producto
    var migas = [], pos = 1;
    document.querySelectorAll('.product-vip__breadcrumb .breadcrumb__link').forEach(function (a, i, todos) {
      var nombre = a.textContent.trim();
      if (!nombre) return;
      migas.push({ '@type': 'ListItem', position: pos++, name: nombre, item: i == todos.length - 1 ? url : a.href });
    });

    agregar(producto);
    if (migas.length > 1) agregar({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: migas });

    function agregar(datos) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(datos);
      document.head.appendChild(s);
    }
  }
})();
