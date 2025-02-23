/**
 * 仿 Win10 文件排序
 * @param {*} a 排序文本1
 * @param {*} b 排序文本2
 * @returns
 */
const sortAsWin = function (a, b) {
  let reg = /[0-9]+/g;
  let listA = a.match(reg);
  let listB = b.match(reg);
  if (!listA || !listB) {
    return a.localeCompare(b);
  }
  for (let i = 0, minLen = Math.min(listA.length, listB.length); i < minLen; i++) {
    // 数字所在位置序号
    let indexA = a.indexOf(listA[i]);
    let indexB = b.indexOf(listB[i]);
    // 数字前面的前缀
    let prefixa = a.substring(0, indexA);
    let prefixb = a.substring(0, indexB);
    // 数字的 string
    let strA = listA[i];
    let strB = listB[i];
    // 数字的值
    let numA = parseInt(strA);
    let numB = parseInt(strB);
    // 如果数字的序号不等或前缀不等，属于前缀不同的情况，直接比较
    if (indexA != indexB || prefixa != prefixb) {
      return a.localeCompare(b);
    } else {
      // 数字的 string 全等
      if (strA === strB) {
        // 如果是最后一个数字，比较数字的后缀
        if (i == minLen - 1) {
          return a.substring(indexA).localeCompare(b.substring(indexB));
        } // 如果不是最后一个数字，则循环跳转到下一个数字，并去掉前面相同的部分
        else {
          a = a.substring(indexA + strA.length);
          b = b.substring(indexA + strA.length);
        }
      } // 如果数字的 string 不全等，但值相等
      else if (numA == numB) {
        // 直接比较数字前缀 0 的个数，多的更小
        return strB.lastIndexOf(numB + "") - strA.lastIndexOf(numA + "");
      } else {
        // 如果数字不等，直接比较数字大小
        return numA - numB;
      }
    }
  }
};

module.exports = sortAsWin;
