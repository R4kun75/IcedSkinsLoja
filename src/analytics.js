export const dispararEventoGA = (nomeEvento, parametros = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', nomeEvento, parametros);
  }
};