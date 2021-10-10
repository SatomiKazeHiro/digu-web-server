/**
 * 封装的better-Sqlite3功能库
 */
const Database = require('better-sqlite3');
const db = new Database("SourcesDB.db");

let sqls = [`CREATE TABLE IF NOT EXISTS areas_index(area TEXT, web_name TEXT, log_template TEXT, state TEXT, init INTEGER)`,
  `CREATE TABLE IF NOT EXISTS categories_index(area TEXT, category TEXT, web_name TEXT, log_template TEXT, state TEXT, item_log_template TEXT, init INTEGER)`,
  `CREATE TABLE IF NOT EXISTS items_index(id INTEGER primary key, area TEXT, category TEXT, item TEXT, init INTEGER)`,
  `CREATE TABLE IF NOT EXISTS item_msg(id INTEGER primary key, cover TEXT, title TEXT, intro TEXT, custom_cover TEXT, type TEXT)`,
  `CREATE TABLE IF NOT EXISTS tags_index(tag TEXT, id INTEGER)`
];
sqls.forEach(sql => db.prepare(sql).run());

module.exports = class SqlTool {

  /**
   * 获取数据库中的所有“域”
   * @returns Array 域集合的数组
   */
  static getAreas() {
    const readAreas = db.prepare('select area from areas_index');
    let resArr = readAreas.all().map(i => i.area);
    return resArr;
  }

  /**
   * 获取所有的资源目录id
   * @returns 资源目录的id数组
   */
  static getItems() {
    const readItems = db.prepare('select id from items_index');
    let resArr = readItems.all().map(i => i.id);
    return resArr;
  }

  /**
   * 获取某个域下的所有资源信息
   * @param {String } area 域名
   * @returns 返回某个域的所有资源信息
   */
  static getItemsByArea(area) {
    const readItems = db.prepare('select * from items_index where area = ?');
    let resIdArr = readItems.all(area).map(i => i.id);
    return resIdArr;
  }

  /**
   * 获取某个域下的所有资源信息
   * @param {String } area 域名
   * @param {String } category 项目名
   * @returns 返回某个域和分类的所有资源信息
   */
  static getItemsByAC(area, category) {
    const readItems = db.prepare('select * from items_index where area = ? and category = ?');
    let resObjArr = readItems.all(area, category).map(i => i.id);
    return resObjArr;
  }

  /**
   * 用于获取某个资源项目的的信息
   * @param {Number} id 资源目录id
   * @returns 返回资源目录的信息对象
   */
  static getItemMsg(id) {
    const readItemMsg = db.prepare('select * from item_msg where id = ?');
    let resObj = readItemMsg.get(id);
    return resObj;
  }

  /**
   * 生成资源专属路由
   * @param {Number} id 资源目录
   */
  static getItemUrl(id, neetItem = false) {
    const readItemIndex = db.prepare('select * from items_index where id = ?')
    let readObj = readItemIndex.get(id);
    if (!neetItem)
      return `./sources/${readObj.area}/${readObj.category}/`
    else return `./sources/${readObj.area}/${readObj.category}/${readObj.item}/`
  }

  /**
   * 判断数据库是否在某个“域”
   * @param {String} area 域名
   * @returns 存在则返回true，否则返回false
   */
  static findArea(area) {
    const readArea = db.prepare('select * from areas_index where area = ?');
    let row = readArea.get(area);
    if (row) return true;
    else return false;
  }

  /**
   * 判断数据库是否在“域”的前提下存在某个“分类”
   * @param {String} area 域名
   * @param {String} category 分类名
   * @returns 存在则返回true，否则返回false
   */
  static findCategory(area, category) {
    const readCategory = db.prepare('select * from categories_index where area = ? and category = ?');
    let row = readCategory.get(area, category);
    if (row) return true;
    else return false;
  }

  /**
   * 判断数据库是否有该资源目录数据
   * @param {Number} id 资源目录id
   * @returns
   */
  static findItem(id) {
    const readItem = db.prepare('select * from items_index where id = ?');
    let row = readItem.get(id);
    if (row) return true;
    else return false;
  }

  /**
   * 通用的插入行数据方法
   * @param {String} table 所要操作的表名
   * @param {Array | Object} params 操作的参数数组
   * @returns 在数据库没有该数据的前提下插入成功，则返回true，否则返回false
   */
  static insert(table, params) {
    let sql;
    switch (table) {
      case 'areas_index':
        sql = `INSERT INTO ${table}(area, web_name, log_template, state, init) VALUES(@area, @web_name, @log_template, @state, @init)`
        break;
      case 'categories_index':
        sql = `INSERT INTO ${table}(area, category, web_name, log_template, state, item_log_template, init) VALUES(@area , @category, @web_name, @log_template, @state, @item_log_template, @init)`
        break;
      case 'items_index':
        sql = `INSERT INTO ${table}(id, area, category, item, init) VALUES(@id, @area, @category, @item, @init)`
        break;
      case 'item_msg':
        sql = `INSERT INTO ${table}(id, cover, title, intro, custom_cover, type) VALUES(@id, @cover, @title, @intro, @custom_cover, @type)`
        break;
      case 'tags_index':
        sql = `INSERT INTO ${table}(tag, id) VALUES(@tag, @id)`
        break;
      default:
        sql = '';
        break;
    }
    // 表名错误的时候返回false
    if (!sql) return false;

    const insert = db.prepare(sql);
    insert.run(params);
    return true;
  }

  /**
   * 用于重置所有表的init字段为0，检测到资源的时候设置为1，当服务器初始化完成后，还是0的数据将清除
   */
  static setInitFalse() {
    const setArea = db.prepare(`update areas_index set init = 0`)
    const setCategory = db.prepare(`update categories_index set init = 0`)
    const setItem = db.prepare(`update items_index set init = 0`)
    setArea.run();
    setCategory.run();
    setItem.run();
  }

  /**
   * 用于设置初始init，目录存在则设置1，当服务器初始化完成后，还是0的数据将清除
   * @param {String} area 域名
   * @param {String} category 分类名
   * @param {Number} id 资源目录id
   */
  static setInitTrue(area, category, id) {
    if (id) {
      const setI = db.prepare(`update items_index set init = 1 where id = ?`);
      setI.run(id);
    } else if (category && area) {
      const setC = db.prepare(`update categories_index set init = 1 where area = ? and category = ?`);
      setC.run(area, category);
    } else if (area) {
      const setA = db.prepare(`update areas_index set init = 1 where area = ?`);
      setA.run(area);
    }
  }

  /**
   * 用来清除init为0（资源目录不存在）的数据
   * @param {Function} ioLog 外部传入的作为参数的输出函数
   * @returns 执行成功返回true，执行失败返回false
   */
  static deleteInitFalseAC(ioLog) {
    // 获取init为0的所有area和category
    const getIFA = db.prepare('select * from areas_index where init = 0');
    let IFAs = getIFA.all();
    const getIFC = db.prepare('select * from categories_index where init = 0')
    let IFCs = getIFC.all();
    // 清除init为0的area和category，并输出信息
    if (IFAs.length > 0) {
      const deleteIFA = db.prepare('delete from areas_index where init = 0');
      try {
        deleteIFA.run();
        // 判断ioLog是否是一个方法，是的话则执行（一定要添加try catch块，否则不起作用）
        if (typeof (eval(ioLog)) == "function") {
          IFAs.forEach(i => {
            ioLog(`[-] /sources -> ${i.area}}`, 'decrease');
          });
        }
      } catch (e) {
        console.log(e);
        return;
      }
    }
    if (IFCs.length > 0) {
      const deleteIFC = db.prepare('delete from categories_index where init = 0');
      try {
        deleteIFC.run();
        // 判断ioLog是否是一个方法，是的话则执行（一定要添加try catch块，否则不起作用）
        if (typeof (eval(ioLog)) == "function") {
          IFCs.forEach(i => {
            ioLog(`[-] /sources/${i.area} -> ${i.category}`, 'decrease');
          });
        }
      } catch (e) {
        console.log(e);
        return;
      }
    }
    return true;
  }

  /**
   * 用来清除init为0的id与其有关联的item表、msg表、tag表
   * @param {Function} ioLog 外部传入的作为参数的输出函数
   * @returns 执行成功返回true，执行失败返回false
   */

  static deleteInitFalseI(ioLog) {
    // 获取所有init为0的资源id
    const readItems = db.prepare('select * from items_index where init = 0');
    let iArr = readItems.all();
    // 删除init为0的资源索引
    const deleteIFI = db.prepare('delete from items_index where init = 0')
    deleteIFI.run();
    // 删除init为0的资源的msg表
    const deleteIFIMsg = db.prepare('delete from item_msg where id = ?');
    // 删除init为0的资源的关联的tag表
    const deleteIFITag = db.prepare('delete from tags_index where id = ?');
    // 根据资源id删除msg表和tag表
    iArr.forEach(i => {
      try {
        deleteIFIMsg.run(i.id);
        deleteIFITag.run(i.id);
        // 判断ioLog是否是一个方法，是的话则执行（一定要添加try catch块，否则不起作用）
        if (typeof (eval(ioLog)) == "function") {
          ioLog(`[-] /sources/${i.area}/${i.category} -> ${i.item}`, 'decrease');
        }
      } catch (e) {
        console.log(e);
        return false;
      }
    })
    return true;
  }
}
