const TinyMceEditor = window.customElements.get('tinymce-editor');
import editorCSS from 'editor-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { toTag } from 'tag';

const toEditor = data => {
  const plugins = 'link quickbars autosave';
  const toolbar = `
    quickimage link blockquote fontsize bold italic | undo redo
  `;
  const select = 'quicklink fontsize bold italic';
  const font_sizes = '14pt 18pt 26pt 42pt';
  const insert = 'quickimage quicklink';
  window.greenRainbowEditorConfig = {
    plugins, toolbar,
    menubar: false,
    link_title: false,
    contextmenu: false,
    content_style: `body {
      font-size: 14pt;
      background-color: rgba(180,220,220,0.2);
    }
    p {
      margin-block-start: 7pt;
      margin-block-end: 7pt;
    }`,
    autosave_interval: '1s',
    autosave_prefix: 'tinymce',
    link_context_toolbar: true,
    font_size_formats: font_sizes,
    autosave_restore_when_empty: true,
    link_assume_external_targets: 'https',
    quickbars_selection_toolbar: select,
    quickbars_insert_toolbar: insert,
  }
  class Editor extends TinyMceEditor {
    constructor() {
      super();
      this.mutate = new MutationObserver((records) => {
        data.content = this.value;
        if (initialize_editor(records)) return;
      });
    }

    connectedCallback() {
      super.connectedCallback();
      const root = this.shadowRoot;
      root.adoptedStyleSheets = [
        globalCSS, editorCSS
      ];
      this.mutate.observe(root, { 
        subtree: true, childList: true, attributes: true
      });
    }
  }
  return toTag('editor', Editor)``({ 
    class: 'editor', data,
    config: 'greenRainbowEditorConfig',
  });
}

const classify = cal => {
  const target = 'calendar__navigation';
  const with_children = el => [el[0], ...el[0].children];
  const els = with_children(cal.getElementsByClassName(target));
  els.forEach(el => el.classList.add('centered'));
}

const ads = new Map([
  ['','tox-notifications-container'],
  ['tox tox-tinymce', 'tox-statusbar']
]);

const remove_ads = records => {
  return records.reduce((a, r) => {
    return [...a, ...r.addedNodes];
  }, []).filter(a => {
    const cls = a.className;
    if (ads.get('') === cls) {
      a.remove(); 
      return false;
    }
    else if (ads.has(cls)) {
      const select = a.getElementsByClassName?.bind(a);
      const nodes = select ? select(ads.get(cls)) : [];
      [...nodes].forEach(n => n.remove());
    }
    return true;
  });
}

const initialize_editor = records => {
  const recs = remove_ads(records);
}

export { toEditor }
