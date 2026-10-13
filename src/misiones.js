// ============================================================================
//   MISIONES — Sistema de Pedidos y Clientes · Informática III (Grupo 1301)
// ============================================================================

import { ESTADOS } from './datos.js'

// ----------------------------------------------------------------------------
// MISIÓN 1 · RF3 — ¿Cuánto paga el cliente?
// ----------------------------------------------------------------------------
export function totalPedido(pedido) {
  if (!pedido || !pedido.items || pedido.items.length === 0) {
    return 0;
  }

  // Calculamos el subtotal sumando (cantidad * precioUnitario) de cada item
  // Multiplicamos por 100 y usamos Math.round para evitar problemas de punto flotante
  let subtotalCentavos = pedido.items.reduce((acc, item) => {
    return acc + Math.round((item.cantidad * item.precioUnitario) * 100);
  }, 0);

  const descuento = typeof pedido.descuento === 'number' ? pedido.descuento : 0;
  let totalCentavos = subtotalCentavos * (1 - descuento);

  return Math.round(totalCentavos) / 100;
}

// ----------------------------------------------------------------------------
// MISIÓN 2 · RF4 — ¿Este cambio de estado es válido?
// ----------------------------------------------------------------------------
export function puedeTransicionar(actual, nuevo) {
  if (!actual || !nuevo) return false;
  
  const indexActual = ESTADOS.indexOf(actual);
  const indexNuevo = ESTADOS.indexOf(nuevo);

  // Si alguno no existe en el arreglo ESTADOS, o si intentamos quedarnos en el mismo, o regresar
  if (indexActual === -1 || indexNuevo === -1) return false;

  // Debe avanzar estrictamente un solo paso a la vez
  return indexNuevo === indexActual + 1;
}

// ----------------------------------------------------------------------------
// MISIÓN 3 · RF1 — ¿Los datos del cliente son válidos?
// ----------------------------------------------------------------------------
export function validarCliente(cliente) {
  const errores = [];
  const clienteData = cliente || {};

  // 1. Validar nombre: requerido, no vacío o solo espacios
  const nombreLimpio = (clienteData.nombre || '').trim();
  if (nombreLimpio === '') {
    errores.push('nombre_requerido');
  }

  // 2. Validar teléfono: después de quitar espacios y guiones, deben ser exactamente 10 dígitos
  const telefonoBruto = clienteData.telefono || '';
  const telefonoLimpio = telefonoBruto.replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(telefonoLimpio)) {
    errores.push('telefono_invalido');
  }

  // 3. Validar email: si viene (no está vacío), debe cumplir con el formato algo@algo.algo
  const emailLimpio = (clienteData.email || '').trim();
  if (emailLimpio !== '') {
    // Expresión regular estándar y robusta para validar correos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpio)) {
      errores.push('email_invalido');
    }
  }

  return errores;
}

// ----------------------------------------------------------------------------
// MISIÓN 4 · RF5 — ¿Cuántos pedidos hay en cada estado?
// ----------------------------------------------------------------------------
export function resumenPorEstado(pedidos) {
  const resumen = {};
  
  // Inicializamos todos los estados posibles en 0
  ESTADOS.forEach(estado => {
    resumen[estado] = 0;
  });

  if (!Array.isArray(pedidos)) return resumen;

  // Incrementamos el contador por cada pedido según su estado actual
  pedidos.forEach(pedido => {
    if (pedido && resumen.hasOwnProperty(pedido.estado)) {
      resumen[pedido.estado]++;
    }
  });

  return resumen;
}

// ----------------------------------------------------------------------------
// MISIÓN 5 · RF5 — Buscar pedidos por nombre de cliente
// ----------------------------------------------------------------------------
export function buscarPedidos(pedidos, texto) {
  if (!Array.isArray(pedidos)) return [];
  
  const textoBusqueda = (texto || '').trim();
  if (textoBusqueda === '') {
    return pedidos;
  }

  // Función auxiliar para normalizar cadenas (minúsculas y sin acentos)
  const normalizar = (str) => {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const textoNormalizado = normalizar(textoBusqueda);

  return pedidos.filter(pedido => {
    if (!pedido || !pedido.cliente) return false;
    const clienteNormalizado = normalizar(pedido.cliente);
    return clienteNormalizado.includes(textoNormalizado);
  });
}

// ----------------------------------------------------------------------------
// MISIÓN 6 · DESTACADO — Los mejores clientes
// ----------------------------------------------------------------------------
export function topClientes(pedidos, n) {
  if (!Array.isArray(pedidos) || typeof n !== 'number' || n <= 0) return [];

  const acumulador = {};

  // Acumulamos el gasto total por cada cliente reutilizando totalPedido
  pedidos.forEach(pedido => {
    if (!pedido || !pedido.cliente) return;
    const nombreCliente = pedido.cliente;
    const monto = totalPedido(pedido);

    if (!acumulador[nombreCliente]) {
      acumulador[nombreCliente] = 0;
    }
    acumulador[nombreCliente] += monto;
  });

  // Convertimos el objeto acumulador en un arreglo de objetos y redondeamos los totales a 2 decimales
  const listaClientes = Object.entries(acumulador).map(([cliente, total]) => ({
    cliente,
    total: Math.round(total * 100) / 100
  }));

  // Ordenamos: primero de mayor a menor total; en caso de empate, alfabéticamente por nombre
  listaClientes.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total; // Mayor a menor gasto
    }
    return a.cliente.localeCompare(b.cliente); // Alfabético en caso de empate
  });

  // Devolvemos únicamente los primeros `n` elementos
  return listaClientes.slice(0, n);
}