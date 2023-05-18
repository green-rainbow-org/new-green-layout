// https://www.npmjs.com/package/paren
const paren = (str, splitDelim, beginChars = ['{'], endChars = ['}']) => {
    if(!Array.isArray(beginChars)){
        beginChars = [beginChars];
    }
    if(!Array.isArray(endChars)){
        endChars = [endChars];
    }
    let s = str,
        out = [],
        pointers = [out],
        start = 0,
        cur = 0;
    for(; cur < s.length; cur++){
        if(beginChars.includes(s[cur])){
            if(start < cur){
                pointers[0].push(s.slice(start, cur));
            }
            start = cur+1;
            let pointer = []
            pointers[0].push(pointer);
            pointers.unshift(pointer);
        } else if(endChars.includes(s[cur])){
            if(pointers.length === 1){
                //unmatched end, wrap anyway
                let wrap = start == cur ? [...pointers[0]] : [...pointers[0], s.slice(start, cur)];
                out = [wrap];
                pointers = [out];
                start = cur+1;
                continue;
            }
            if(start < cur){
                pointers[0].push(s.slice(start, cur));
            }
            start = cur+1;
            pointers.shift();
        }
    }
    if(start < s.length){
        pointers[0].push(s.slice(start, s.length));
    }

    function deepSplit(arr, delim){
        if(Array.isArray(arr)){
            let set = arr.map(v => deepSplit(v, delim));
            for(let i = 0; i < set.length; i++){
                if(set[i].s){
                    let c = set[i].s.length-1;
                    set.splice(i, 1, ...set[i].s)
                    i += c;
                }
            }
            return set;
        } else {
            return {s: arr.split(delim).filter((v,i,a) => (i !== 0 && i !== a.length-1) || v !== '')};
        }
    }

    if(splitDelim !== undefined && splitDelim !== null){
        out = deepSplit(out, splitDelim);
    }
    return out;
}

const toLocation = (indices) => {
  return indices.reduce((o, i, j) => {
    if (j > 0) {
     o.push(indices.slice(0, j).concat(i-1))
    }
    return o;
  }, []);
};

const parseStringTokens = (str, indices) => {
  const loc = toLocation(indices);
  const [ _, pre, post ] = str.match(/(.*?)&(.*)/) || [];
  const has_post = !(post || '').match(/^\s*$/);
  const has_pre = !(pre || '').match(/^\s*$/);
  const has_str = !(str || '').match(/^\s*$/);
  if (indices.length === 1 && has_str) {
    const selectors = str.split(/,\s?/);
    return [{ type: 'selectors', value: selectors }];
  }
  if (has_str && !has_pre && !has_post) {
    return [{ type: 'content', value: str, loc }];
  }
  const out = [];
  if (has_pre) {
    out.push({ type: 'content', value: pre, loc });
  }
  if (has_post) {
    const non_empty = str => !str.match(/^\s*$/);
    const selectors = post.split(/,?\s?&/).filter(non_empty);
    out.push({ type: 'selectors', value: selectors });
  }
  return out;
}

const parseTokens = out => (tree, indices) => {
  if (Array.isArray(tree)) {
    out.push(tree.reduce((o, t, i) => {
      return parseTokens(o)(t, indices.concat(i));
    }, []));
    return out;
  }
  const to_parent = indices.slice(0, -1);
  const tokens = parseStringTokens(tree, to_parent);
  if (tokens.length) out.push(tokens);
  return out;
}

const findContents = (out, tree) => {
  const isList = Array.isArray(tree);
  const isContent = tree.type === 'content';
  if (isList) return tree.reduce(findContents, out);
  if (isContent) out.push(tree);
  return out;
}

const indexTree = parsed => {
  const contents = findContents([], parsed);
  return contents.map(content => {
    const { value, loc } = content;
    const places = loc.reduce((o, indices) => {
      const val = indices.reduce((t, i) => {
        return t[i];
      }, parsed).slice(-1)[0];
      o.push(val.value);
      return o;
    }, []);
    return [places, value];
  });
}

const flatten = (o, selectors, i, a) => {
  if (i !== 0) return o;
  for (const selector of selectors) {
    const prefix = [...o.prefix, selector];
    const empty = { 
      prefix, level: o.level - 1, flat: o.flat
    };
    a.slice(1).reduce(flatten, empty);
    if (empty.level === 0) {
      o.flat.push(prefix);
    }
  }
  return o; 
}

const stringifyTokens = (parsed) => {
  const entries = indexTree(parsed);
  return entries.reduce((out, [keys, value]) => {
    const level = keys.length;
    const empty = { level, prefix: [], flat: [] };
    const { flat } = keys.reduce(flatten, empty);
    return flat.reduce((o, sel) => {
      return `${o}\n ${sel.join('')} { ${value} }`; 
    }, out);
  }, '');
}

const toData = (response) => {
  if (!response.ok) return null;
  return response.text();
}

const toCSS = (text) => {
  if (text === null) return null;
  const prefix = 'data:text/css;base64,';
  const tree = paren(text.replaceAll(/\s+/g, ' '));
  const isNested = tree.some(s => Array.isArray(s) && s.length > 1);
  if (!isNested) {
    return prefix + btoa(text);
  }
  const parsed = parseTokens([])(tree, [0]);
  return prefix + btoa(stringifyTokens(parsed));
}

window.modifyImports = async (oldImports) => {
  const cssFiles = Object.values(oldImports);
  const cssKeys = Object.keys(oldImports);
  const promises = cssFiles.reduce((o, cssFile) => {
    o.push(fetch(cssFile).then(toData).then(toCSS));
    return o;
  }, []);
  const results = await Promise.all(promises);
  return cssKeys.reduce((o, k, i) => {
    if (results[i] !== null) o[k] = results[i];
    return o;
  }, {});
}
