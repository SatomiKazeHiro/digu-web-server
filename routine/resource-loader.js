const path = require("path");
const fs = require("fs");
const { Worker } = require("worker_threads");

const ResourceLoader = function ({ processKey }) {
  return new Promise((resolve, reject) => {
    const EXT = process[processKey];

    // 初始化资源未知状态
    EXT._DB_TOOLS.resourcesDB.setUnknowStatus();

    // 资源相关路径
    const resourcesPath = path.join(EXT.RESOURCES_PATH);
    const list = fs.readdirSync(resourcesPath);

    // 线程参数
    const workerPath = path.join(process.cwd(), "/routine/worker");
    const threadConfig = {
      max: 2,
      queue: [],
      poll: null,
      clean: function () {
        this.poll && clearInterval(this.poll);
      },
      listen: function (cb) {
        this.clean();
        if (cb instanceof Function) {
          this.poll = setInterval(() => {
            cb();
          }, 100);
        }
      },
    };

    const loader = function (index) {
      if (threadConfig.queue.length < threadConfig.max) {
        // 在最大线程内时
        // 创建线程加载该路径的资源
        const scanThread = new Worker(path.join(workerPath, "/scan-resource.js"));
        scanThread.on("message", (err) => {
          // 停止执行
          scanThread.terminate();
          // 线程完成之后移除任务
          let index = threadConfig.queue.findIndex((i) => i == scanThread);
          threadConfig.queue.splice(index, 1);
        });
        scanThread.on("error", (err) => {
          // 清除定时器避免内存泄漏
          threadConfig.clean();
          // 销毁所有线程
          threadConfig.queue.forEach((thread) => thread.terminate());
          return reject(err);
        });
        scanThread.postMessage({
          resourcesPath,
          area: list[index],
          databaseRoute: process[processKey].DATABASE_PATH,
        });

        // 存入队列
        threadConfig.queue.push(scanThread);

        // 遍历下一个同级路径
        if (++index < list.length) loader(index);
        else {
          // 当前任务队列是否都完成
          threadConfig.listen(() => {
            if (!threadConfig.queue.length) {
              threadConfig.clean(); // 清除定时器，避免内存泄漏
              return resolve();
            }
          });
        }
      } else {
        // 超出最大线程时监听队列的空闲状态
        threadConfig.listen(() => {
          if (threadConfig.queue.length < threadConfig.max) {
            loader(index);
          }
        });
      }
    };
    loader(0);
  });
};

module.exports = ResourceLoader;
