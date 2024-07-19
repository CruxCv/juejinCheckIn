// const axios = require('axios')
// const config = require('./config')
// const nodemailer = require('nodemailer')
// const ejs = require('ejs')
// const fs = require('fs')
// const path = require('path')
// const logs = []

// // 请求配置
// axios.defaults.baseURL = config.baseUrl
// axios.defaults.headers['cookie'] = process.env.COOKIE

// // 相应拦截处理
// axios.interceptors.response.use((response) => {
//   const { data } = response
//   if (data.err_msg === 'success' && data.err_no === 0) {
//     return data
//   } else {
//     return Promise.reject(data.err_msg)
//   }
// }, (error) => {
//   return Promise.reject(error)
// })

// /**
//  * 查看今天是否已经签到
//  *
//  * @return {Boolean} 是否签到过
//  */
// const getCheckStatus = async () => {
//   try {
//     const getCheckStatusRes = await axios({
//       url: config.api.getCheckStatus,
//       method: 'get'
//     })
//     return getCheckStatusRes.data
//   } catch (error) {
//     throw `查询签到失败!【${error}】`
//   }
// }

// /**
//  * 查询当前矿石
//  *
//  */
// const getCurrentPoint = async () => {
//   try {
//     const getCurrentPointRes = await axios({ url: config.api.getCurrentPoint, method: 'get' })
//     console.log(`当前总矿石数: ${getCurrentPointRes.data}`)
//   } catch (error) {
//     throw `查询矿石失败!${error.err_msg}`
//   }

// }
// /**
//  * 查询免费抽奖次数
//  *
//  * @return {Boolean} 是否有免费抽奖次数
//  */
// const getlotteryStatus = async () => {
//   try {
//     const getlotteryStatusRes = await axios({ url: config.api.getlotteryStatus, method: 'get' })
//     return getlotteryStatusRes.data.free_count === 0
//   } catch (error) {
//     throw `查询免费抽奖失败！【${error}】`
//   }
// }

// /**
//  * 获取沾喜气列表用户historyId
//  *
//  * @return {string} 被沾的幸运儿的history_id
//  */
// const getLuckyUserHistoryId = async () => {
//   try {
//     // 接口为分页查询  默认查询条10条数据 {page_no: 0, page_size: 5}
//     const luckyList = await axios({ url: config.api.getLuckyUserList, method: 'post' })
//     // 随机抽取一位幸运儿  沾他
//     return luckyList.data.lotteries[Math.floor(Math.random() * luckyList.data.lotteries.length)]?.history_id
//   } catch (error) {
//     throw `获取沾喜气列表用户historyId失败`
//   }
// }

// /**
//  * 占喜气
//  *
//  */
// const dipLucky = async () => {
//   try {
//     // 获取historyId
//     const historyId = await getLuckyUserHistoryId()
//     // 沾喜气接口   传递lottery_history_id
//     const dipLuckyRes = await axios({ url: config.api.dipLucky, method: 'post', data: { lottery_history_id: historyId } })
//     console.log(`占喜气成功! 🎉 【当前幸运值：${dipLuckyRes.data.total_value}/6000】`)
//   } catch (error) {
//     throw `占喜气失败！ ${error}`
//   }
// }

// /**
//  * 抽奖
//  *
//  */
// const draw = async () => {
//   try {
//     const freeCount = await getlotteryStatus()
//     if (freeCount) {
//       // 没有免费抽奖次数
//       throw '今日免费抽奖已用完'
//     }

//     // 开始抽奖
//     const drawRes = await axios({ url: config.api.draw, method: 'post' })
//     console.log(`恭喜你抽到【${drawRes.data.lottery_name}】🎉`)

//     // 沾喜气
//     await dipLucky()
//     if (drawRes.data.lottery_type === 1) {
//       // 抽到矿石 查询总矿石
//       await getCurrentPoint()
//     }
//   } catch (error) {
//     console.error(`抽奖失败!=======> 【${error}】`)
//   }
// }

