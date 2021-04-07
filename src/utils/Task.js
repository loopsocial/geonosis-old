import api from "@/api/apiPath";
// 任务，轮询合成、转码任务
export class Task {
  constructor() {
    this.taskList = [new TaskItem({ jobId: 1 })];
    this.delay = 1000;
  }
  addTask(task) {
    this.taskList.push(task);
  }
  delTask(task) {
    const index = this.taskList.find(t => t.jobId === task.jobId);
    if (index > -1) {
      this.taskList.splice(index, 1);
    } else {
      console.warn("没有这个任务", task);
    }
  }
}
/**
 * 任务管理(模板)
 * @param {string} name 任务名称
 * @param {string} type 任务类型 upload/transcode/compile/uploadNoReplace/compileNoReplace, 上传/转码/合成/上传不可替换素材/合成不可替换的素材
 * @param {number} jobId 任务ID
 * @param {function} callback 任务完成后的回调, 参数为Task实例
 */
export class TaskItem {
  constructor(options) {
    this.type = options.type;
    this.status = "running"; // running/finish/failed
    this.jobURL = options.jobURL;
    this.onError = options.onError || (() => { });
    this.onSuccess = options.onSuccess || (() => { });
    this.progress = 0;
    this.timer = null;
    this.result = null;
    // this.source = axios.CancelToken.source();
    if (this.jobURL) this.getProgress();
  }
  getProgress() {
    if (!this.jobURL) {
      console.error("缺少任务token", this);
      return;
    }
    axios
      .get(this.jobURL)
      .then(res => {
        console.log(res);
        if (res.progress === null || res.progress === undefined) return;
        const { progress, video_id } = res;
        this.progress = progress;
        console.log("获取进度", progress);
        if (video_id) {
          console.log("任务完成");
          this.result = video_id;
          this.status = "success";
          this.onSuccess(this);
        } else {
          this.timer = setTimeout(() => {
            this.getProgress();
          }, 1000);
        }
      })
      .catch(err => {
        console.log("任务查询失败", err);
        this.cancel(err);
      });
  }
  // 取消任务
  cancel(err) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.onError(err);
  }
}
