const { parentPort } = require("worker_threads");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

// 由于是以 WebWorker 启动的，没有上下文环境，只能手动去引用
const ResourcesDB = require("../db/ResourcesDB");
const cyr53 = require("../../tools/cyr53");
const sortAsWin = require("../../tools/sort-as-win");

let DB = null;

const acceptExt = {
  image: [
    ".apng",
    ".avif",
    ".gif",
    ".jpg",
    ".jpeg",
    ".png",
    ".svg",
    ".webp",
    ".bmp",
    ".ico",
    ".cur",
    ".tif",
    ".tiff",
  ],
  video: [".mp4", ".webp", ".ogg"],
  audio: [".mp3", ".aac", ".ogg"],
  ebook: [".txt", ".pdf", ".epub"],
};
const acceptAllExt = Object.values(acceptExt).flat(1);

const func = {
  // 资源索引，表 resources_index
  setIndex: function (params, isScatter = null) {
    let { area, category, resource } = params;
    let resource_path = `${area}>${category}>${resource}`;
    let tableData = {
      resource_path_hash_id: cyr53(resource_path).toString(32),
      resource_path,
      resource,
      area,
      category,
      is_scatter: +isScatter,
      create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      exist: 1,
    };
    DB.setIndexTableData("resources_index", tableData);
    return tableData;
  },
  // 资源详情，表 resource_detail
  writeDeatil: function (entity, writeData, params) {
    let resourceData = {
      ...writeData,
      custom_cover: null,
      intro: null,
      // amount: 0,
      // size: 0,
      has_section: entity?.section?.length ? 1 : 0,
      create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      update_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      entities_json: JSON.stringify(entity),
    };
    DB.writeResourceDetail(resourceData);
    return resourceData;
  },
};

/**
 * 处理类的内容
 * @param {Object} params 参数{ resourcesPath, area, category, isLastCategory }
 */