// /**
//  *查询签到天数
//  *
//  * @return {Object} continuousDay 连续签到天数 sumCount 总签到天数
//  */
// const getCheckInDays = async () => {
//   try {
//     const getCheckInDays = await axios({ url: config.api.getCheckInDays, method: 'get' })
//     return { continuousDay: getCheckInDays.data.cont_count, sumCount: getCheckInDays.data.sum_count }
//   } catch (error) {
//     throw `查询签到天数失败!🙁【${getCheckInDays.err_msg}】`
//   }
// }

// /**
//  * 签到
//  *
//  */
// const checkIn = async () => {
//   try {
//     // 查询今天是否签到没
//     const checkStatusRes = await getCheckStatus()

//     if (!checkStatusRes) {
//       // 签到
//       const checkInRes = await axios({ url: config.api.checkIn, method: 'post' })
//       console.log(`签到成功+${checkInRes.data.incr_point}矿石，总矿石${checkInRes.data.sum_point}`)

//       // 查询签到天数
//       const getCheckInDaysRes = await getCheckInDays()
//       console.log(`连续签到【${getCheckInDaysRes.continuousDay}】天  总签到天数【${getCheckInDaysRes.sumCount}】  掘金不停 签到不断💪`)

//       // 签到成功 去抽奖
//       await draw()
//     } else {
//       console.log('今日已经签到 ✅')
//     }

//   } catch (error) {
//     console.error(`签到失败!=======> ${error}`)
//   }
// }

// /**
//  * 发送邮件
//  *
//  */
// const sendEmail = async () => {
//   try {
//     const template = ejs.compile(fs.readFileSync(path.resolve(__dirname, 'email.ejs'), 'utf8'));
//     const transporter = nodemailer.createTransport({
//       service: process.env.SERVICE, // 邮箱服务
//       port: 465,
//       secure: true,
//       secureConnection: true,
//       auth: {
//         user: process.env.EMAIL, // 发送者邮箱
//         pass: process.env.PASS, // 邮箱授权码
//       }
//     })

//     // 发送邮件
//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: process.env.EMAIL,
//       subject: '掘金签到通知🔔',
//       html: template({
//         logs: logs
//       })
//     })

//   } catch (error) {
//     console.error(`邮件发送失败！${error}`)
//   }

// }

// /**
//  * 启动程序  处理日志输出 开始签到流程 将结果通过邮件形式发送
//  *
//  */
// const start = async () => {
//   // 日志处理  将脚本日志通过ejs渲染成html
//   console.oldLog = console.log
//   console.oldErr = console.error

//   console.log = (str) => {
//     logs.push({
//       type: 'success',
//       text: str
//     })
//     console.oldLog(str)
//   }

//   console.error = (str) => {
//     logs.push({
//       type: 'error',
//       text: str
//     })
//     console.oldErr(str)
//   }

//   await checkIn()

//   await sendEmail()
// }

// // start()
// const puppeteer = require('puppeteer')
// const { api } = require('./config')

// async function start() {
//   try {
//     const url = 'https://juejin.cn/'
//     const browser = await puppeteer.launch({
//       headless: false,
//       devtools: true, // 调试面板
//     })

//     const page = await browser.newPage()

//     // 添加cookie
//     await addCookie(page, '.juejin.cn')

//     await page.goto(url)

//     // 处理签到流程
//     checkInHandler(page)
//     page.on('close', () => {
//       console.log('页面关闭')
//     })
//   } catch (error) {
//     console.error(`签到失败!=======> ${error}`)
//   }
// }

// start()

