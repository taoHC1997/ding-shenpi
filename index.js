var axios = require("axios");

// 钉钉配置
const dd_config = {
  // 应用 AppKey
  app_key: "",
  // 应用 AppSecret
  app_secret: "",
};

// 表单列表
const from_list_by_name = [];

// 初始时间（2020-01-01）
const date_start = new Date("2020-01-01");
// 现在时间
const date_now = new Date();
// 截止时间（使用当月最后一天）
const date_end = new Date(date_now.getFullYear(), date_now.getMonth() + 1, 0);
// 时间列表
const time_list = get_times();

// url 配置，参考： https://developers.dingtalk.com/document/app/server-api-overview
const url_config = {
  url_token: "https://oapi.dingtalk.com/gettoken",
  url_get_process_code: "https://oapi.dingtalk.com/topapi/process/get_by_name",
  url_get_list: "https://oapi.dingtalk.com/topapi/processinstance/listids",
};

// 总数初始化
let total = 0;

// 主方法
async function main() {
  const TOKEN = await get_token();
  await is_ip_ok(TOKEN);
  let from_list = await get_from_list(TOKEN);
  let data = await count_froms(TOKEN, from_list);
  console.log(`统计完成，总数为 ${total}`);
}

// 时间列表获取（间隔 100 天）
function get_times() {
  // console.log("时间列表生成...");
  const time_offset = get_time_offset();
  let time_start = date_start.getTime() - time_offset;
  let time_end = date_end.getTime() - time_offset;
  let time_list = [];
  // 100天： 100*24*3600*1000 = 8640000000
  for (let i = time_start; i <= time_end; i += 8640000000) {
    if (i + 8640000000 <= time_end) {
      time_list.push({
        start: i,
        end: i + 8640000000,
      });
    } else {
      time_list.push({
        start: i,
        end: time_end,
      });
    }
  }
  return time_list;
}

// 时间差值计算（时区设置麻烦，采用差值计算）
function get_time_offset() {
  return new Date("2020-04-10").getTime() - 1586448000000;
}

// token 获取
function get_token() {
  console.log("获取 token ...");
  return axios
    .get(url_config.url_token, {
      params: {
        appkey: dd_config.app_key,
        appsecret: dd_config.app_secret,
      },
    })
    .then(function (response) {
      // console.log(response);
      return response.data.access_token;
    });
}

// 测试 ip 是否正确
function is_ip_ok(TOKEN) {
  console.log("测试 ip ...");
  return axios
    .post(url_config.url_get_process_code + `?access_token=${TOKEN}`, {
      name: from_list_by_name[0],
    })
    .then(function (response) {
      if (response.data.errcode != 0) {
        let errip =
          /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/.exec(
            response.data.errmsg
          );
        // console.error(errip[0]);
        throw new Error(`请在钉钉后台设置正确 ip ： ${errip[0]}`);
      } else {
        return true;
      }
    });
}

// 获取某表单 code
function get_process_code(TOKEN, name) {
  return axios
    .post(url_config.url_get_process_code + `?access_token=${TOKEN}`, {
      name: name,
    })
    .then(function (response) {
      // console.log(response);
      return response.data.process_code;
    });
}

// 构建完整列表对象
async function get_from_list(TOKEN) {
  let from_list = [];
  for (let value of from_list_by_name) {
    console.log(`表单 ${value} code 获取...`);
    let code = await get_process_code(TOKEN, value);
    from_list.push({
      name: value,
      code: code,
      count: 0,
    });
    // console.log(code);
  }
  return from_list;
}

// 单表某时段总数获取
async function count_from_by_time(TOKEN, from_item, time_range, cursor = 0) {
  return axios
    .post(url_config.url_get_list + `?access_token=${TOKEN}`, {
      process_code: from_item.code,
      start_time: time_range.start,
      end_time: time_range.end,
      size: 20,
      cursor,
    })
    .then(function (response) {
      let length = response.data.result.list.length;
      if (length > 0) {
        from_item.count += length;
        return count_from_by_time(TOKEN, from_item, time_range, ++cursor);
      } else {
        console.log("数据处理中，请稍等...");
        return null;
      }
    });
}

// 所有审批表总数量
async function count_froms(TOKEN, from_list) {
  for (let from_item of from_list) {
    console.log(`表单 《 ${from_item.name} 》 统计中...`);
    for (let time_range of time_list) {
      await count_from_by_time(TOKEN, from_item, time_range);
    }
    // 总数在此计算
    total += from_item.count;
  }
  return from_list;
}

// 入口
main();
