/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

export function sortStrings(arr, param = 'asc') {
  const resultArr = arr
  .map(str => str.normalize()) // for correct compare ã === ã
  .sort((strA, strB) => {
    return strA.localeCompare(strB, ['ru', 'en'], {caseFirst: "upper"});
  }); 
  return (param !== 'asc') 
    ? resultArr.reverse()
    : resultArr;
}