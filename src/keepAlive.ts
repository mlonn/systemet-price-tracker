import schedule from "node-schedule";
import axios from "axios";
export default webserver =>
  schedule.scheduleJob("*/15 * * * *", async err => {
    const url = `http://${webserver.get("url")}`;
    const res = await axios.get(url);
    console.log(res.data);
  });
