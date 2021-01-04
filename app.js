const MongoClient = require("mongodb").MongoClient;
var mysql = require('mysql')

// Connection URL
const url = "mongodb://localhost:27017/headsOfStateDB";

//pool connection for multiple users to acces resourse
const pool = mysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'geography'
});

var MongoDBConnection = function (callback) {
  MongoClient.connect(url, function (err, client) {
    return callback(err, client);
  });
};

var MySqlConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};


const getCountries = async (req, res, next) => {
  try {
    MySqlConnection((err, connection) => {
      if (err) {
        return res.render("error", { error: err });
      }
      connection.query("SELECT * FROM country", function (error, results) {
        if (error) {
          return res.render("error", { error: error.sqlMessage });
        }
        res.render("countries", { results });
      });
      connection.release();
    });
  } catch (error) {
    next(error);
  }
};

const addCountry = async (req, res, next) => {
  try {
    return res.render("add-country", { errors: [] });
  } catch (error) {
    next(error);
  }
};

const updateCountry = async (req, res, next) => {
    try {
      MySqlConnection((err, connection) => {
        if (err) {
          return console.error(err);
        }
        connection.query("SELECT * FROM country WHERE co_code = ? ", [req.params.country], function (error, results) {
          if (error) {
            return res.render("error", { error: error.sqlMessage });
          }
          if (results.length == 0) {
            return res.render("error", { error: "No record found" });
          }
          return res.render("edit-country", { result: results[0], errors: [] });
        });
        connection.release();
      });
    } catch (error) {
      next(error);
    }
  }



const addCountryPost =  async (req, res, next) => {
    try {
      const errors = [];
      if (req.body.co_code.length < 3) {
        errors.push("Country Code must be 3 characters");
      }
      if (req.body.co_name.length < 3) {
        errors.push("Country Name must be atleast 3 characters");
      }
      if (errors.length) {
        return res.render("add-country", { errors });
      }
  
      MySqlConnection((err, connection) => {
        if (err) {
          return console.error(err);
        }
        connection.query("INSERT INTO country SET  ?", req.body, function (error) {
          if (error) {
            if (error.errno === 1062) {
              return res.render("add-country", { errors: ["Error: " + req.body.co_code + " already exist."] });
            }
            return res.render("error", { error: error.sqlMessage });
          }
          res.redirect("/countries");
        });
        connection.release();
      });
    } catch (error) {
      next(error);
    }
  }


  const updateCountryPost = async (req, res, next) => {
    try {
      const errors = [];
      if (req.body.co_code.length < 3) {
        errors.push("Country Code must be 3 characters");
      }
      if (req.body.co_name.length < 3) {
        errors.push("Country Name must be atleast 3 characters");
      }
      if (errors.length) {
        return res.render("edit-country", { result: req.body, errors });
      }
  
      MySqlConnection((err, connection) => {
        if (err) {
          return console.error(err);
        }
        connection.query(
          "UPDATE country SET  ? where co_code = ?",
          [{ co_name: req.body.co_name, co_details: req.body.co_details }, req.body.co_code ],
          function (error) {
            if (error) {
              if (error.errno === 1062) {
                return res.render("edit-country", { result: req.body, errors: ["Error: " + req.body.co_code + " already exist."] });
              }
              return res.render("error", { error: error.sqlMessage });
            }
            res.redirect("/countries");
          }
        );
        connection.release();
      });
    } catch (error) {
      next(error);
    }
  }


  const deleteCountry = async (req, res, next) => {
    try {  
      MySqlConnection((err, connection) => {
        if (err) {
            return res.render("error", { error: err.sqlMessage });
        }
        connection.query(
          "DELETE FROM country where co_code = ?",
          [req.params.country],
          function (error) {
            if (error) {
                if(error.errno === 1451){
                    return res.render("error", { error: `${req.params.country} has cities it can not be deleted.` });
                }
              return res.render("error", { error: error.sqlMessage });
            }
            res.redirect("/countries");
          }
        );
        connection.release();
      });
    } catch (error) {
      next(error);
    }
  }

const getCities = async (req, res, next) => {
    try {
      MySqlConnection((err, connection) => {
        if (err) {
          return res.render("error", { error: err });
        }
        connection.query("SELECT * FROM city", function (error, results) {
          if (error) {
            return res.render("error", { error: error.sqlMessage });
          }
          res.render("cities", { results });
        });
        connection.release();
      });
    } catch (error) {
      next(error);
    }
  }


  const getCity = async (req, res, next) => {
    try {
      MySqlConnection((err, connection) => {
        if (err) {
          return console.error(err);
        }
        connection.query(
          "SELECT * FROM city INNER JOIN country ON country.co_code=city.co_code WHERE city.cty_code = ? ",
          [req.params.city],
          function (error, results) {
            if (error) {
              return res.render("error", { error: error.sqlMessage });
            }
            res.render("city_detail", { result: results[0] });
          }
        );
        connection.release();
      });
    } catch (error) {
      next(error);
    }
  }


  const getHeads = async (req, res, next) => {
    try {
      MongoDBConnection(async (err, connection) => {
        if (err) {
          return res.render("error", { error: err });
        }
        let collection = connection.db().collection("headsOfState");
        res.render("heads-of-states", { results: await collection.find().toArray() });
      });
    } catch (error) {
      next(error);
    }
  }

  const addHead = async (req, res, next) => {
    try {
      return res.render("add-heads-of-states", { errors: [] });
    } catch (error) {
      next(error);
    }
  }

  const addHeadPost = async (req, res, next) => {
    try {
      const errors = [];
      if (req.body.co_code.length < 3) {
        errors.push("Country Code must be 3 characters");
      }
      if (req.body.head_of_state.length < 3) {
        errors.push("Country Name must be atleast 3 characters");
      }
      if (errors.length) {
        return res.render("add-heads-of-states", { errors });
      }
  
      MySqlConnection((err, connection) => {
        if (err) {
          return console.error(err);
        }
        connection.query("SELECT * FROM country WHERE co_code = ? ", [req.body.co_code], function (error, results) {
          if (error) {
            return res.render("error", { error: error.sqlMessage });
          }
          if (results.length < 1) {
            return res.render("add-heads-of-states", { errors: ["Country not found in MySQL database"] });
          }
          return MongoDBConnection(async (err, connection) => {
            if (err) {
              return res.render("error", { error: err });
            }
            let collection = connection.db().collection("headsOfState");
            collection
              .insertOne({ _id: req.body.co_code, headOfState: req.body.head_of_state })
              .then(() => {
                res.redirect("/heads-of-states");
              })
              .catch((err) => {
                if(err.code === 11000){
                  return res.render("error", { error: "head of state already present for this country" });
                }
               
              });
          });
        });
        connection.release();
      });
    } catch (error) {
      next(error);
    }
  }

module.exports = {
  getCountries: getCountries,
  addCountry: addCountry,
  updateCountry: updateCountry,
  addCountryPost: addCountryPost,
  updateCountryPost: updateCountryPost,
  deleteCountry: deleteCountry,
  getCities: getCities,
  getCity:getCity,
  getHeads: getHeads,
  addHead: addHead,
  addHeadPost:addHeadPost

};
