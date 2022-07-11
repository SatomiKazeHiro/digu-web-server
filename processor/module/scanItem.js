/**
 * 扫描文件夹,输出并更新信息
 */
const fs = require("fs");
const process = require("process");

const { sortAsWin, getSizeAndAmount } = process.__tools;

/**
 * 扫描包含内容项目的方法，不同于只有扫描文件夹的方法
 * @param {String} parentPath 父目录路径
 * @param {String} folderName 文件夹名称
 * @param {Boolean} isSerialize 项目是否是连载类型
 * @returns {Object} 对象的id和资源路径
 */
let scanItem = (parentPath, folderName, isSerialize = false) => {
  // 完整目录路径
  let completePath = parentPath + folderName + "/";

  // 扫描该目录文件
  let scanArr = fs.readdirSync(completePath);
  // 对扫描得到的目录文件使用仿windows排序
  scanArr.sort(sortAsWin);

  // 文件状态
  let stat;
  // 文件对象
  let itemObj;

  // 当item.config.json文件不存在时，说明是新加入的项目
  if (!fs.existsSync(completePath + "item.config.json")) {
    // 存储对象,其中的up是值资源文件的增减
    itemObj = {
      id: "",
      cover: "",
      title: "",
      intro: "",
      tags: [],
      type: "",
      custom_cover: "",
      up: true,
      files: ["item.config.json"],
    };
    // 使用时间戳生成唯一ID
    itemObj.id = Date.now();
    // 选取封面
    let reg = /\.(png|jpg|gif|jpeg|webp)$/;
    let firstImg = "";
    // 遍历files寻找cover作为封面
    if (scanArr.length > 0)
      scanArr.forEach((file) => {
        // 根据路径获取文件/目录状态信息
        stat = fs.lstatSync(completePath + file);
        // 当有文件夹的时候，设置类型是连载版
        if (stat.isDirectory()) itemObj.type = "serial";

        if (reg.test(file)) {
          // 在遍历之时先存储第一张图片作为封面备用
          if (!firstImg) firstImg = file;
          // 遍历寻找第一张cover作为封面
          if (file.toLowerCase() == "cover")
            if (!itemObj.cover) itemObj.cover = file;
        }
      });
    // 如果没有cover作为封面，则默认第一张图片为封面，若没有图片，firstImg为空
    if (!itemObj.cover) itemObj.cover = firstImg;
    if (!itemObj.type) itemObj.type = "normal";
    itemObj.title = folderName;
    itemObj.intro = "";
    itemObj.tags = [];
    itemObj.custom_cover = "";
    let { amount, size } = getSizeAndAmount(completePath);
    itemObj.amount = amount;
    itemObj.size = size;

    // 加载目录中的文件信息
    itemObj.files.push(...scanArr);
    // 写入文件至当前目录中
    fs.writeFileSync(
      completePath + "item.config.json",
      JSON.stringify(itemObj)
    );
  } else {
    // 读取目录下的item.config.json
    itemObj = JSON.parse(fs.readFileSync(completePath + "item.config.json"));
    itemObj.up = false;

    // 检测id是否不存在或者为空
    if (!("id" in itemObj) || itemObj.id == "") {
      itemObj.id = Date.now();
      itemObj.up = true;
    }
    // 检测title是否不存在或者不等同于现在的文件夹名
    if (!("title" in itemObj) || itemObj.title !== folderName) {
      itemObj.title = folderName;
      itemObj.up = true;
    }
    // 检测intro是否不存在
    if (!("intro" in itemObj)) {
      itemObj.intro = "";
      itemObj.up = true;
    }
    // 检测tag是否不存在
    if (!("tags" in itemObj)) {
      itemObj.tags = [];
      itemObj.up = true;
    }
    // 检测custom_cover是否不存在
    if (!("cover" in itemObj)) {
      itemObj.cover = "";
      itemObj.up = true;
    }
    // 检测custom_cover是否不存在
    if (!("custom_cover" in itemObj)) {
      itemObj.custom_cover = "";
      itemObj.up = true;
    }
    // 检测type是否不存在
    if (!("type" in itemObj)) {
      // 默认是单体
      itemObj.type = "normal";
      itemObj.up = true;
    }
    // 获取文件数量和大小
    let { amount, size } = getSizeAndAmount(completePath);
    // 检测amount和size分别是否不存在或者和上次不相同
    if (!("amount" in itemObj) || itemObj.amount !== amount) {
      itemObj.amount = amount;
      itemObj.up = true;
    }
    // 每次获取size都有1个字节的浮动，超过1个字节视为改动
    if (!("size" in itemObj) || Math.abs(itemObj.size - size) > 2) {
      itemObj.size = size;
      itemObj.up = true;
    }

    // 不管原来的封面是否有效,都会更新
    let oldCover = itemObj.cover;
    itemObj.cover = "";
    // 选取封面
    let reg = /\.(png|jpg|gif|jpeg|webp)$/;
    let firstImg = "";
    // 寻找cover作为封面
    if (scanArr.length > 0)
      scanArr.forEach((file) => {
        // 根据路径获取文件/目录状态信息
        stat = fs.lstatSync(completePath + file);
        // 当有文件夹的时候，判断类型是连载版
        if (stat.isDirectory()) itemObj.type = "serial";

        if (reg.test(file)) {
          // 在遍历之时先存储第一张图片作为封面备用
          if (!firstImg) firstImg = file;
          // 遍历寻找第一张cover作为封面
          if (file.toLowerCase() == "cover") {
            if (!itemObj.cover) itemObj.cover = file;
          }
        }
      });
    // 如果没有cover作为封面,则默认第一张图片为封面,若没有图片,firstImg为空
    if (!itemObj.cover) itemObj.cover = firstImg;
    // 和上一次的封面对比
    if (itemObj.cover !== oldCover) itemObj.up = true;

    // 比较数组存储新添加内容
    let addArr = scanArr.filter((item) => {
      return !itemObj.files.includes(item);
    });

    // 比较数组存储被移除内容
    let subArr = itemObj.files.filter((item) => {
      return !scanArr.includes(item);
    });

    // 当有改变的时候，取改变的，并做更新标记
    if (addArr.length > 0 || subArr.length > 0) {
      // 清除旧目录
      itemObj.files = [];
      // 更新目录
      itemObj.files.push(...scanArr);
      // 有更新则提示更新
      itemObj.up = true;
    }

    // 按windows排序
    itemObj.files.sort(sortAsWin);

    // 更新配置文件item.config.json信息
    fs.writeFileSync(
      completePath + "item.config.json",
      JSON.stringify(itemObj)
    );
  }
  return itemObj;
};

module.exports = scanItem;
