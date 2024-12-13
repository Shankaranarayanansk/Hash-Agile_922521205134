const solr = require('solr-client');
const fs = require('fs');
const fastCsv = require('fast-csv');
const { exec } = require('child_process');

const SOLR_HOST = process.env.SOLR_HOST || 'localhost';
const SOLR_PORT = process.env.SOLR_PORT || 8989;

function createSolrClient(collectionName) {
    return solr.createClient({
        core: collectionName,
        port: SOLR_PORT,
        host: SOLR_HOST,
        path: '/solr',
        secure: false
    });
}

async function execAsync(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve({ stdout, stderr });
        });
    });
}

async function checkIfCoreExists(coreName) {
    const command = `solr status`;
    const { stdout } = await execAsync(command);
    return stdout.includes(coreName);
}

async function createCollection(collectionName) {
    const exists = await checkIfCoreExists(collectionName);
    if (exists) {
        return `Collection '${collectionName}' already exists.`;
    }
    const command = `solr create -c ${collectionName}`;
    const { stdout } = await execAsync(command);
    return `Collection created: ${stdout}`;
}

async function readCsvFile(filePath) {
    const rows = [];
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(new Error(`CSV file not found at path: ${filePath}`));
            return;
        }
        fs.createReadStream(filePath)
            .pipe(fastCsv.parse({ headers: true }))
            .on('data', (row) => rows.push(row))
            .on('end', () => resolve(rows))
            .on('error', (err) => reject(err));
    });
}

async function clientAdd(client, documents) {
    return new Promise((resolve, reject) => {
        client.add(documents, (err, obj) => {
            if (err) {
                console.error('Error indexing documents:', err);
                reject(err);
            }
            resolve(obj);
        });
    });
}

async function indexData(collectionName, excludeColumn, csvFilePath) {
    const client = createSolrClient(collectionName);
    const documents = [];
    const rows = await readCsvFile(csvFilePath);
    for (const row of rows) {
        delete row[excludeColumn];
        documents.push(row);
    }
    await clientAdd(client, documents);
    client.commit();
    return `${documents.length} documents indexed successfully`;
}

async function searchByColumn(collectionName, columnName, columnValue) {
    const client = createSolrClient(collectionName);
    const query = client.query().q(`${columnName}:${columnValue}`);
    const result = await clientSearch(client, query);
    return result.response.docs;
}

async function clientSearch(client, query) {
    return new Promise((resolve, reject) => {
        client.search(query, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
}

async function getEmpCount(collectionName) {
    const client = createSolrClient(collectionName);
    const query = client.query().q('*:*').rows(0);
    const result = await clientSearch(client, query);
    return result.response.numFound;
}

async function delEmpById(collectionName, employeeId) {
    const client = createSolrClient(collectionName);
    await clientDeleteByID(client, employeeId);
    client.commit();
    return 'Employee deleted successfully';
}

async function clientDeleteByID(client, id) {
    return new Promise((resolve, reject) => {
        client.deleteByID(id, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
}

async function getDepFacet(collectionName) {
    const client = createSolrClient(collectionName);
    const query = client.query().q('*:*').facet({
        field: 'department',
        mincount: 1
    });
    const result = await clientSearch(client, query);
    return result.facet_counts.facet_fields.department;
}

(async () => {
    try {
        const v_nameCollection = 'Hash_Sankaranarayanan';
        const v_phoneCollection = 'Hash_2313'; 
        const csvFilePath = './data.csv'; 

        console.log(await createCollection(v_nameCollection));
        console.log(await createCollection(v_phoneCollection));

        console.log(await getEmpCount(v_nameCollection));

        console.log(await indexData(v_nameCollection, 'Department', csvFilePath));
        console.log(await indexData(v_phoneCollection, 'Gender', csvFilePath));

        console.log(await getEmpCount(v_nameCollection));

        console.log(await delEmpById(v_nameCollection, 'E02003'));

        console.log(await getEmpCount(v_nameCollection));

        console.log(await searchByColumn(v_nameCollection, 'Department', 'IT'));
        console.log(await searchByColumn(v_nameCollection, 'Gender', 'Male'));
        console.log(await searchByColumn(v_phoneCollection, 'Department', 'IT'));

        console.log(await getDepFacet(v_nameCollection));
        console.log(await getDepFacet(v_phoneCollection));
    } catch (error) {
        console.error('Error:', error);
    }
})();