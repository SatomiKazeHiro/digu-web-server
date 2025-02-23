const Database = require("better-sqlite3");

const TABLE = {
  area: "areas_index",
  category: "categories_index",
  resource: "resources_index",
  tag: "tags_index",
  detail: "resource_detail",
  relation: "resources_relation_group",
  history: "play_history",
  collection: "user_collection_group",
};

const connectDB = (DBPath) => {
  const DB = new Database(`${DBPath}/resources.db`);
  const tableSQLs = [
    // 域
    `CREATE TABLE IF NOT EXISTS ${TABLE.area}(
      area TEXT primary key, 
      area_name TEXT, 
      page_template TEXT, 
      state TEXT, 
      exist INTEGER
    )`,
    // 类
    `CREATE TABLE IF NOT EXISTS ${TABLE.category}(
      category_path_id TEXT primary key, 
      category TEXT, 
      category_name TEXT, 
      area TEXT, 
      page_template TEXT, 
      resource_template TEXT, 
      state TEXT, 
      exist INTEGER
    )
    `,
    // 资源
    `CREATE TABLE IF NOT EXISTS ${TABLE.resource}(
      resource_path_hash_id TEXT primary key,
      resource_path TEXT,
      resource TEXT,
      area TEXT, 
      category TEXT, 
      is_scatter INTEGER,
      create_time TEXT,
      exist INTEGER
    )
    `,
    // 资源详情
    `CREATE TABLE IF NOT EXISTS ${TABLE.detail}(
      hash_id TEXT primary key, 
      path TEXT, 
      area TEXT, 
      category TEXT, 
      cover TEXT, 
      title TEXT, 
      intro TEXT, 
      custom_cover TEXT, 
      amount INTEGER, 
      size INTEGER,
      create_time TEXT,
      update_time TEXT,
      has_section INTEGER, 
      is_scatter INTEGER,
      entities_json TEXT
    )
    `,
    // 资源关联组
    `CREATE TABLE IF NOT EXISTS ${TABLE.relation}(
      group_id INTEGER primary key,
      resource_ids TEXT,
      resource_relations TEXT,
      create_time INTEGER,
      last_update_time INTEGER
    )
    `,
    // 标签
    `CREATE TABLE IF NOT EXISTS ${TABLE.tag}(
      resource_id INTEGER,
      tag TEXT
    )
    `,
    // 播放历史
    `CREATE TABLE IF NOT EXISTS ${TABLE.history}(
      id INTEGER primary key,
      play_time INTEGER,
      resources_id INTEGER,
      resources_title TEXT,
      user_id INTEGER,
      user_name TEXT,
      deleted_by_user INTEGER
    )
    `,
    // 收藏组
    `CREATE TABLE IF NOT EXISTS ${TABLE.collection}(
      group_id INTEGER primary key,
      group_name TEXT,
      create_time INTEGER,
      last_update_time INTEGER,
      user_id INTEGER,
      user_name TEXT,
      resource_ids TEXT,
      play_count INTEGER
    )
    `,
  ];
  tableSQLs.forEach((sql) => DB.exec(sql));
  return DB;
};

class ResourcesDB {
  DB = null;
  constructor({ path }) {
    this.DB = connectDB(path);
  }

  /**
   * 设置索引表的数据（数据存在时更新字段，不存在时新增数据）
   * @param {String} table 所要操作的表名
   * @param {Object} params 字段列数据
   * @returns 在数据库没有该数据的前提下插入成功，则返回true，否则返回false
   */
  setIndexTableData(table, params) {
    let sql;
    switch (table) {
      case TABLE.area:
        sql = `
          INSERT INTO ${table}(area, area_name, page_template, state, exist) 
            VALUES(@area, @area_name, @page_template, @state, @exist)
            ON CONFLICT (area) DO UPDATE SET exist = 1 
          `;
        break;
      case TABLE.category:
        sql = `
          INSERT INTO ${table}(category_path_id, category, category_name, area, page_template, resource_template, state, exist) 
            VALUES(@category_path_id, @category, @category_name, @area, @page_template, @resource_template, @state, @exist)
            ON CONFLICT (category_path_id) DO UPDATE SET exist = 1 
          `;
        break;
      case TABLE.resource:
        sql = `
          INSERT INTO ${table}(resource_path_hash_id, resource_path, resource, area, category, is_scatter, create_time, exist) 
            VALUES(@resource_path_hash_id, @resource_path, @resource, @area, @category, @is_scatter, @create_time, @exist)
            ON CONFLICT (resource_path_hash_id) DO UPDATE SET exist = 1 
          `;
        break;
    }
    // 表名错误的时候返回false
    if (!sql) return false;

    const insert = this.DB.prepare(sql);
    insert.run(params);
    return true;
  }

