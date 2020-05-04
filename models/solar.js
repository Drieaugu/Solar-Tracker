const config = require("../config/config");
const mongoose = require("mongoose");

mongoose.set("useCreateIndex", true);

mongoose.connect(config.db.local_url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const solarSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  kWh: {
    type: Number,
    required: true,
  },
});

const Solar = mongoose.model("Solar", solarSchema);

module.exports = Solar;