// /**
//  * 添加cookie
//  *
//  * @param {*} page
//  * @param {*} domain
//  * @return {Promise}
//  */
// async function addCookie(page, domain) {
//   try {
//     const cookiesStr =
//       'MONITOR_WEB_ID=5203d142-eac0-4d92-9088-54e6ab047b59; _tea_utm_cache_2608={"utm_source":"gold_browser_extension"}; __tea_cookie_tokens_2608=%7B%22user_unique_id%22%3A%227045840987474527755%22%2C%22web_id%22%3A%227045840987474527755%22%2C%22timestamp%22%3A1650378307061%7D; _ga=GA1.2.1448381689.1650417412; passport_csrf_token=45b6f3ecf3b9d63b5d04deed82670b32; passport_csrf_token_default=45b6f3ecf3b9d63b5d04deed82670b32; n_mh=o10NasVjxZMV8AhnseSRNnfPCxigoTAM_Od1FEZsuR0; passport_auth_status=97ea735c0598a52a7a838db58bce3203,; passport_auth_status_ss=97ea735c0598a52a7a838db58bce3203,; sid_guard=b7eeb793eff7c7bc2fe6de96f5696530|1650417432|31536000|Thu,+20-Apr-2023+01:17:12+GMT; uid_tt=9f872caf68276837e5b10c395fb2ca32; uid_tt_ss=9f872caf68276837e5b10c395fb2ca32; sid_tt=b7eeb793eff7c7bc2fe6de96f5696530; sessionid=b7eeb793eff7c7bc2fe6de96f5696530; sid_ucp_v1=1.0.0-KDc0MmY3YjNlOGE0NWVlZjljYjBjZTM3ZTNhMTk1ZTRmYjZjM2RjY2MKFwi3s_DA_fWVBBCYvv2SBhiwFDgCQPEHGgJsZiIgYjdlZWI3OTNlZmY3YzdiYzJmZTZkZTk2ZjU2OTY1MzA; ssid_ucp_v1=1.0.0-KDc0MmY3YjNlOGE0NWVlZjljYjBjZTM3ZTNhMTk1ZTRmYjZjM2RjY2MKFwi3s_DA_fWVBBCYvv2SBhiwFDgCQPEHGgJsZiIgYjdlZWI3OTNlZmY3YzdiYzJmZTZkZTk2ZjU2OTY1MzA; _gid=GA1.2.1280376390.1652059751'

//     let cookies = cookiesStr.split(';').map((item) => {
//       let name = item.trim().slice(0, item.trim().indexOf('='))
//       let value = item.trim().slice(item.trim().indexOf('=') + 1)
//       return { name, value, domain }
//     })
//     await Promise.all(
//       cookies.map((item) => {
//         return page.setCookie(item)
//       })
//     )
//     console.log('设置cookie成功🎉')
//   } catch (error) {
//     throw new Error('设置cookie失败, 请检查cookie格式是否正确')
//   }
// }

// async function checkInHandler(page) {
//   try {
//     // 签到
//     // 沾喜气
//     // 抽奖
//     // let avatar = await page.$('.avatar')
//     // avatar.click()

//     // 点击头像
//     await page.click('#juejin > div.view-container.container > div > header > div > nav > ul > ul > li.nav-item.menu')

//     // 点击签到赢好礼
//     await page.click('#juejin > div.view-container.container > div > header > div > nav > ul > ul > li.nav-item.menu > ul > div:nth-child(2) > li.nav-menu-item.signin')

//     // 查看今天是否签到过
//     await onResponse(page, api.getCheckStatus, async (res) => {
//       console.log(res, '-----是否签到')
//       // if (res.data) {
//       //   throw '您今日已完成签到，请勿重复签到'
//       // } else {
//         console.log('签到')
//         let signinDom = await page.waitForSelector('#juejin > div.view-container > main > div.right-wrap > div > div:nth-child(1) > div.signin > div.signin-content > div.content-right > div')
//         signinDom.click()
//       // }
//     })
    
//     // 签到
//     onResponse(page, api.checkIn, (res) => {
//       console.log(res, '------签到结果')
//       if (res.success) {
//         console.log(`签到成功+${res.data.incr_point}矿石，总矿石${res.data.sum_point}`)
//       }
//     })

//     // 查询签到天数
//     await onResponse(page, api.getCheckInDays, (res) => {
//       console.log(res, '------查询签到天数')
//       if (res.success) {
//         console.log(`连续签到【${res.continuousDay}】天  总签到天数【${res.sumCount}】  掘金不停 签到不断💪`)
//       }
//     })

