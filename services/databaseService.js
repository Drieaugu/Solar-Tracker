const solar = require("../models/solar");

class databaseService {
  constructor() {}

  /**
   * Queries database for data
   * @param {object} startDate Earliest date in range
   * @param {object} endDate Last date in range
   * @returns {Promise<*>}
   */
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
  /**
   * Adds data to the database
   * @param {object} date The date
   * @param {number} kwh The amount of kWh that was generated
   * @param callback
   * @returns {Promise<void>}
   */
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
  /**
   * Used to alter data that was already added
   * @param {object} date The date that has to changed
   * @param {number} kwh The new amount of kWh
   * @param callback
   * @returns {Promise<void>}
   */
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