  /**
   * 资源未知初始化
   */
  setUnknowStatus() {
    let sqls = [
      `UPDATE ${TABLE.area} SET exist = 0`,
      `UPDATE ${TABLE.category} SET exist = 0`,
      `UPDATE ${TABLE.resource} SET exist = 0`,
    ];
    sqls.forEach((sql) => this.DB.exec(sql));
  }

  /**
   * 写入资源详情
   * @param {Object} params 字段列数据
   */
  writeResourceDetail(params = {}) {
    let keys = [
      "hash_id",
      "path",
      "area",
      "category",
      "cover",
      "title",
      "intro",
      "custom_cover",
      "amount",
      "size",
      "create_time",
      "update_time",
      "has_section",
      "is_scatter",
      "entities_json",
    ];
    keys = keys.filter((key) => params.hasOwnProperty(key));
    let sql = `INSERT INTO ${TABLE.detail}(${keys.join(", ")}) VALUES(${keys
      .map((i) => "@" + i)
      .join(", ")})`;

    let obj = this.DB.prepare(`SELECT * FROM ${TABLE.detail} WHERE hash_id = ?`).get(
      params.hash_id
    );
    if (obj) {
      if (obj.entities_json !== params.entities_json)
        sql += `ON CONFLICT (hash_id) DO UPDATE SET entities_json = @entities_json, update_time = @update_time, has_section = @has_section`;
      else sql = ``;
    }
    sql && this.DB.prepare(sql).run(params);
  }

  /**
   * 获取随机资源实例
   * @param {Number} limit 限制数
   * @param {Object} params 额外参数：simple（简要信息）、area（资源所在域）、category（资源所在分类）
   * @returns Object 其中 data 资源实例数组
   */
  getRandonItem(limit, params = {}) {
    if (!limit) return { data: [] };
    let { simple, area, category } = params;

    let location = [];
    if (area) location.push(`area = '${area}'`);
    if (category) location.push(`category = '${category}'`);
    location = location.map((i) => ` and ${i} `).join("");

    let indexSql = `SELECT resource_path_hash_id FROM ${TABLE.resource} WHERE exist = 1 ${location} ORDER BY RANDOM() LIMIT ${limit}`;
    let list = this.DB.prepare(indexSql)
      .all()
      .map((i) => `'${i.resource_path_hash_id}'`)
      .join(",");

    let content = simple
      ? "hash_id, title, intro, cover, custom_cover, R.area, R.category, R.create_time, update_time"
      : "*";

    let joinSql = `SELECT ${content} 
      FROM (SELECT * FROM ${TABLE.resource} WHERE resource_path_hash_id in (${list})) AS R
      JOIN (SELECT * FROM ${TABLE.detail} WHERE hash_id in (${list})) AS D
      ON R.resource_path_hash_id = D.hash_id`;
    let data = this.DB.prepare(joinSql).all();
    return { data };
  }

  /**
   * 获取资源分页
   * @param {Number} current 页吗
   * @param {Number} pageSize 每页条数
   * @param {Object} params 额外参数：simple（简要信息）、area（资源所在域）、category（资源所在分类）
   * @returns Object 其中 data 资源实例数组，total 相关条件下的总数
   */
  getNormalItem(current, pageSize, params = {}) {
    let { simple, area, category } = params;

    let location = [];
    if (area) location.push(`area = '${area}'`);
    if (category) location.push(`category = '${category}'`);
    location = location.join(" and ");
    location = location ? `WHERE ${location}` : ``;

    let content = simple
      ? "hash_id, title, intro, cover, custom_cover, area, category, create_time, update_time"
      : "*";

    let sql = `SELECT ${content} FROM ${TABLE.detail} ${location} LIMIT ${pageSize} OFFSET ${
      (current - 1) * pageSize
    }`;

    let { total } = this.DB.prepare(
      `SELECT count(*) as total FROM ${TABLE.detail} ${location}`
    ).get();

    let data = this.DB.prepare(sql).all();
    return { data, total };
  }

  /**
   * 获取资源详情
   * @param {String} hashId 资源id
   * @returns Object 资源详情
   */
  getItemDetail(hashId) {
    let sql = `SELECT * FROM ${TABLE.detail} WHERE hash_id = ?`;
    let itemStmt = this.DB.prepare(sql);
    return itemStmt.get(hashId);
  }

