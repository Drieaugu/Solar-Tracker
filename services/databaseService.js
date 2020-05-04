const solar = require("../models/solar");

class databaseService {
  constructor() {}

  getSolarData = async (startDate, endDate) => {
    let data;
    if (endDate === "") {
      data = await solar.find(
        {
          date: { $gte: startDate },
        },
        "date kWh -_id"
      );
    } else if (startDate === "") {
      data = await solar.find(
        {
          date: { $lte: endDate },
        },
        "date kWh -_id"
      );
    } else {
      data = await solar.find(
        {
          date: { $gte: startDate, $lte: endDate },
        },
        "date kWh -_id"
      );
    }
    return data;
  };

  addSolarData = async (date, kwh, callback) => {
    const newData = new solar({ date: date, kWh: kwh });
    await newData.save((err) => {
      if (err) {
        callback(err);
      } else {
        callback();
      }
    });
  };

  alterSolarData = async (date, kwh, callback) => {
    await solar.findOne({ date: { $eq: date } }, (err, doc) => {
      if (!doc) {
        callback({
          type: "error",
          message: "That date can't be changed!",
        });
      } else {
        doc.kWh = kwh;
        doc.save((err) => {
          if (err) {
            callback({ type: "error", message: "Something went wrong!" });
          } else {
            callback({
              type: "success",
              message: "Successfully changed data!",
            });
          }
        });
      }
    });
  };
}

module.exports = databaseService;
