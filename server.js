const express = require("express");
const solr = require("solr-client");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());

const client = solr.createClient({
  host: "localhost",
  port: "8989",
  core: "",
  path: "/solr",
});

app.post("/createCollection", (req, res) => {
  const { collectionName } = req.body;
  client.createCollection(collectionName, (err) => {
    if (err) res.status(500).json({ message: "Error creating collection", error: err });
    else res.json({ message: `Collection ${collectionName} created successfully` });
  });
});

app.post("/indexDataFromCSV", (req, res) => {
  const { collectionName, excludeColumn } = req.body;
  const csvFilePath = path.resolve(__dirname, "Employee Sample Data 1.csv");
  const data = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      delete row[excludeColumn];
      data.push(row);
    })
    .on("end", () => {
      client.core = collectionName;
      client.add(data, (err) => {
        if (err) res.status(500).json({ message: "Error indexing data", error: err });
        else res.json({ message: "Data indexed successfully from CSV" });
      });
    })
    .on("error", (err) => {
      res.status(500).json({ message: "Error reading CSV file", error: err });
    });
});

app.get("/searchByColumn", (req, res) => {
  const { collectionName, columnName, columnValue } = req.query;
  client.core = collectionName;
  const query = client.createQuery().q(`${columnName}:${columnValue}`);
  client.search(query, (err, result) => {
    if (err) res.status(500).json({ message: "Search error", error: err });
    else res.json({ results: result.response.docs });
  });
});

app.get("/getEmpCount", (req, res) => {
  const { collectionName } = req.query;
  client.core = collectionName;
  const query = client.createQuery().q("*:*").rows(0);
  client.search(query, (err, result) => {
    if (err) res.status(500).json({ message: "Error fetching count", error: err });
    else res.json({ count: result.response.numFound });
  });
});

app.delete("/delEmpById", (req, res) => {
  const { collectionName, employeeId } = req.body;
  client.core = collectionName;
  client.deleteByID(employeeId, (err) => {
    if (err) res.status(500).json({ message: "Error deleting employee", error: err });
    else res.json({ message: `Employee with ID ${employeeId} deleted` });
  });
});

app.get("/getDepFacet", (req, res) => {
  const { collectionName } = req.query;
  client.core = collectionName;
  const query = client.createQuery()
    .q("*:*")
    .facet({
      field: "Department",
      mincount: 1,
    });
  client.search(query, (err, result) => {
    if (err) res.status(500).json({ message: "Error fetching department facet", error: err });
    else res.json({ facets: result.facet_counts.facet_fields.Department });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