  /**
   * 获取域名称字典映射
   * @returns Object 字典映射
   */
  getAreaDict() {
    const map = {};
    let data = this.DB.prepare(`SELECT area, area_name FROM ${TABLE.area}`).all();
    data.forEach((i) => {
      map[i.area] = i.area_name;
    });
    return map;
  }

  /**
   * 获取分类名称字典映射
   * @returns Object 字典映射
   */
  getCategoryDict() {
    const map = {};
    let data = this.DB.prepare(
      `SELECT category_path_id, category_name FROM ${TABLE.category}`
    ).all();
    data.forEach((i) => {
      map[i.category_path_id] = i.category_name;
    });
    return map;
  }

  /**
   * 获取分类的信息
   * @param {String} area 域
   * @param {String} category 分类
   * @param {Array} fields 字段集
   * @returns 返回搜索出的分类对象
   */
  getCategory(area, category, fields = []) {
    let sql = `SELECT ${fields.length ? fields.join(", ") : "*"} FROM ${TABLE.category}`;
    if (area && category) sql += " WHERE area = :area  AND category = :category";
    let data = this.DB.prepare(sql).get({ area, category });
    return data;
  }

  // ------------------------------------------------------------------------------------------------

  // /**
  //  * 获取数据库中的所有“域”名
  //  * @param {Boolean} onlyArea 是否只返回域名，否则返回域名及其页面的域名
  //  * @returns 域对象的数组
  //  */
  // getAreas(onlyArea = true) {
  //   const readAreas = this.DB.prepare("select area, web_name from areas_index");
  //   if (onlyArea) {
  //     let resArr = readAreas.all().map((i) => i.area);
  //     return resArr;
  //   } else {
  //     let resArr = readAreas.all().map((i) => {
  //       return { area: i.area, web_name: i.web_name || "" };
  //     });
  //     return resArr;
  //   }
  // }

  // /**
  //  * 获取指定域下的所有类
  //  * @param {String} area 域
  //  * @param {Boolean} allCategoryInfo 是否返回分类的所有信息
  //  * @returns 类对象数组
  //  */
  // getCategories(area, allCategoryInfo = true) {
  //   const readCategories = this.DB.prepare(
  //     "select category, web_name from categories_index where area = ?"
  //   );
  //   if (allCategoryInfo) {
  //     let resArr = readCategories.all(area).map((i) => i.category);
  //     return resArr;
  //   } else {
  //     let resArr = readCategories.all(area).map((i) => {
  //       return { category: i.category, web_name: i.web_name || "" };
  //     });
  //     return resArr;
  //   }
  // }

  // /**
  //  * 获取指定分类中的所有资源目录id
  //  * @returns 资源目录的id数组
  //  */
  // getItemId(area, category) {
  //   if (area && category) {
  //     // 获取指定类下所有资源id
  //     const readItems = this.DB.prepare(
  //       "select * from items_index where area = ? and category = ?"
  //     );
  //     let readIds = readItems.all(area, category).map((i) => i.id);
  //     return readIds;
  //   } else if (area && !category) {
  //     // 获取指定域下的所有资源id
  //     const readItems = this.DB.prepare("select * from items_index where area = ?");
  //     let resIdArr = readItems.all(area).map((i) => i.id);
  //     return resIdArr;
  //   } else if (!area && !category) {
  //     // 获取所有的资源目录id
  //     const readItems = this.DB.prepare("select id from items_index");
  //     let resArr = readItems.all().map((i) => i.id);
  //     return resArr;
  //   }
  // }

  // /**
  //  * 获取指定资源 id 的信息
  //  * @param {Number} id 资源项目id
  //  * @returns 返回对应的资源项目的信息对象
  //  */
  // getItemMsg(id) {
  //   const readItemMsg = this.DB.prepare(
  //     "select * from (select distinct * from item_msg left join items_index on item_msg.id = items_index.id) where id = ?"
  //   );
  //   let itemObj = readItemMsg.get(id);
  //   delete itemObj["id:1"];
  //   let areaObj = this.getAreaMsg(itemObj.area) || {};
  //   let categoryObj = this.getCategoryMsg(itemObj.area, itemObj.category) || {};
  //   itemObj.link_url = `/${itemObj.area}/${itemObj.category}/${itemObj.id}`;
  //   itemObj.sources_url = `/sources/${itemObj.area}/${itemObj.category}/${itemObj.item}/`;
  //   itemObj.area_web_name = areaObj.web_name;
  //   itemObj.category_web_name = categoryObj.web_name;
  //   return itemObj;
  // }

