/**
 * 扫描文件夹,输出并更新信息
 */
const fs = require('fs')
let { ioLog } = require('../ioLog');
let { SortLikeWin } = require('../sort');

// const sortLikeWin = require('./sortLikeWin');

// 项目初始记录路径
let initLogPath = './logs/init ' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '.log';

/**
 * 扫描包含内容项目的方法，不同于只有扫描文件夹的方法
 * @param {String} parentPath 父目录路径
 * @param {String} folderName 文件夹名称
 * @returns {Object} 对象的id和资源路径
 */
let scanItem = (parentPath, folderName) => {
  // 完整目录路径
  let completePath = parentPath + folderName + '/';
  // 路径切片数组
  let pathSlice = completePath.split('/');

  // 读取目录文件信息
  let scanArr = fs.readdirSync(completePath);
  // 按windows排序
  scanArr.sort(SortLikeWin);

  // 返回对象id和存储路径进缓存
  let resObj = {
    id: "",
    url: completePath,
  }
  // 当item.config.json文件不存在时
  if (!fs.existsSync(completePath + 'item.config.json')) {
    let itemObj = { id: "", cover: "", files: ['item.config.json'] };
    // 时间戳生成唯一ID
    itemObj.id = Date.now().toString(16);
    resObj.id = itemObj.id;

    // 选取封面
    let reg = /\.(png|jpg|gif|jpeg|webp)$/;
    let firstImg = '';
    // 遍历files寻找cover作为封面
    if (scanArr.length > 0)
      scanArr.forEach(file => {
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
    itemObj.title = pathSlice[4];
    itemObj.intro = "";
    itemObj.tags = [];
    itemObj.customCover = "";
    itemObj.type = "";
    itemObj.url = `/${pathSlice[2]}/${pathSlice[3]}/${resObj.id}`;

    // 加载文件信息
    itemObj.files.push(...scanArr);
    fs.writeFileSync(completePath + 'item.config.json', JSON.stringify(itemObj));
    ioLog(initLogPath, '[+] ' + completePath.slice(1, -1) + ' -> UP', 'up');
  } else {
    // 原来的item.config.json存在

    // 读取原来的item.config.json
    let itemObj = JSON.parse(fs.readFileSync(completePath + 'item.config.json'));
    // 检查item.config.json文件(cover、files除外，这两个是后面独自更新)
    if (!itemObj.id) itemObj.id = Date.now().toString(16);
    resObj.id = itemObj.id;
    itemObj.title = pathSlice[4];
    if (!itemObj.intro) itemObj.intro = "";
    if (!itemObj.tags) itemObj.tags = [];
    if (!itemObj.customCover) itemObj.customCover = "";
    if (!itemObj.type) itemObj.type = "";
    itemObj.url = `/${pathSlice[2]}/${pathSlice[3]}/${resObj.id}`;

    // 不管原来的封面是否有效,都会更新
    itemObj.cover = '';
    // 选取封面
    let reg = /\.(png|jpg|gif|jpeg|webp)$/;
    let firstImg = '';
    // 寻找cover作为封面
    if (scanArr.length > 0)
      scanArr.forEach(file => {
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
    // itemObj.files.sort(SortLikeWin);

    // 当比较数组有新的内容时提示更新
    if (addArr.length > 0 || subArr.length > 0) {
      // 清除旧目录
      itemObj.files = [];
      // 更新目录
      itemObj.files.push(...scanArr)
      // 有更新则输出
      ioLog(initLogPath, '[+] ' + completePath.slice(1, -1) + ' -> UP', 'up');
    }

    // 更新配置文件item.config.json信息
    fs.writeFileSync(completePath + 'item.config.json', JSON.stringify(itemObj));
  }
  return resObj;
}

module.exports.scanItem = scanItem;