//     // 沾喜气
//     // let dipLuckyDom = await page.waitForSelector('#stick-txt-0 > span > span')
//     // dipLuckyDom.click()

//     // // 查看沾喜气次数
//     // await onResponse(page, api.dipLucky, (res) => {
//     //   console.log(res, '------沾喜气结果')
//     //   if (res.success) {
//     //     console.log(`占喜气成功! 🎉 【当前幸运值：${dipLuckyRes.data.total_value}/6000】`)
//     //   }
//     // })

//     // // 查询免费抽奖
//     // await onResponse(page, api.getlotteryStatus, (res) => {
//     //   console.log(res, '------免费抽奖次数')
//     //   if (res.data.free_count === 0 && res.success) {
//     //     throw '今日免费抽奖已用完'
//     //   }
//     // })
//     // // 抽奖
//     // let drawDom = await page.waitForSelector('body > div.success-modal.byte-modal.v-transfer-dom > div.byte-modal__wrapper > div > div.byte-modal__body > div > div.btn-area')
//     // drawDom.click()

//     // // 抽奖结果
//     // await onResponse(page, api.draw, (res) => {
//     //   console.log(res, '------抽奖结果')
//     //   if (res.success) {
//     //     console.log(`恭喜你抽到【${res.data.lottery_name}】🎉`)
//     //   }
//     // })

//     // const waitResult = await page.waitForResponse(response => {
//     //   console.log(response.json(), '---response')
//     //   // response.json().then(res => {
//     //   //   console.log(res, '----buffer res')
//     //   // })
//     //   if(response.ok()) {
//     //     const url = response.url()
//     //     console.log("~~~~ url", typeof url);
//     //     console.log(api.getCheckStatus, '------api.getCheckStatus')
//     //     console.log( url.includes(api.getCheckStatus), '-----是否签到')
//     //     if (url.includes(api.getCheckStatus)) {
//     //       response.json().then(res=>{
//     //         console.log(res, '---res')
//     //         if (res.err_msg === 'success') {
//     //           throw new Error('您今日已经完成签到，请勿重复签到！')
//     //         }
//     //       })
//     //     }
//     //   }
//     // })

//     //   // 获取当前查询次数  查看是否有免费抽奖
//     //   let freeDrawDom = await page.waitForSelector('#cost-box > div:nth-child(1)')
//     //   freeDrawDom.click()
//   } catch (error) {
//     console.log(error.message, '---rrr')
//   }
// }

// /**
//  * 等待请求响应封装  用于匹配到对应的请求 url 之后的操作  返回请求的结果
//  *
//  * @param {*} page
//  * @param {*} matchUrl
//  * @param {*} responseFn
//  * @return {*}
//  */
// function onResponse(page, matchUrl, responseFn) {
//   console.log('~~~~ matchUrl', matchUrl)
//   try {
//     page.on('response', async (interceptedRequest) => {
//       if (interceptedRequest.url().includes(matchUrl) && interceptedRequest.status() === 200) {
//         console.log(interceptedRequest.url(), '----url')
//         if (interceptedRequest.ok()) {
//           const jsonData = await interceptedRequest.json()
//           await responseFn(jsonData)
//         }
//         return interceptedRequest
//       }
//     })
//   } catch (error) {
//     throw ('监听网络请求：' + matchUrl + '失败！' + 'error ===>', error)
//   }
// }