  // /**
  //  * 获取指定域的信息
  //  * @param {String} area 域名
  //  * @returns 域对象的信息
  //  */
  // getAreaMsg(area) {
  //   const readAreaMsg = this.DB.prepare("select * from areas_index where area = ?");
  //   let areaObj = readAreaMsg.get(area);
  //   return areaObj;
  // }

  // /**
  //  * 获取指定类的信息
  //  * @param {String} area 域名
  //  * @param {String} category 类名
  //  * @returns 类对象的信息
  //  */
  // getCategoryMsg(area, category) {
  //   const readCategoryMsg = this.DB.prepare(
  //     "select * from categories_index where area = ? and category = ?"
  //   );
  //   let categoryObj = readCategoryMsg.get(area, category);
  //   return categoryObj;
  // }

  // /**
  //  * 检测指定域是否存在
  //  * @param {String} area 域名
  //  * @returns 存在返回true，否则返回false
  //  */
  // findArea(area) {
  //   const readArea = this.DB.prepare("select * from areas_index where area = ?");
  //   let row = readArea.get(area);
  //   if (row) return true;
  //   else return false;
  // }

  // /**
  //  * 检测域中是否存在指定类
  //  * @param {String} area 域名
  //  * @param {String} category 类名
  //  * @returns 存在则返回true，否则返回false
  //  */
  // findCategory(area, category) {
  //   const readCategory = this.DB.prepare(
  //     "select * from categories_index where area = ? and category = ?"
  //   );
  //   let row = readCategory.get(area, category);
  //   if (row) return true;
  //   else return false;
  // }

  // /**
  //  * 检测是否存在指定资源项目
  //  * @param {Number} id 资源目录id
  //  * @returns
  //  */
  // findItem(id) {
  //   const readItem = this.DB.prepare("select * from items_index where id = ?");
  //   let row = readItem.get(id);
  //   if (row) return true;
  //   else return false;
  // }

  // /**
  //  * 通用的跟新数据库的方法
  //  * @param {String} table 表名
  //  * @param {Array | Object} params 参数对象
  //  * @returns 更新成功返回 true，否则返回 false
  //  */
  // update(table, params) {
  //   let sql;
  //   switch (table) {
  //     case "areas_index":
  //       sql = `UPDATE ${table} SET web_name = @web_name, log_template = @log_template, state = @state, init = @init WHERE area = @area`;
  //       break;
  //     case "categories_index":
  //       sql = `UPDATE ${table} SET web_name = @web_name, log_template = @log_template, state = @state, item_log_template = @item_log_template, init = @init WHERE area = @area AND category = @category`;
  //       break;
  //     case "items_index":
  //       sql = `UPDATE ${table} SET area = @area, category = @category, item = @item, init = @init WHERE id = @id`;
  //       break;
  //     case "item_msg":
  //       sql = `UPDATE ${table} SET cover = @cover, title = @title, intro = @intro, custom_cover = @custom_cover, type = @type, amount = @amount, size = @size WHERE id = @id`;
  //       break;
  //     case "tags_index":
  //       // sql = `UPDATE ${table} SET tag = @tag, id = @id`
  //       break;
  //     default:
  //       sql = "";
  //       break;
  //   }
  //   // 表名错误的时候返回false
  //   if (!sql) return false;

  //   const update = this.DB.prepare(sql);
  //   update.run(params);
  //   return true;
  // }

  // /**
  //  * 更新某个字段的值
  //  * @param {String} table 表名
  //  * @param {Object} seasoning 字段与值
  //  * @param {String} filter 过滤条件
  //  */
  // updateKey(table, seasoning, filter) {
  //   if (table && seasoning) {
  //     let str = [];
  //     let keys = Object.keys(seasoning);
  //     let values = Object.values(seasoning);
  //     for (let i = 0; i < keys.length; i++) {
  //       str.push(`${keys[i]} = '${values[i]}'`);
  //     }
  //     str.join(",");
  //     let sql = `UPDATE ${table} SET ${str} ${filter ? "where " + filter : ""}`;
  //     this.DB.prepare(sql).run();
  //   }
  // }

  // /**
  //  * 用于重置所有表的 init 字段为 0，检测到资源的时候设置为 1，当服务器初始化完成后，还是 0 的数据将清除
  //  */
  // setInitFalse() {
  //   this.DB.prepare(`update areas_index set init = 0`).run();
  //   this.DB.prepare(`update categories_index set init = 0`).run();
  //   this.DB.prepare(`update items_index set init = 0`).run();
  // }

