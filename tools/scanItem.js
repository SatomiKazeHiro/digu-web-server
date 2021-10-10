/**
 * 扫描文件夹,输出并更新信息
 */
const fs = require('fs')
let ioLog = require('./ioLog');
let sortAsWin = require('./sortAsWin');

// 项目初始记录路径
let initLogPath = require('../config').initLogPath;

/**
 * 扫描包含内容项目的方法，不同于只有扫描文件夹的方法
 * @param {String} parentPath 父目录路径
 * @param {String} folderName 文件夹名称
 * @param {Boolean} isSerialize 项目的连载形式
 * @returns {Object} 对象的id和资源路径
 */
let scanItem = (parentPath, folderName, isSerialize = false) => {
  // 完整目录路径
  let completePath = parentPath + folderName + '/';
  // 路径数组
  let pathSlice = completePath.split('/');

  // 扫描该目录文件
  let scanArr = fs.readdirSync(completePath);
  // 对扫描得到的目录文件使用仿windows排序
  scanArr.sort(sortAsWin);

  // 文件状态
  let stat;
  // 文件对象
  let itemObj;

  // 当item.config.json文件不存在时
  if (!fs.existsSync(completePath + 'item.config.json')) {
    // 存储对象,其中的up是值资源文件的增减
    itemObj = { id: "", cover: "", title: "", intro: "", tags: [], type: "", custom_cover: "", up: true, files: ['item.config.json'] };
    // 时间戳生成唯一ID
    itemObj.id = Date.now();
    // 选取封面
    let reg = /\.(png|jpg|gif|jpeg|webp)$/;
    let firstImg = null;
    // 遍历files寻找cover作为封面
    if (scanArr.length > 0)
      scanArr.forEach(file => {
        // 根据路径装载文件/目录状态信息
        stat = fs.lstatSync(completePath + file)
        // 当有文件夹的时候，设置类型是连载版
        if (stat.isDirectory()) itemObj.type = "serial";

        if (reg.test(file)) {
          // 在遍历之时先存储第一张图片作为封面备用
          if (!firstImg) firstImg = file;
          // 遍历寻找cover作为封面
          if (file.toLowerCase() == 'cover')
            if (!itemObj.cover) itemObj.cover = file;
        }
      })
    // 如果没有cover作为封面，则默认第一张图片为封面，若没有图片，firstImg为空
    if (!itemObj.cover) itemObj.cover = firstImg;
    if (!itemObj.type) itemObj.type = "normal";
    itemObj.title = pathSlice[4];
    itemObj.intro = "";
    itemObj.tags = [];
    itemObj.custom_cover = "";

    // 加载文件信息
    itemObj.files.push(...scanArr);
    fs.writeFileSync(completePath + 'item.config.json', JSON.stringify(itemObj));

  } else {
    // 读取目录下的item.config.json
    itemObj = JSON.parse(fs.readFileSync(completePath + 'item.config.json'));
    // 检查item.config.json文件(cover、files除外，这两个是后面独自更新)
    if (!itemObj.id) itemObj.id = Date.now();
    itemObj.title = pathSlice[4];
    if (!itemObj.intro) itemObj.intro = "";
    if (!itemObj.tags) itemObj.tags = [];
    if (!itemObj.custom_cover) itemObj.custom_cover = "";
    if (!itemObj.type) itemObj.type = "";
    itemObj.up = false;

    // 不管原来的封面是否有效,都会更新
    itemObj.cover = '';
    // 选取封面
    let reg = /\.(png|jpg|gif|jpeg|webp)$/;
    let firstImg = '';
    // 寻找cover作为封面
    if (scanArr.length > 0)
      scanArr.forEach(file => {
        // 根据路径装载文件/目录状态信息
        stat = fs.lstatSync(completePath + file)
        // 当有文件夹的时候，判断类型是连载版
        if (stat.isDirectory()) itemObj.type = "serial";

        if (reg.test(file)) {
          // 在遍历之时先存储第一张图片作为封面备用
          if (firstImg == '') firstImg = file;
          // 遍历寻找cover作为封面
          if (file.toLowerCase() == 'cover')
            if (itemObj.cover == '') itemObj.cover = file;
        }
      })
    // 如果没有cover作为封面,则默认第一张图片为封面,若没有图片,firstImg为空
    if (itemObj.cover == '') itemObj.cover = firstImg;

    // 比较数组存储新添加内容
    let addArr = scanArr.filter(item => {
      return !itemObj.files.map(v => v).includes(item)
    })
    // 比较数组存储被移除内容
    let subArr = itemObj.files.filter(item => {
      return !scanArr.map(v => v).includes(item)
    })

    // 按windows排序
    itemObj.files.sort(sortAsWin);

    // 当比较数组有新的内容时提示更新
    if (addArr.length > 0 || subArr.length > 0) {
      // 清除旧目录
      itemObj.files = [];
      // 更新目录
      itemObj.files.push(...scanArr)
      // 有更新则提示更新
      itemObj.up = true;
    }

    // 更新配置文件item.config.json信息
    fs.writeFileSync(completePath + 'item.config.json', JSON.stringify(itemObj));
  }

  delete itemObj.files;
  return itemObj;
}


module.exports.scanItem = scanItem;
