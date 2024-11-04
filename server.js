const express = require("express");
const solr = require("solr-client");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const app = express();
app.use(express.json());

// Create a client instance for Solr
const client = solr.createClient({
  host: "localhost",
  port: "8983",
  core: "hash-agile-shankar",
  path: "/solr",
});

// Endpoint to create a new collection
app.post("/createCollection", async (req, res) => {
  const { collectionName } = req.body;
  // Ensure that Solr is in SolrCloud mode for collection creation
  const solrUrl = `http://localhost:8983/solr/admin/collections?action=CREATE&name=${collectionName}&numShards=1&replicationFactor=1`;

  try {
    const response = await axios.get(solrUrl);
    res.json({ message: `Collection ${collectionName} created successfully`, response: response.data });
  } catch (err) {
    // Log full error details for debugging
    console.error("Collection creation error:", err.response ? err.response.data : err.message);
    res.status(500).json({ message: "Error creating collection", error: err.response ? err.response.data : err.message });
  }
});

// Endpoint to index data from a CSV file
app.post("/indexDataFromCSV", (req, res) => {
  const { excludeColumn } = req.body;
  const csvFilePath = path.resolve(__dirname, "Employee Sample Data 1.csv");
  const data = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      delete row[excludeColumn];
      data.push(row);
    })
    .on("end", () => {
      client.add(data, (err) => {
        if (err) res.status(500).json({ message: "Error indexing data", error: err });
        else res.json({ message: "Data indexed successfully from CSV" });
      });
    })
    .on("error", (err) => {
      res.status(500).json({ message: "Error reading CSV file", error: err });
    });
});

// Endpoint to search by a column value
app.get("/searchByColumn", (req, res) => {
  const { columnName, columnValue } = req.query;
  const query = `${columnName}:${columnValue}`;
  client.search(query, (err, result) => {
    if (err) res.status(500).json({ message: "Search error", error: err });
    else res.json({ results: result.response.docs });
  });
});

// Endpoint to get the count of all employees
app.get("/getEmpCount", (req, res) => {
  const query = "*:*";
  client.search(query, { rows: 0 }, (err, result) => {
    if (err) res.status(500).json({ message: "Error fetching count", error: err });
    else res.json({ count: result.response.numFound });
  });
});

// Endpoint to delete an employee by ID
app.delete("/delEmpById", (req, res) => {
  const { employeeId } = req.body;
  client.deleteByID(employeeId, (err) => {
    if (err) res.status(500).json({ message: "Error deleting employee", error: err });
    else res.json({ message: `Employee with ID ${employeeId} deleted` });
  });
});

// Endpoint to get department facet counts
app.get("/getDepFacet", (req, res) => {
  const query = "*:*";
  client.search(query, { facet: true, "facet.field": "Department", "facet.mincount": 1 }, (err, result) => {
    if (err) res.status(500).json({ message: "Error fetching department facet", error: err });
    else res.json({ facets: result.facet_counts.facet_fields.Department });
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
