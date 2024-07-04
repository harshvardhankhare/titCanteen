const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const Razorpay = require('razorpay');
require("../db/db")

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Harsh@123',
  database: 'users'
});
const razorpay = new Razorpay({
  key_id: 'rzp_test_xVTuaX7m6NBaYz',
  key_secret: 'l19O2BFZgELPQXpX7StCoG8G'
});

router.post("/register", async (req, res) => {

  try {


    const { user_name, user_email, password, repassword, mob_number } = req.body
    let data = [user_name, user_email, password, mob_number]

    const checkUserSql = 'SELECT * FROM user_info WHERE user_email = ?';
    connection.query(checkUserSql, user_email, async (err, results) => {

      if (results) {
        console.log("user alreday")
        return res.status(409).json({ message: 'User already exists' });

      } else {
        connection.query('INSERT INTO user_info (user_name, user_email , password, mob_number) VALUES (?, ?,?,?)', data, (err, results, fields) => {
          if (err) {
            console.error('Error inserting data:', err);
            return;
          }
          console.log('Data inserted, ID:', results.insertId);
        });
      }


    })



  } catch (error) {
    console.log(error.message)
  }
})

router.post("/login", async (req, res) => {

  try {
    console.log(req.body)

    const { user_email, password } = req.body
    let data = [user_email, password]
    const email = user_email;
    const sql = 'SELECT * FROM user_info WHERE user_email = ?';
    connection.query(sql, email, (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return;
      }
      const datau = results
      if (datau[0].password == password) {
        console.log("uiuii")
        res.send(datau)
      } else {
        return res.status(409).json({ message: 'wrong password' });
      }


    });
  

    //  connection.query('INSERT INTO user_info (user_name, user_email , password, mob_number) VALUES (?, ?,?,?)', data, (err, results, fields) => {
    //            if (err) {
    //              console.error('Error inserting data:', err);
    //                return;
    //              }
    //              console.log('Data inserted, ID:', results.insertId);
    //            });


  } catch (error) {
    console.log(error.message)
  }
})

router.post("/add", async (req, res) => {
  console.log("reached backend")
  console.log(req.body)
  
  
  
  const price =req.body.price
  const quantity =1
  const item_name= req.body.title
  const image_url = req.body.image
const userId=req.body.user

  const query = `
  INSERT INTO cart_item (cart_id, price, quantity ,item_name, image_url)
  VALUES (
      (SELECT id FROM carts WHERE user_id = ? ),
      ?, ? ,? ,?
  )
  ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
`;

connection.query(query, [userId, price, quantity, item_name , image_url], (err, result) => {
  if (err) {
    console.error('Error adding data:', err);
    return;
  }
  console.log("item added")
});
 })

 router.get("/cart", (req, res)=>{

  const id= 1
  const sql = 'SELECT * FROM cart_item WHERE cart_id = ?';
  connection.query(sql, id, (err, results) => {
    if (err) {
      console.error('Error getting carts data:', err);
      return;
    }
    
  res.send(results)

  });
 })

 router.get("/getallusers", (req,res)=>{

  connection.query("SELECT * FROM user_info", (err, results)=>{
    if (err) {
      console.error('Error getting all users data:', err);
      return;
    }
    
  res.send(results)
  })
 })
router.delete("/deleteuser/:id",(req,res)=>{

  const userId = req.params.id;
  const sql = 'DELETE FROM user_info WHERE id = ?';
  connection.query(sql, [userId], (err, result) => {
      if (err) {
          return res.status(500).json({ error: err });
      }
      res.json({ message: 'User deleted successfully',succes:true });
  });
})
router.post("/addmenu",(req,res)=>{
  const {title, price , calories, Category}= req.body
  connection.query('INSERT INTO menu_list (title, calories , price, category) VALUES (?, ?,?,?)', [title,calories,price,Category], (err, results, fields) => {
    if (err) {
      console.error('Error inserting data:', err);
      return;
    }
    res.status(202).json({ message: 'User deleted successfully' })
  });
})
router.delete("/deletemenu/:id",(req,res)=>{
      
      const title = req.params.id;

  const sql = 'DELETE FROM menu_list WHERE title = ?';
  connection.query(sql, [title], (err, result) => {
      if (err) {
          return res.status(500).json({ error: err });
      }
      res.status(202).json({ message: 'menu deleted successfully' });
  });
})


router.post('/payment/orders', async (req, res) => {
  const { amount, currency, receipt } = req.body;
       console.log("payment")
  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency,
    receipt
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/payment/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const crypto = require('crypto');
  const generated_signature = crypto.createHmac('sha256', 'l19O2BFZgELPQXpX7StCoG8G')
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Save order details to the database
    const query = 'INSERT INTO orders (order_id, payment_id, amount, status) VALUES (?, ?, ?, ?)';
    const values = [razorpay_order_id, razorpay_payment_id, req.body.amount, 'paid'];

    connection.query(query, values, (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ message: 'Payment successful and order saved' });
      }
    });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});

router.get("/getuser/:id", (req,res)=>{
  
  const id = req.params.id
  const sql = 'SELECT * FROM user_info WHERE id = ?';
  connection.query(sql, id, (err, results) => {
    if (err) {
      console.error('Error getting carts data:', err);
      return;
    }
    console.log(results[0])
  res.send(results[0])

  });

})

router.delete("/cartitemdelete/:id", (req,res)=>{
  const ID = req.params.id;
  const sql = 'DELETE FROM cart_item WHERE id = ?';
  connection.query(sql, [ID], (err, result) => {
      if (err) {
          return res.status(500).json({ error: err });
      }
      res.status(202).json({ message: 'cart_item deleted successfully' });
  });
})
module.exports = router