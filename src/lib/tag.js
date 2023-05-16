import { reactive, html } from '@arrow-js/core';
import { arrowTags } from 'arrow-tags';

const toTag = (key, customElement=null) => {
  if (customElement === null) {
    return arrowTags(html)[key];
  }
  const tag = `green-rainbow-${key}`;
  customElements.define(tag, customElement);
  return arrowTags(html)[tag];
}

class CustomTag extends HTMLElement {

  static get observedAttributes() {
    return Object.keys(this.setup);
  }

  static get setup() {
    return {};
  }

  get root() {
    return '';
  }

  get styles() {
    return [];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    this.data = reactive(this.constructor.setup);
    shadow.adoptedStyleSheets = this.styles;
    toTag('body')`${this.root}`()(shadow);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name in this.data) this.data[name] = newValue;
    this.shadowRoot.adoptedStyleSheets = this.styles;
    this.changed?.call(this, name, oldValue, newValue);
  }

  connectedCallback() {
    this.connected?.call(this);
  }

  disconnectedCallback() {
    this.disconnected?.call(this);
  }
}

export { toTag, CustomTag }