  // /**
  //  * 用于设置初始 init，目录存在则设置1，当服务器初始化完成后，还是0的数据将清除
  //  * @param {String} area 域名
  //  * @param {String} category 类名
  //  * @param {Number} id 资源目录id
  //  */
  // setInitTrue(area, category, id) {
  //   if (id) {
  //     const setI = this.DB.prepare(`update items_index set init = 1 where id = ?`);
  //     setI.run(id);
  //   } else if (category && area) {
  //     const setC = this.DB.prepare(
  //       `update categories_index set init = 1 where area = ? and category = ?`
  //     );
  //     setC.run(area, category);
  //   } else if (area) {
  //     const setA = this.DB.prepare(`update areas_index set init = 1 where area = ?`);
  //     setA.run(area);
  //   }
  // }

  // /**
  //  * 用来清除init为0（资源目录不存在）的数据
  //  * @param {Function} ioLog 外部传入的作为参数的输出函数
  //  * @returns 执行成功返回true，执行失败返回false
  //  */
  // deleteInitFalseAC(ioLog) {
  //   // 获取init为0的所有area和category
  //   const getIFA = this.DB.prepare("select * from areas_index where init = 0");
  //   let IFAs = getIFA.all();
  //   const getIFC = this.DB.prepare("select * from categories_index where init = 0");
  //   let IFCs = getIFC.all();
  //   // 清除init为0的area和category，并输出信息
  //   if (IFAs.length > 0) {
  //     const deleteIFA = this.DB.prepare("delete from areas_index where init = 0");
  //     try {
  //       deleteIFA.run();
  //       // 判断ioLog是否是一个方法，是的话则执行（一定要添加try catch块，否则不起作用）
  //       if (typeof eval(ioLog) == "function") {
  //         IFAs.forEach((i) => {
  //           ioLog(`[-] /sources -> ${i.area}}`, "decrease");
  //         });
  //       }
  //     } catch (e) {
  //       console.log(e);
  //       return false;
  //     }
  //   }
  //   if (IFCs.length > 0) {
  //     const deleteIFC = this.DB.prepare("delete from categories_index where init = 0");
  //     try {
  //       deleteIFC.run();
  //       // 判断ioLog是否是一个方法，是的话则执行（一定要添加try catch块，否则不起作用）
  //       if (typeof eval(ioLog) == "function") {
  //         IFCs.forEach((i) => {
  //           ioLog(`[-] /sources/${i.area} -> ${i.category}`, "decrease");
  //         });
  //       }
  //     } catch (e) {
  //       console.log(e);
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  // /**
  //  * 用来清除init为0的id与其有关联的item表、msg表、tag表
  //  * @param {Function} ioLog 外部传入的作为参数的输出函数
  //  * @returns 执行成功返回true，执行失败返回false
  //  */
  // deleteInitFalseI(ioLog) {
  //   // 获取所有init为0的资源id
  //   const readItems = this.DB.prepare("select * from items_index where init = 0");
  //   let iArr = readItems.all();
  //   // 删除init为0的资源索引
  //   const deleteIFI = this.DB.prepare("delete from items_index where init = 0");
  //   deleteIFI.run();
  //   // 删除init为0的资源的msg表
  //   const deleteIFIMsg = this.DB.prepare("delete from item_msg where id = ?");
  //   // 删除init为0的资源的关联的tag表
  //   const deleteIFITag = this.DB.prepare("delete from tags_index where id = ?");
  //   // 根据资源id删除msg表和tag表
  //   iArr.forEach((i) => {
  //     try {
  //       deleteIFIMsg.run(i.id);
  //       deleteIFITag.run(i.id);
  //       // 判断ioLog是否是一个方法，是的话则执行（一定要添加try catch块，否则不起作用）
  //       if (typeof eval(ioLog) == "function") {
  //         ioLog(`[-] /sources/${i.area}/${i.category} -> ${i.item}`, "decrease");
  //       }
  //     } catch (e) {
  //       console.log(e);
  //       return false;
  //     }
  //   });
  //   return true;
  // }

  // /**
  //  * 获取资源项目要展示的模板类型
  //  * @param {String} area 域名
  //  * @param {String} category 类名
  //  * @returns 模板字符串
  //  */
  // getItemShowTempalte(area, category) {
  //   const readCategory = this.DB.prepare(
  //     "select * from categories_index where area = ? and category = ?"
  //   );
  //   let readObj = readCategory.get(area, category);
  //   if (readObj) return readObj.item_log_template;
  //   else return "";
  // }
}

module.exports = ResourcesDB;
