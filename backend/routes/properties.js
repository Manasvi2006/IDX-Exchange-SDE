// load express and create a router 
const express = require('express');
const router = express.Router();

// load the database connection pool from db.js
const db = require('../db');

// this function checks if the query params the user sent are valid
// it takes in all the filter values and returns a list of error messages
function validateQueryParams({ page, limit, minPrice, maxPrice, beds, baths }) {
  const errors = [];

  // page must be a real number and at least 1
  if (page !== undefined && (isNaN(page) || Number(page) < 1)) {
    errors.push('page must be a positive number');
  }

  // limit must be between 1 and 100 so there aren't like 10000 requests at once
  if (limit !== undefined && (isNaN(limit) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push('limit must be a number between 1 and 100');
  }

  // minPrice must be a real positive number
  if (minPrice !== undefined && (isNaN(minPrice) || Number(minPrice) < 0)) {
    errors.push('minPrice must be a positive number');
  }

  // maxPrice must be a real positive number
  if (maxPrice !== undefined && (isNaN(maxPrice) || Number(maxPrice) < 0)) {
    errors.push('maxPrice must be a positive number');
  }

  // checking if maxPrice is greater than minPrice
  if (minPrice !== undefined && maxPrice !== undefined && Number(minPrice) > Number(maxPrice)) {
    errors.push('minPrice cannot be greater than maxPrice');
  }

  // beds must be a real positive number
  if (beds !== undefined && (isNaN(beds) || Number(beds) < 0)) {
    errors.push('beds must be a positive number');
  }

  // baths must be a real positive number 
  if (baths !== undefined && (isNaN(baths) || Number(baths) < 0)) {
    errors.push('baths must be a positive number');
  }

  return errors;
}

// this handles GET requests to /api/properties
// async means it can wait for database responses without freezing the server
router.get('/', async (req, res) => {
  try {
    // pull the query params out of the URL
    // page and limit have defaults in case the user doesn't send them
    const {
      page = 1,
      limit = 20,
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds,
      baths
    } = req.query;

    // run validation on the inputs before doing anything else
    // if there are errors, stop here and send back a 400 (bad request) with details
    const errors = validateQueryParams({ page, limit, minPrice, maxPrice, beds, baths });
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Invalid query parameters', details: errors });
    }

    // calculate how many rows to skip based on the page number
    // ex: page 3 with limit 20 means skip the first 40 rows so it shows rows 41-60
    const offset = (Number(page) - 1) * Number(limit);


    // filters holds the SQL conditions and values holds the actual values to safely insert
    const filters = [];
    const values = [];

    // only add a filter if the user actually sent that param
    // using !== undefined means even a value of 0 gets included for the bug where 0 was ignored
    if (city !== undefined)     { filters.push('L_City = ?');         values.push(city); }
    if (zipcode !== undefined)  { filters.push('L_Zip = ?');          values.push(zipcode); }
    if (minPrice !== undefined) { filters.push('L_SystemPrice >= ?'); values.push(Number(minPrice)); }
    if (maxPrice !== undefined) { filters.push('L_SystemPrice <= ?'); values.push(Number(maxPrice)); }
    if (beds !== undefined)     { filters.push('L_Keyword2 = ?');     values.push(Number(beds)); }
    if (baths !== undefined)    { filters.push('LM_Dec_3 = ?');       values.push(Number(baths)); }

    // if there are any filters, join them with AND into a WHERE clause
    // if no filters were sent return everything
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // run the main query to get the actual property rows
    // LIMIT and OFFSET handle pagination so they only return the rows for this page
    const [rows] = await db.query(
      `SELECT * FROM rets_property ${where} LIMIT ? OFFSET ?`,
      [...values, Number(limit), Number(offset)]
    );

    // run a second query to count the total number of matching rows
    // this is needed so the frontend knows how many pages there are in total
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM rets_property ${where}`,
      values
    );

    // send the response back with the property data and pagination info
    res.json({
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        // round up to take partial pages into account
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  // if anything goes wrong like database is down or bad query it will catch the error
  // log it to the terminal and send back a 500 response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// export the router so index.js can mount it at /api/properties
module.exports = router;