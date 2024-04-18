
// Import the 'pool' object so our helper functions can interact with the PostgreSQL database
import { pool } from "./db/index.js";

export async function getCustomers() {
  // Query the database and return all resource ones
  const queryText = `SELECT * from customers`
  try {
    const { rows } = await pool.query(queryText);

    return rows || null;
  }
  catch (error) {
    console.error(`Unable to get all customers: ${error}`)
  }
}

export async function getCustomerById(id) {
  // Query the database and return the resource with a matching id or null
  const queryText = `SELECT * FROM customers WHERE customer_id = $1`
  try {
    const { rows } = await pool.query(queryText, [id]);

    return rows[0] || null
  }
  catch (error) {
    console.error(`Unable to get customer by id: ${error}`)
  }
}

export async function createCustomer(customer) {
  // Query the database to create an resource and return the newly created resource

  // Define the SQL query to insert a new customer into the table
  const queryText = `
    INSERT INTO customers (name, email, phone)
    VALUES ($1, $2, $3)
    RETURNING *;
    `

    let errorMsg = "";

    // Assign params to an array
    const queryParams = [customer.name, customer.email, customer.phone];
    
    let errorDisplay = []

    try {
      if (!customer.name) {
        errorDisplay.push('Customer name')
      } if (!customer.email) {
        errorDisplay.push('Email')
      } if (!customer.phone) {
        errorDisplay.push('Phone')
      }
      
      if (errorDisplay.length > 0) {
      return [false, `${errorDisplay.join(', ')} is incorrect or missing, please enter it correctly to complete the request`]
      }
      
      // execute the query
      const { rows } = await pool.query(queryText, queryParams)
  
      // return rows;
      return [true, rows[0]];
    }
    catch (error) {
      console.error("Error creating new customer", error);
      throw error;
    }
}

export async function updateCustomerById(id, updates) {
  // Query the database to update the resource and return the newly updated resource or null

  let queryText = `UPDATE customers SET `
  let queryParams = [];
  let setParts = [];
  let queryParamIndex = 1;

  if (updates.name) {
    setParts.push(`name = $${queryParamIndex++}`);
    queryParams.push(updates.name);
  }
  if (updates.email) {
    setParts.push(`email = $${queryParamIndex++}`);
    queryParams.push(updates.email);
  }
  if (updates.phone) {
    setParts.push(`phone = $${queryParamIndex++}`)
    queryParams.push(updates.phone);
  }

  queryText += setParts.join(", ")
  queryText += ` WHERE customer_id = $${queryParamIndex++}`

  queryParams.push(id);

  queryText += ` RETURNING *;`;

  // create try catch
  try {
    const customerExists = await getCustomerById(id);

    if (!customerExists) { 
      return false;
    }

    // execute query
    const { rows } = await pool.query(queryText, queryParams)

    // return data (rows)
    return rows[0];
  }
  catch (error) {
    console.error("Error updating customer", error);
  }
}

export async function deleteCustomerById(id) {
  // Query the database to delete the resource and return the deleted resource or nul

  const selectQuery = `SELECT * FROM customers WHERE customer_id = $1`

  try {
    // Check if customer exists
    const selectResult = await pool.query(selectQuery, [id])

    const customer = selectResult.rows[0];

    if (!customer) {
      return null;
    }

    const deleteQuery = `
      DELETE FROM customers
      WHERE customer_id = $1
      `

    await pool.query(deleteQuery, [id]);
    
    return customer;
  }
  catch (error) {
    console.error("Error deleting customer", error);
    throw error
  }
}