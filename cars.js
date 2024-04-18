// Import the 'pool' object so our helper functions can interact with the PostgreSQL database
import { pool } from "./db/index.js";

export async function getCars() {
  try {
    // Define the query that will return all cars
    const queryText = `SELECT * FROM cars`;

    // Send the query to the DB using the pool method. this will return an object which is stored in queryResult
    const queryResult = await pool.query(queryText);

    //The queryRestul object has a method called rows which contains the retrieved cars

    return queryResult.rows || null;
  } catch (error) {
    console.error("Error executing query", error);
  }
}

export async function getCarById(id) {
  try {
    // Define the query that will return a customer with a a matching id or null
    const queryText = `SELECT * FROM cars WHERE car_id= $1`;

    // Send the query to the DB using the pool method. this will return an object which is stored in queryResult
    const queryResult = await pool.query(queryText, [id]);

    //The queryRestul object has a method called rows which contains the retrieved cars

    return queryResult.rows[0] || null;
  } catch (error) {
    console.error("Error executing query", error);
  }
}

export async function createCar(car) {
  // Define the query that create a new car and return the newly created car

  try {
    const queryText = `
      INSERT INTO cars (make, model, price) 
      VALUES ($1, $2, $3) 
      RETURNING *;
      `;

    //Assign the car parameters to an array
    const queryParams = [car.make, car.model, car.price];
    let errorDisplay = [];

    if (!car.make) {
      errorDisplay.push("Car Make");
    }
    if (!car.model) {
      errorDisplay.push("Model");
    }
    if (!car.price) {
      errorDisplay.push("Price");
    }

    if (errorDisplay.length > 0) {
      return [
        false,
        `${errorDisplay.join(", ")} is incorrect or missing, please enter it correctly to complete the request`,
      ];
    }

    // Send the query to the DB using the pool method. This will return an object which is stored in queryResult
    const queryResult = await pool.query(queryText, queryParams);

    //The queryRestul object has a method called rows which contains the created car

    return [true, queryResult.rows[0] || null];
  } catch (error) {
    console.error("Error creating new car", error);
    throw error;
  }
}

export async function updateCarById(id, updates) {
  // Query the database to update the car and return the newly updated resource or null

  let queryText = `UPDATE cars SET `;
  let queryParams = [];
  let setParts = [];
  let queryParamIndex = 1;

  if (updates.make) {
    setParts.push(`make = $${queryParamIndex++}`);
    queryParams.push(updates.make);
  }
  if (updates.model) {
    setParts.push(`model = $${queryParamIndex++}`);
    queryParams.push(updates.model);
  }
  if (updates.price) {
    setParts.push(`price = $${queryParamIndex++}`);
    queryParams.push(updates.price);
  }

  queryText += setParts.join(", ");
  queryText += ` WHERE car_id = $${queryParamIndex++}`;

  queryParams.push(id);

  queryText += ` RETURNING *;`;

  // create try catch
  try {
    const carExists = await getCarById(id);

    if (!carExists) {
      return false;
    }

    // execute query
    const { rows } = await pool.query(queryText, queryParams);

    // return data (rows)
    return rows[0];
  } catch (error) {
    console.error("Error updating car", error);
  }
}

export async function deleteCarById(id) {
  const selectQuery = `SELECT * FROM cars WHERE car_id = $1`

  try {
    // Check if customer exists
    const selectResult = await pool.query(selectQuery, [id])

    const car = selectResult.rows[0];

    if (!car) {
      return null;
    }

    const deleteQuery = `
      DELETE FROM cars
      WHERE car_id = $1
      `

    await pool.query(deleteQuery, [id]);
    
    return car;
  } catch (error) {
    console.error(`Error deleting entry:`, error.message);
    throw error;
  }
}
