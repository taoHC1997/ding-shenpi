# ding-shenpi

钉钉审批单据统计

## 需求

部门领导要求统计钉钉审批单总数（非有效总数），研究发现钉钉没有提供这种功能；就自己拿 `axios` 写了一个（数据已脱敏）。

## 使用说明

1. 下载下来
2. 依赖包安装
   ```s
   npm i
   ```
3. 钉钉配置
   1. 在钉钉创建 H5 微应用
   2. 【基础信息】中记录 `app_key` `app_secret`
   3. 使用 http://myip.fireflysoft.net/ 拿到 ip ，在【开发管理】添加到服务器出口 ip
   4. 【权限管理】中申请智能工作流权限
4. 项目配置
   ```js
   // index.js
   // 钉钉配置，请在钉钉创建H5微应用，然后配置
   const dd_config = {
     // 应用 AppKey
     app_key: "dingaaaaaaaaaaaaaaaa",
     // 应用 AppSecret
     app_secret:
       "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
   };
   // 表单列表配置，这里记录要统计的表单名称
   const from_list_by_name = [
     // "请假",
     // "通用审批",
   ];
   // 初始时间，请自行设置（注意接口说只能查最近365天，实测不是）
   const date_start = new Date("2020-01-01");
   ```
5. 开始统计
   ```s
   # 喝杯茶吧
   node index.js
   ```
