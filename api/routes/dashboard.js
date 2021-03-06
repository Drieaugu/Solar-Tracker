const DatabaseService = require("../../services/databaseService");
const csv = require("csv-parser");
const fs = require("fs");

module.exports = (app) => {
  app.get("/", async (req, res) => {
    let error = req.query.error;
    let success = req.query.success;
    res.render("dashboard.ejs", { error: error, success: success });
  });

  app.get("/alter", async (req, res) => {
    let error = req.query.error;
    res.render("alter.ejs", { error: error });
  });

  app.post("/alter/post", async (req, res) => {
    if (req.body.date && req.body.kilowattuur) {
      let databaseService = new DatabaseService();
      await databaseService.alterSolarData(
        req.body.date,
        req.body.kilowattuur,
        (message) => {
          if (message.type === "error") {
            let error = encodeURIComponent(message.message);
            res.redirect("/alter?error=" + error);
          } else {
            let success = encodeURIComponent(message.message);
            res.redirect("/?success=" + success);
          }
        }
      );
    } else {
      res.redirect("/alter");
    }
  });

  app.get("/ajax/getdata/:year", async (req, res) => {
    let year = req.params.year;

    let startDate = new Date(year);
    startDate.setMonth(0);
    startDate.setDate(1);
    let endDate = new Date(year);
    endDate.setMonth(11);
    endDate.setDate(31);

    let databaseService = new DatabaseService();
    const solarData = await databaseService.getSolarData(startDate, endDate);
    let data = {
      data: solarData,
      success: true,
    };
    res.send(data);
  });

  app.get("/ajax/getdata/:month/:year", async (req, res) => {
    let month = req.params.month;
    let year = req.params.year;

    let startDate = new Date();
    let endDate = new Date();

    let lastDate = new Date(year, month, 0).getDate();
    startDate.setFullYear(year);
    startDate.setMonth(month - 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    endDate.setFullYear(year);
    endDate.setMonth(month - 1);
    endDate.setDate(lastDate);

    let databaseService = new DatabaseService();
    const solarData = await databaseService.getSolarData(startDate, endDate);
    let data = {
      data: solarData,
      success: true,
    };
    res.send(data);
  });

  app.post("/post", async (req, res) => {
    if (req.body.date && req.body.kilowatthour) {
      let databaseService = new DatabaseService();
      await databaseService.addSolarData(
        req.body.date,
        req.body.kilowatthour,
        (err) => {
          if (err) {
            let error = encodeURIComponent("Date has already been set!");
            res.redirect("/?error=" + error);
          } else {
            res.redirect("/");
          }
        }
      );
    } else {
      res.redirect("/");
    }
  });

  app.get("/import", (req, res) => {
    res.render("import.ejs");
  });

  app.post("/post/import", async (req, res) => {
    let file = req.file;
    let errorFound = false;

    fs.createReadStream(file.path)
      .pipe(csv({ separator: ";" }))
      .on("data", async (data) => {
        const parsedData = Object.values(data);
        let dateParts = parsedData[0].split("/");
        let date = new Date();
        date.setHours(0, 0, 0, 0);

        date.setDate(parseInt(dateParts[0]));
        date.setMonth(parseInt(dateParts[1] - 1));
        date.setFullYear(parseInt(dateParts[2]));

        let databaseService = new DatabaseService();
        await databaseService.addSolarData(
          date,
          parseFloat(parsedData[1].replace(",", ".")),
          async (err) => {
            if (err) {
              if (!res.headersSent) {
                let error = encodeURIComponent("Something went wrong!");
                await res.redirect("/?error=" + error);
              }
            } else {
              if (!res.headersSent) {
                let success = encodeURIComponent("Data successfully imported!");
                res.redirect("/?success=" + success);
              }
            }
          }
        );
      });
  });
};
