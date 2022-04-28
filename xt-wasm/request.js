import * as https from "https";

export const request = () => {
  console.log("This is being called from rust, waw!");
  return new Promise((resolve, reject) => {
    let req = https.get("https://www.google.com", (response) => {
      let body = [];

      response.on("data", (chunk) => {
        body.push(chunk);
      });

      response.on("end", () => {
        let fullBody = Buffer.concat(body);
        resolve(fullBody);
      });

      response.on("error", (fail) => {
        reject(fail);
      });

      req.end();
    });
  });
};
