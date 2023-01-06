/**
 * 扫描文件夹,输出并更新信息
 */
const fs = require("fs");
const process = require("process");
const path = require("path");

const { getSizeAndAmount, sortObjNameAsWin } = process.__tools;

/**
 * 扫描包含内容项目的方法，不同于只有扫描文件夹的方法
 * @param {String} parentPath 父目录路径
 * @param {String} folderName 文件夹名称
 * @returns {Object} 对象的id和资源路径
 */
let scanItem = (parentPath, folderName) => {
  // 完整目录路径
  let prefixPath = parentPath + folderName + "/";
  // 网络访问的路径
  let sourcePath = (parentPath + folderName).substring(1);

  // 扫描该目录文件
  let scanArr = fs.readdirSync(prefixPath);

  // 文件状态
  let stat;
  // 文件对象
  let itemObj;

  // 当item.config.json文件不存在时，说明是新加入的项目
  if (!fs.existsSync(prefixPath + "item.config.json")) {
    // 存储对象,其中的up是值资源文件的增减
    itemObj = {
      id: "",
      title: "",
      intro: "",
      tags: [],
      type: "",
      amount: "",
      size: "",
      cover: "",
      custom_cover: "",
      files: [],
      files_detail: [],
      up: true,
    };
    // 使用时间戳生成唯一ID
    itemObj.id = Date.now();
    // 选取封面
    let reg = /\.(png|jpg|gif|jpeg|webp)$/;
    let firstImg = "";
    // 遍历files寻找cover作为封面
    if (scanArr.length > 0) {
      scanArr.sort(sortObjNameAsWin);
      scanArr.forEach((file) => {
        // 根据路径获取文件/目录状态信息
        stat = fs.lstatSync(prefixPath + file);
        // 当有文件夹的时候，设置类型是连载版
        if (itemObj.type != "serial" && stat.isDirectory()) itemObj.type = "serial";

        // 目录文件详细信息
        itemObj.files_detail.push({
          target: file,
          name: stat.isDirectory() ? file : path.basename(file, path.extname(file)),
          type: stat.isDirectory() ? "directory" : "file",
          ext: stat.isDirectory() ? null : path.extname(file),
          parent_path: sourcePath,
          path: `${sourcePath}/${file}`,
        });

        if (reg.test(file)) {
          // 在遍历之时先存储第一张图片作为封面备用
          if (!firstImg) firstImg = file;
          // 遍历寻找第一张cover作为封面
          if (file.toLowerCase() == "cover") if (!itemObj.cover) itemObj.cover = file;
        }
      });
    }
    // 如果没有cover作为封面，则默认第一张图片为封面，若没有图片，firstImg为空
    if (!itemObj.cover) itemObj.cover = firstImg;
    if (!itemObj.type) itemObj.type = "normal";
    itemObj.title = folderName;
    itemObj.intro = "";
    itemObj.tags = [];
    itemObj.custom_cover = "";
    let { amount, size } = getSizeAndAmount(prefixPath);
    itemObj.amount = amount;
    itemObj.size = size;
    itemObj.files.push(...scanArr);

    // 写入文件至当前目录中
    fs.writeFileSync(prefixPath + "item.config.json", JSON.stringify(itemObj));
  } else {
    // fs.writeFileSync(prefixPath + "item.config.json", "{}");
    let jsonStr = fs.readFileSync(prefixPath + "item.config.json").toString();
    // 读取目录下的item.config.json
    itemObj = jsonStr ? JSON.parse(jsonStr) : {};
    itemObj.up = false;

    // 检测id是否不存在或者为空
    if (!itemObj.id) {
      // console.log(1);
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
    if (!("tags" in itemObj) || !Array.isArray(itemObj.tags)) {
      itemObj.tags = [];
      itemObj.up = true;
    }
    // 检测type是否不存在
    if (!itemObj.type) {
      // 默认是单体
      itemObj.type = "normal";
      itemObj.up = true;
    }
    // 获取文件数量和大小
    let { amount, size } = getSizeAndAmount(prefixPath);
    // 检测amount和size分别是否不存在或者和上次不相同
    if (!itemObj.amount || itemObj.amount !== amount) {
      console.log(1);
      itemObj.amount = amount;
      itemObj.up = true;
    }
    // 每次获取size都有1个字节的浮动，超过1个字节视为改动
    if (!itemObj.size || Math.abs(itemObj.size - size) > 2) {
      itemObj.size = size;
      itemObj.up = true;
    }
    // 检测 files_detail 是否不存在
    let isUpFilesDetails = false;
    if (!("files_detail" in itemObj) || !Array.isArray(itemObj.files_detail)) {
      itemObj.files_detail = [];
      isUpFilesDetails = true;
    }
    let files = itemObj.files_detail.map((f) => f.target);

    // 比较数组存储新添加内容
    let addArr = scanArr.filter((item) => {
      return !files.includes(item);
    });
    // 比较数组存储被移除内容
    let subArr = files.filter((item) => {
      return !scanArr.includes(item);
    });

    // 当有改变的时候，取改变的，并做更新标记
    if (addArr.length > 0 || subArr.length > 0 || isUpFilesDetails) {
      // 移除没有的
      itemObj.files_detail = itemObj.files_detail.filter((f) => !subArr.includes(f.target));
      // 增加新增的
      addArr.forEach((file) => {
        stat = fs.lstatSync(prefixPath + file);
        itemObj.files_detail.push({
          target: file,
          name: stat.isDirectory() ? file : path.basename(file),
          type: stat.isDirectory() ? "directory" : "file",
          ext: stat.isDirectory() ? null : path.extname(file),
          parent_path: sourcePath,
          path: `${sourcePath}/${file}`,
        });
      });
      scanArr.sort(sortObjNameAsWin);
      files = itemObj.files_detail.map((f) => f.target);

      // 更新封面
      let reg = /\.(png|jpg|gif|jpeg|webp)$/;
      let firstImg = "";
      // 寻找cover作为封面
      files.forEach((file) => {
        // 根据路径获取文件/目录状态信息
        stat = fs.lstatSync(prefixPath + file);
        // 当有文件夹的时候，判断类型是连载版
        if (itemObj.type !== "serial" && stat.isDirectory()) itemObj.type = "serial";

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
      itemObj.custom_cover = itemObj.custom_cover || "";
      itemObj.files = files;

      itemObj.up = true;
    }

    // 更新配置文件item.config.json信息
    fs.writeFileSync(prefixPath + "item.config.json", JSON.stringify(itemObj));
  }
  return itemObj;
};

module.exports = scanItem;
