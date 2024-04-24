dot-request
======

链式调用 fetch() 或创建 Request 对象

特性 Features
---

- [x] 链式调用
- [x] 自定义 fetch 函数
- [x] 中断请求
- [x] 设置超时
- [x] 设置缓存模式
- [x] 设置子资源完整性验证信息
- [x] 多种请求体
- [x] 多种相应体封装
- [x] 获取上传进度监听
- [x] 获取下载进度监听
- [x] 匹配路径参数设置
- [x] 设置自定义数据
- [x] 对请求接口洋葱模型
- [x] 辅助创建 Request 对象

示例
----

```js
import DotRequest from 'dot-request';

const dr = new DotRequest()
	.prefix('/api/') // 配置前缀，对于 api 我们一般放在 `api` 路径下
	.suffix('.json') // 对于通过路径文件后缀区分返回数据结构的文件，添加 `.json` 后缀，用于表示期望返回 json
	.header('X-Env', 'test') // 设置请求头
	.header(`X-Token`, () => getToken()) // 在创建请求时，请求头 X-Token 设置为创建时 getToken() 的返回值

// 发送请求 GET /api/users/10000.json 并获取以 json 格式解析的相应内容
const userJson = await dr.get('/users/:uid').params({uid: 10000}).json();
// 发送请求 GET /api/users/10000.json 并获取对应的 Response 对象
const userResponse = await dr.get('/users/:uid').params({uid: 10000});

// 发送请求 GET /api/users/10000.json 并获取以 json 格式解析的相应内容，但设置了 1s 的超时时间
const userJsonTimeout = await dr.get('/users/:uid').params({uid: 10000}).timeout(1000).json();
// 发送请求 GET /api/users/10000.json 并获取对应的 Response 对象，但设置了 1s 的超时时间
const userResponseTimeout = await dr.get('/users/:uid').params({uid: 10000}).timeout(1000);

// 发送请求 GET /api/users/10000.json 并获取对应的 DotRequest.Result 对象
const userResult = dr.get('/users/:uid').params({uid: 10000}).fetch();
// 获取以 json 格式解析的 userResult 内容
const userResultJson = await userResult.json();

// 创建 GET /api/users/10000.json 的 Request 对象
const request = dr.get('/users/:uid').params({uid: 10000}).create();

```