const puppeteer = require('puppeteer');
const config = require('./config');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
let logs = [];

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// cookies: '__tea_cookie_tokens_2608=%257B%2522web_id%2522%253A%25227062378259807684100%2522%252C%2522user_unique_id%2522%253A%25227062378259807684100%2522%252C%2522timestamp%2522%253A1644338093467%257D;csrf_session_id=cff72b8c1409ecf1fa00aacbba5f9681;passport_csrf_token=77f4cf48627ef09633163575f6020910;passport_csrf_token_default=77f4cf48627ef09633163575f6020910;n_mh=XC9UYpK2kjnTAX61kRV0k15y9dFQlBwpHCfek8Q-Wew;sid_guard=5a5970294a9aad24654f7a892963fa7a%7C1717657377%7C31536000%7CFri%2C+06-Jun-2025+07%3A02%3A57+GMT;uid_tt=e1db711c397d6eea8e0952bb2fce40b1;uid_tt_ss=e1db711c397d6eea8e0952bb2fce40b1;sid_tt=5a5970294a9aad24654f7a892963fa7a;sessionid=5a5970294a9aad24654f7a892963fa7a;sessionid_ss=5a5970294a9aad24654f7a892963fa7a;sid_ucp_v1=1.0.0-KDBmMzRhYjc1YWEyNDllNmFhOWUxNDcyZDY1MTM1MTJhYjZiODljOTkKFgj3oeC-_fVtEKG-hbMGGLAUOAJA8QcaAmxxIiA1YTU5NzAyOTRhOWFhZDI0NjU0ZjdhODkyOTYzZmE3YQ;ssid_ucp_v1=1.0.0-KDBmMzRhYjc1YWEyNDllNmFhOWUxNDcyZDY1MTM1MTJhYjZiODljOTkKFgj3oeC-_fVtEKG-hbMGGLAUOAJA8QcaAmxxIiA1YTU5NzAyOTRhOWFhZDI0NjU0ZjdhODkyOTYzZmE3YQ;store-region=cn-hb;store-region-src=uid;_tea_utm_cache_2608={%22utm_source%22:%22gold_browser_extension%22};_tea_utm_cache_2018={%22utm_source%22:%22gold_browser_extension%22};_tea_utm_cache_576092={%22utm_source%22:%22gold_browser_extension%22}',
const defaultCookies =
  '_tea_utm_cache_2018={%22utm_source%22:%22gold_browser_extension%22}; _tea_utm_cache_2608={%22utm_source%22:%22gold_browser_extension%22}; _tea_utm_cache_576092={%22utm_source%22:%22gold_browser_extension%22}; __tea_cookie_tokens_2608=%257B%2522web_id%2522%253A%25227392818039530702336%2522%252C%2522user_unique_id%2522%253A%25227392818039530702336%2522%252C%2522timestamp%2522%253A1721274604910%257D; passport_csrf_token=744f9b66c7079c638f07d7c8f0d86fca; passport_csrf_token_default=744f9b66c7079c638f07d7c8f0d86fca; store-region=cn-hb; store-region-src=uid; odin_tt=cf8e1828fcd9ea536b956fdbdb7e30264318c7cf32ce2147021007b00d3a3dcdcccb4c03edad12098a3a6da509977c7e8d61d017f2b1f5dbfdd968fcc5c8d24a; n_mh=HQBWFM8BIydFMLcTLDwL0ti-9mlH9wfrLrANdFA64SY; passport_auth_status=0f0fffc71069f5d73cafa406b2995a9d%2C15eb8593d3ab389fd7aaa83d50c5562e; passport_auth_status_ss=0f0fffc71069f5d73cafa406b2995a9d%2C15eb8593d3ab389fd7aaa83d50c5562e; sid_guard=99c0b3c7e38673ea168801461461c743%7C1721284641%7C31536000%7CFri%2C+18-Jul-2025+06%3A37%3A21+GMT; uid_tt=4bc7099dfabd7b7fe58d107e7169a16a; uid_tt_ss=4bc7099dfabd7b7fe58d107e7169a16a; sid_tt=99c0b3c7e38673ea168801461461c743; sessionid=99c0b3c7e38673ea168801461461c743; sessionid_ss=99c0b3c7e38673ea168801461461c743; sid_ucp_v1=1.0.0-KGEyOTMxY2UwNTQ1Zjk3MDIzYjZlMGQ0MzJhZTgxMzhkZWUxZTQxNTMKFwjqzPDbmM39BBCh8OK0BhiwFDgCQOwHGgJsZiIgOTljMGIzYzdlMzg2NzNlYTE2ODgwMTQ2MTQ2MWM3NDM; ssid_ucp_v1=1.0.0-KGEyOTMxY2UwNTQ1Zjk3MDIzYjZlMGQ0MzJhZTgxMzhkZWUxZTQxNTMKFwjqzPDbmM39BBCh8OK0BhiwFDgCQOwHGgJsZiIgOTljMGIzYzdlMzg2NzNlYTE2ODgwMTQ2MTQ2MWM3NDM; csrf_session_id=84345d40a65e30944fd6b869339cdd04';