const handleCategory = function (params) {
  const { resourcesPath, area, category, isLastCategory } = params;
  const categoryRoute = path.join(resourcesPath, area, category);

  // 类下允许有非离散（fusion）和离散（scatter）两种类型，
  const resources = fs.readdirSync(categoryRoute);
  const dirs = [],
    entityMap = {},
    amountMap = {},
    sizeMap = {},
    coverMap = {};

  // 区分虚实
  for (let i = 0; i < resources.length; i++) {
    const R = resources[i];
    let route = path.join(categoryRoute, R);
    let stat = fs.statSync(route);
    if (stat.isDirectory()) dirs.push(R);
    else {
      let { name, ext } = path.parse(R);
      if (!acceptAllExt.includes(ext)) continue;

      // ①离散（无文件夹、有文件夹但又有同文件夹命名的文件同级目录）（正片1）
      if (name in entityMap) {
        entityMap[name].scatter.push(R);
        amountMap[name] += 1;
        sizeMap[name] += stat.size;
      } else {
        entityMap[name] = { scatter: [R] };
        amountMap[name] = 1;
        sizeMap[name] = stat.size;
      }

      // 封面来自 scatter
      if (acceptExt.image.includes(ext)) {
        if (!coverMap[name]) {
          coverMap[name] = route;
        } else if (coverMap[name].toLowerCase() !== "cover" && name.toLowerCase() == "cover") {
          coverMap[name] = route; // cover 命名的优先
        }
      }
    }
  }

  // 整合&遍历
  for (let i = 0; i < dirs.length; i++) {
    const R = dirs[i];
    const route = path.join(categoryRoute, R);
    let content = fs.readdirSync(route).sort(sortAsWin);

    // 排序互后有文件夹在图片文件前面的情况，就存在一个封面取 section 优先的问题，这是按设想来说是不允许的
    let sectionCover = null;

    for (let j = 0; j < content.length; j++) {
      const item = content[j];
      let itemRoute = path.join(route, item);
      let stat = fs.statSync(itemRoute);

      let { name, ext } = path.parse(item);
      if (!(stat.isDirectory() || acceptAllExt.includes(ext))) continue;

      // ③是文件则归为聚合（非离散）（正片2）
      // ②是文件夹存入章节（非离散）（章节（OVA、剧场版、第一季、第二季...））
      let to = null;
      if (stat.isDirectory()) {
        to = "section";
      } else {
        to = "fusion";
        if (amountMap[R]) amountMap[R] += 1;
        else amountMap[R] = 1;
        if (sizeMap[R]) sizeMap[R] += stat.size;
        else sizeMap[R] = stat.size;

        // 封面来自 fusion
        if (acceptExt.image.includes(ext)) {
          if (!coverMap[R]) {
            coverMap[R] = itemRoute;
          } else if (coverMap[R].toLowerCase() !== "cover" && name.toLowerCase() == "cover") {
            coverMap[R] = itemRoute; // cover 命名的优先
          }
        }
      }
      if (entityMap.hasOwnProperty(R)) {
        if (entityMap[R][to]) entityMap[R][to].push(item);
        else entityMap[R][to] = [item];
      } else {
        entityMap[R] = { [to]: [item] };
      }

      // 章节内容
      if (to == "section") {
        entityMap[R][to].pop(); // 移除最后一个，细化后重新放入
        let sectionFiles = [];
        let files = fs.readdirSync(itemRoute);

        files.forEach((file) => {
          let fileRoute = path.join(itemRoute, file);
          let fileStat = fs.statSync(fileRoute);

          let { ext } = path.parse(file);
          if (!fileStat.isDirectory() && acceptAllExt.includes(ext)) {
            sectionFiles.push(file);

            if (amountMap[R]) amountMap[R] += 1;
            else amountMap[R] = 1;

            if (sizeMap[R]) sizeMap[R] += fileStat.size;
            else sizeMap[R] = fileStat.size;

            // 封面来自 section
            if (acceptExt.image.includes(ext) && !sectionCover) sectionCover = fileRoute;
          }
        });
        entityMap[R][to].push({ [item]: sectionFiles }); // 已细化，重新放入
      }
      coverMap[R] = coverMap[R] || sectionCover; // 当 fusion 为空时取 section 的
    }
  }

  // 写入
  for (const name in entityMap) {
    const entity = entityMap[name];
    let isScatter = !!entity.scatter?.length;

    let {
      resource_path_hash_id: hash_id,
      resource_path,
      area,
      category,
    } = func.setIndex({ ...params, resource: name }, isScatter);

    // console.log({
    //   resourcesPath: path.resolve(params.resourcesPath),
    //   cover: coverMap[name],
    //   relative: coverMap[name] && path.relative(path.resolve(params.resourcesPath), coverMap[name]),
    // });
    let cover = coverMap[name] && path.relative(path.resolve(params.resourcesPath), coverMap[name]);
    func.writeDeatil(
      entity,
      {
        hash_id,
        path: resource_path,
        area,
        category,
        title: name,
        cover,
        is_scatter: +isScatter,
        amount: amountMap[name],
        size: sizeMap[name],
      },
      params
    );
  }
  // fs.writeFileSync(`./${area}.txt`, JSON.stringify(logs, null, 2));

  // 再无资源且是最后的类时结束线程
  isLastCategory && parentPort.postMessage(null);
};

/**
 * 处理域的内容
 * @param {Object} params 参数{ resourcesPath, area }
 */
const handleArea = function (params) {
  const { resourcesPath, area } = params;
  const areaRoute = path.join(resourcesPath, area);

  // 域下面的类必须以目录的形式
  let categories = fs
    .readdirSync(areaRoute)
    .filter((c) => fs.statSync(path.join(areaRoute, c)).isDirectory());

  if (categories.length) {
    for (let i = 0; i < categories.length; i++) {
      let category = categories[i];
      DB.setIndexTableData("categories_index", {
        category_path_id: `${area}->${category}`,
        category,
        category_name: category,
        area,
        page_template: "normal",
        resource_template: undefined,
        state: "show",
        exist: 1,
      });
      handleCategory({ ...params, category, isLastCategory: i == categories.length - 1 });
    }
  } else {
    // 无类时结束线程
    parentPort.postMessage(false);
  }
};

parentPort.on("message", function (params) {
  try {
    const { area, databaseRoute } = params;
    DB = new ResourcesDB({ path: databaseRoute });
    if (DB) {
      DB.setIndexTableData("areas_index", {
        area,
        area_name: area,
        page_template: "normal",
        state: "show", // 默认显示
        exist: 1,
      });
      handleArea(params);
    } else {
      parentPort.postMessage(undefined);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
});
