const express = require('express');
require("./db/db")
const cors = require("cors")
const bodyParser = require ("body-parser")
const authroutes = require("./routes/authroutes")
const Razorpay = require('razorpay');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


  app.use("/api",  authroutes);
  // const getall= ()=>{
  //   connection.query('SELECT * FROM user_info', (err, results, fields) => {
  //       if (err) {
  //         console.error('Error executing query:', err);
  //         return;
  //       }
  //       console.log('Results:', results);
  //       console.log(fields)
  //     });
  // }
 

//   const data = ['value1', 'value2'];
// const insert = ()=>{
//     connection.query('INSERT INTO user_info (user_name, user_email) VALUES (?, ?)', data, (err, results, fields) => {
//         if (err) {
//           console.error('Error inserting data:', err);
//           return;
//         }
//         console.log('Data inserted, ID:', results.insertId);
//       });
// }
//   // Insert data into the table using a parameterized query
 
// getall()
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));