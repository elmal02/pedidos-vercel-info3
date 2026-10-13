// ============================================================================
//   MISIONES — Sistema de Pedidos y Clientes · Informática III (Grupo 1301)
// ============================================================================
//   Este es el ÚNICO archivo de lógica que vas a modificar.
// ============================================================================

import { ESTADOS } from './datos.js'

// ----------------------------------------------------------------------------
// MISIÓN 1 · RF3 — ¿Cuánto paga el cliente?
// ----------------------------------------------------------------------------
export function totalPedido(pedido) {
  if (!pedido || !pedido.items || pedido.items.length === 0) {
    return 0;
  }

  // Multiplicamos por 100 para trabajar con centavos enteros y evitar el error 0.1 + 0.2
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

  // Si no existen en el arreglo, o no avanzan estrictamente un solo paso
  if (indexActual === -1 || indexNuevo === -1) return false;

  return indexNuevo === indexActual + 1;
}

// ----------------------------------------------------------------------------
// MISIÓN 3 · RF1 — ¿Los datos del cliente son válidos?
// ----------------------------------------------------------------------------
export function validarCliente(cliente) {
  const errores = [];
  const datos = cliente || {};

  // 1. Nombre requerido (no vacío o solo espacios)
  const nombreLimpio = (datos.nombre || '').trim();
  if (nombreLimpio === '') {
    errores.push('nombre_requerido');
  }

  // 2. Teléfono: exactamente 10 dígitos tras quitar espacios y guiones
  const telefonoBruto = datos.telefono || '';
  const telefonoLimpio = telefonoBruto.replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(telefonoLimpio)) {
    errores.push('telefono_invalido');
  }

  // 3. Email opcional, pero si viene debe tener formato válido algo@algo.algo
  const emailLimpio = (datos.email || '').trim();
  if (emailLimpio !== '') {
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
  
  // Inicializamos todos los estados en 0
  ESTADOS.forEach(estado => {
    resumen[estado] = 0;
  });

  if (!Array.isArray(pedidos)) return resumen;

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

  // Función para normalizar texto (minúsculas y sin acentos mediante NFD)
  const normalizar = (str) => {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const textoNormalizado = normalizar(textoBusqueda);

  return pedidos.filter(pedido => {
    if (!pedido || !pedido.cliente) return false;
    return normalizar(pedido.cliente).includes(textoNormalizado);
  });
}

// ----------------------------------------------------------------------------
// MISIÓN 6 · DESTACADO — Los mejores clientes
// ----------------------------------------------------------------------------
export function topClientes(pedidos, n) {
  if (!Array.isArray(pedidos) || typeof n !== 'number' || n <= 0) return [];

  const acumulador = {};

  // Acumulamos el gasto reutilizando totalPedido
  pedidos.forEach(pedido => {
    if (!pedido || !pedido.cliente) return;
    const cliente = pedido.cliente;
    const monto = totalPedido(pedido);

    if (!acumulador[cliente]) {
      acumulador[cliente] = 0;
    }
    acumulador[cliente] += monto;
  });

  // Convertimos a arreglo y aseguramos redondear los totales
  const listaClientes = Object.entries(acumulador).map(([cliente, total]) => ({
    cliente,
    total: Math.round(total * 100) / 100
  }));

  // Ordenamos de mayor a menor total; en empate, por orden alfabético
  listaClientes.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    return a.cliente.localeCompare(b.cliente);
  });

  return listaClientes.slice(0, n);
}