async function start() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      devtools: false, // 调试面板
    });

    const page = await browser.newPage();

    // 添加cookie
    await addCookie(page, '.juejin.cn');
    await page.goto('https://juejin.cn/');

    logs = [];
    // 处理签到流程
    await checkInHandler(page);
    await browser.close();
  } catch (error) {
    console.error(`签到失败!=======> ${error}`);
  }
}

start();

/**
 * 添加cookie
 *
 * @param {*} page
 * @param {*} domain
 * @return {Promise}
 */
async function addCookie(page, domain) {
  try {
    const cookies = (process.env.COOKIE || defaultCookies)
      .split(';')
      .map((item) => {
        const name = item.trim().slice(0, item.trim().indexOf('='));
        const value = item.trim().slice(item.trim().indexOf('=') + 1);
        return { name, value, domain };
      });

    await Promise.all(cookies.map((item) => page.setCookie(item)));
    console.log('设置cookie成功🎉');
  } catch (error) {
    throw new Error('设置cookie失败, 请检查cookie格式是否正确');
  }
}

const sendEmail = async () => {
  try {
    const template = ejs.compile(
      fs.readFileSync(path.resolve(__dirname, 'email.ejs'), 'utf8')
    );
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE, // 邮箱服务
      port: 465,
      secure: true,
      secureConnection: true,
      auth: {
        user: process.env.EMAIL, // 发送者邮箱
        pass: process.env.PASS, // 邮箱授权码
      },
    });

    // 发送邮件
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: '掘金签到通知🔔',
      html: template({
        logs: logs,
      }),
    });
  } catch (error) {
    console.error(`邮件发送失败！${error}`);
  }
};

async function checkInHandler(page) {
  try {
    const avatar = await page.$('.avatar');
    await avatar.click();

    const signEntry = await page.waitForSelector(
      '#juejin .dropdown-list .dropdown-item:nth-child(2)'
    );
    await signEntry.click();
    await page.waitForNavigation();

    console.log('进入签到页🎉');

    const signBtn = await page.waitForSelector('#juejin .signin');
    await signBtn.click();

    const signedBtn = await page.waitForSelector('#juejin .signedin');
    await signedBtn.click();

    const oreEle = await page.waitForSelector(
      '.success-modal .header-text .figure-text'
    );
    console.log('签到成功🎉');
    let signStr = '';

    if (oreEle) {
      const evalNum = await page.$eval(
        '.success-modal .header-text .figure-text',
        (n) => n.textContent.trim()
      );
      signStr = `签到成功，获得${evalNum}🎉`;
      console.log(signStr);
      logs.push(signStr);
    }

    // 去抽奖页
    const lotteryEntryBtn = await page.waitForSelector(
      '.success-modal .btn-area .btn'
    );
    await lotteryEntryBtn.click();

    await page.waitForNavigation();
    await sleep(5000);
    console.log('进入抽奖页🎉');

    const lotteryBtn = await page.waitForSelector('#juejin #turntable-item-0');
    await lotteryBtn.click();

    console.log('等待5s...');
    await sleep(3000);

    const lotteryResult = await page.$eval('.lottery-modal .title', (n) =>
      n.textContent.trim()
    );
    console.log(`抽奖成功，${lotteryResult}🎉`);
    logs.push(lotteryResult);

    const confirmBtn = await page.$('.lottery-modal .submit');
    await confirmBtn.click();

    await sendEmail();
    await sleep(5000);
  } catch (error) {
    console.log(error.message);
  }
}
