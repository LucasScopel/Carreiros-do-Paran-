/**
 * Wrapper básico de layout para emails HTML.
 *
 * Centraliza estilo base e estrutura visual do email.
 */
export function layout(title: string, content: string) {
  return `
    <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
      <h2>${title}</h2>

      ${content}
    </div>
  `;
}

/**
 * Gera um botão estilizado para uso em emails HTML.
 *
 * Usa um link <a> com estilo inline para compatibilidade com clientes de email.
 */
export function button(url: string, text: string) {
  return `
    <a
      href="${url}"
      style="
        display: inline-block;
        padding: 12px 20px;
        background: #111;
        color: white;
        text-decoration: none;
        border-radius: 8px;
      "
    >
      ${text}
    </a>
  `;
}
