import axios from "axios";
import QS from "qs";

if (process.env.NODE_ENV == "development") {
  axios.defaults.baseURL = "http://192.168.111.32:80";
  // axios.defaults.baseURL = 'http://tiaodao.headlinetop.com';
} else if (process.env.NODE_ENV == "debug") {
  axios.defaults.baseURL = "http://192.168.111.32:80";
} else if (process.env.NODE_ENV == "production") {
  axios.defaults.baseURL = "http://tiaodao.headlinetop.com";
}

axios.defaults.timeout = 100000;
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded;charset=UTF-8";

export async function get(url) {
  return await new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err.data);
      });
  });
}

export function post(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, QS.stringify(params))
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err.data);
      });
  });
}
