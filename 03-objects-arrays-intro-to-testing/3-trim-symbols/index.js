/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  const sameSymbolArrs = string
  .split('')
  .reduce(
    (arr, symbol) => {
      if (arr.length === 0) {
        arr.push([symbol]);
        return arr;
      } 
      
      const prevSymbolArr = arr[arr.length - 1];
      if (symbol === prevSymbolArr[0]) {
        prevSymbolArr.push(symbol);
      } else {
        arr.push([symbol]);
      }

      return arr;
    }, []);

  return sameSymbolArrs
  .map(arr => {
    if (arr.length > size) {
      arr.length = size;
    } 
    return arr.join('');
  })
  .join('');
}