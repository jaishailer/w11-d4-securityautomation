import { pool } from "../index.js";



// >>> MAKE SURE YOU UNDERSTAND THIS FILE AND WHAT IT'S DOING <<<
// >>> FEEL FREE TO CHANGE IT TO MAKE YOUR OWN RESOURCES (TABLES AND PROPERTIES) - YOU DON'T HAVE TO USE ALBUMS AND ARTISTS <<<



async function resetDatabase() {
  try {
    // Drop existing tables if they exist
    await pool.query(`
        DROP TABLE IF EXISTS customers CASCADE;
        DROP TABLE IF EXISTS sales CASCADE;
        DROP TABLE IF EXISTS cars CASCADE;
    `);

    // Create the customers table
    await pool.query(`
        CREATE TABLE customers (
            customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(16)
        );
    `);
    // Create the cars table
    await pool.query(`
        CREATE TABLE cars (
            car_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            make VARCHAR(255) NOT NULL,
            model VARCHAR(255) NOT NULL,
            price DECIMAL NOT NULL
        );
    `);
    // Create the sales table with foreign key to the customers table
    await pool.query(`
        CREATE TABLE sales (
            sale_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            car_id INT REFERENCES cars(car_id),
            customer_id INT REFERENCES customers(customer_id),
            sale_date DATE NOT NULL,
            sale_price DECIMAL NOT NULL
        );
    `);

    // Seed the customers table
    await pool.query(`
        INSERT INTO customers (name, email, phone) 
        VALUES 
            ('Alice Smith', 'alice.smith@example.co.uk', '+44 7123 456 789'),
            ('Bob Johnson', 'bob.johnson@example.co.uk', '+44 7123 456 790'),
            ('Charlie Brown', 'charlie.brown@example.co.uk', '+44 7123 456 791'),
            ('Danielle White', 'd.white@example.co.uk', '+44 7123 456 792'),
            ('Ethan Davis', 'ethan.davis@example.co.uk', '+44 7123 456 793');
            `);

    // Seed the cars table with luxury cars
    await pool.query(`
    INSERT INTO cars (make, model, price) 
    VALUES 
        ('Porsche', '911', 90000),
        ('Lamborghini', 'Huracan', 200000),
        ('Ferrari', '488', 250000),
        ('Bentley', 'Continental GT', 198000),
        ('Aston Martin', 'DB11', 201000),
        ('Rolls Royce', 'Ghost', 300000),
        ('Maserati', 'Ghibli', 70000),
        ('McLaren', '570S', 190000),
        ('Bugatti', 'Chiron', 3000000),
        ('Tesla', 'Model S', 80000);
    `);

            
    // Seed the cars table
    await pool.query(`
        INSERT INTO sales (car_id, customer_id, sale_date, sale_price) 
        VALUES 
        (1, 1, '2024-03-01', 88000),
        (2, 2, '2024-03-16', 195000),
        (3, 3, '2024-03-18', 245000),
        (4, 4, '2024-03-27', 193000),
        (5, 5, '2024-03-27', 196000);
    `);

    console.log("Database reset successful");
  } catch (error) {
    console.error("Database reset failed: ", error);
  } finally {
    // End the pool
    await pool.end();
  }
}

await resetDatabase();
