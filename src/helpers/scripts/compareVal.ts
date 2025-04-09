/**
 * General function for sorting array of object based on a key
 *
 * @param {String} key the key to compare. Can use dot notation to compare nested keys (ex. 'attribute.column')
 * @param {String} order either 'asc' (default) or 'desc'
 */
export default function compareValues(key:string, order:string = 'asc') {
    const props = key.split('.');
    const len = props.length;
  
    return (a:any, b:any) => {
      let i = 0;
      let varA = a;
      let varB = b;
      while (i < len) {
        varA = varA[props[i]];
        varB = varB[props[i]];
  
        // property doesn't exist on either object
        if (!varA && !varB) return 0;
        else if (!varA) return -1;
        else if (!varB) return 1;
        i += 1;
      }
  
      if (typeof varA === 'string') {
        varA = varA.toUpperCase();
      }
      if (typeof varB === 'string') {
        varB = varB.toUpperCase();
      }
  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return order === 'desc' ? comparison * -1 : comparison;
    };
  }
  