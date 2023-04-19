const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');

app.set('view engine', 'ejs');
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true
  }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'ecommerce'
});

// GET request to retrieve product by ID
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  const sql = `SELECT * FROM products WHERE product_id = ${productId}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// POST request to add a product to a customer's cart
app.post('/cart', (req, res) => {
  const { customerId, productId, quantity } = req.body;
  const sql = `INSERT INTO order_items (cart_id, product_id, quantity, item_price)
               VALUES ((SELECT cart_id FROM cart WHERE customer_id = ${customerId} AND order_date IS NULL),
                       ${productId},
                       ${quantity},
                       (SELECT price FROM products WHERE product_id = ${productId}))`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Product added to cart successfully!');
  });
});

// POST request to place an order for a customer's cart
app.post('/orders', (req, res) => {
  const customerId = req.body.customerId;
  const sql = `UPDATE cart SET order_date = NOW(),
                 total_amount = (SELECT SUM(item_price * quantity) FROM order_items WHERE cart_id = (SELECT cart_id FROM cart WHERE customer_id = ${customerId} AND order_date IS NULL))
               WHERE customer_id = ${customerId} AND order_date IS NULL`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Order placed successfully!');
  });
});

// PUT request to update a customer's information
app.put('/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const { firstName, lastName, email, password, address, phone } = req.body;
  const sql = `UPDATE customers SET first_name = '${firstName}',
                 last_name = '${lastName}',
                 email = '${email}',
                 password = '${password}',
                 address = '${address}',
                 phone = '${phone}'
               WHERE customer_id = ${customerId}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Customer information updated successfully!');
  });
});

// GET request to search for products by name or description
app.get('/products/search', (req, res) => {
  const searchTerm = req.query.q;
  const sql = `SELECT * FROM products WHERE product_name LIKE '%${searchTerm}%' OR description LIKE '%${searchTerm}%'`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});


// PUT request to apply a discount to a customer's cart
app.put('/cart/discount', (req, res) => {
  const { customerId, discountAmount } = req.body;
  const sql = `UPDATE cart SET total_amount = total_amount - ${discountAmount}
               WHERE customer_id = ${customerId} AND order_date IS NULL`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Discount applied successfully!');
  });
});


// create a route to insert a new product
app.post('/products', (req, res) => {
  const { product_name, price, description, stock_count } = req.body;

    // execute the query to insert a new product
    db.query(
      'INSERT INTO products (product_name, price, description, stock_count) VALUES (?, ?, ?, ?)',
      [product_name, price, description, stock_count],
      (error, results, fields) => {
        if (error) throw error;
        
        // return the ID of the newly inserted product
        res.status(201).json({ product_id: results.insertId });

        // release the connection back to the pool
        connection.release();
      }
    );
  });


// create a route to insert a new customer
app.post('/customers', (req, res) => {
  const { first_name, last_name, email, password, address, phone } = req.body;


    // execute the query to insert a new customer
    db.query(
      'INSERT INTO customers (customer_id,first_name, last_name, email, password, address, phone) VALUES (1,?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, password, address, phone],
      (error, results, fields) => {
        if (error) throw error;
        
        // return the ID of the newly inserted customer
        res.status(201).json({ customer_id: results.insertId });

        // release the connection back to the pool
        db.release();
      }
    );
  });



app.listen(3000,(req,res)=>{
    console.log("listening of port 3000")
})