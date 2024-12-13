
# Solr Client Implementation Guide

This document explains how to use the provided Node.js code for managing and querying Solr collections. Follow the steps below to set up, configure, and execute the required functions.

---

## Prerequisites

Before using the code, ensure you have the following installed and configured:

1. **Node.js** (version 14+ recommended)
2. **Solr** (version 8+)
3. **CSV file** with employee data (place in the root directory, named `data.csv`).

---

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create an `.env` File

Create a `.env` file in the root directory with the following content:

```env
SOLR_HOST=localhost
SOLR_PORT=8989
SOLR_PATH=/solr
```

Replace `SOLR_HOST` and `SOLR_PORT` with your Solr server configuration if different.

---

## Functions Overview

The following functions are available in the code:

1. **`createCollection(collectionName)`**  
   Creates a new Solr collection with the given name.

2. **`indexData(collectionName, excludeColumn, csvFilePath)`**  
   Indexes data from a CSV file into the specified collection, excluding a specific column.

3. **`searchByColumn(collectionName, columnName, columnValue)`**  
   Searches for records in a collection where the column matches the specified value.

4. **`getEmpCount(collectionName)`**  
   Retrieves the total number of records in a collection.

5. **`delEmpById(collectionName, employeeId)`**  
   Deletes a record from a collection by its ID.

6. **`getDepFacet(collectionName)`**  
   Retrieves a facet count grouped by the `department` field.

---

## Execution Steps

Follow the sequence below to execute the functions:

### 1. Define Variables

Update the variables in the main function:

```javascript
const v_nameCollection = 'Hash_<YourName>';
const v_phoneCollection = 'Hash_<Last4DigitsOfYourPhone>';
const csvFilePath = './data.csv';
```

### 2. Execute the Functions in Order

Run the following commands in sequence:

#### a) Create Collections
```bash
createCollection(v_nameCollection);
createCollection(v_phoneCollection);
```

#### b) Get Employee Count (Before Indexing)
```bash
getEmpCount(v_nameCollection);
```

#### c) Index Data (Excluding Columns)
```bash
indexData(v_nameCollection, 'Department', csvFilePath);
indexData(v_phoneCollection, 'Gender', csvFilePath);
```

#### d) Get Employee Count (After Indexing)
```bash
getEmpCount(v_nameCollection);
```

#### e) Delete an Employee by ID
```bash
delEmpById(v_nameCollection, 'E02003');
```

#### f) Get Employee Count (After Deletion)
```bash
getEmpCount(v_nameCollection);
```

#### g) Search by Column
```bash
searchByColumn(v_nameCollection, 'Department', 'IT');
searchByColumn(v_nameCollection, 'Gender', 'Male');
searchByColumn(v_phoneCollection, 'Department', 'IT');
```

#### h) Retrieve Department Facet
```bash
getDepFacet(v_nameCollection);
getDepFacet(v_phoneCollection);
```

---

## Capturing Screenshots

For each function execution, capture a screenshot of the terminal output. Save the screenshots with filenames corresponding to each step (e.g., `Step_a_createCollection.png`).

---

## How to Run the Code

1. Run the Node.js script:

```bash
node index.js
```

2. Follow the terminal output to verify the execution of each function.

---

## Notes

- Ensure the Solr server is running on the configured host and port.
- The `data.csv` file must be properly formatted with columns matching the expected schema in Solr.
- For troubleshooting, refer to the error messages displayed in the terminal.

---

## Example CSV File Format

```csv
ID,Name,Department,Gender
E02001,John Doe,IT,Male
E02002,Jane Doe,HR,Female
E02003,Sam Smith,Finance,Male
```

---

## Expected Results

1. **Collection Creation**  
   Verify that the collections `Hash_<YourName>` and `Hash_<Last4DigitsOfYourPhone>` are created successfully.

2. **Indexing Data**  
   Check that records are indexed in the specified collections, excluding the mentioned columns.

3. **Search Results**  
   Ensure search queries return accurate results based on the input parameters.

4. **Facets**  
   Verify the department facet counts in the output.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

