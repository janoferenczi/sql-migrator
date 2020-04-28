const runner = require('./runner');
const configManager = require('./configManager');
const crypto = require('crypto');

const versionTableName = 'migrations';

function checksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

createVersionTableIfNotExists = async () => {
    const config = configManager.getConfiguration();
    const databaseName = config['database'];

    await runner.connectAndRun(async (connection) => {
        const findMigrationTableQuery =
            `SELECT * FROM information_schema.tables WHERE 
                              table_schema = '${databaseName}' AND 
                              table_name = '${versionTableName}'`;

        const isMigrationTableResult = await runner.runQuery(findMigrationTableQuery, connection);

        if (isMigrationTableResult.length === 0) {
            await runner.runQuery(`CREATE TABLE ${versionTableName} (
                                    id INT PRIMARY KEY AUTO_INCREMENT, 
                                    version VARCHAR(32),
                                    checksum VARCHAR(32),
                                    applied BOOLEAN)`, connection);
        }
    });
};

readMigrationsFromDB = async () => {
    return new Promise((resolve, reject) => {
        runner.connectAndRun(async (connection) => {
            const migrationsResult = await runner.runQuery(`SELECT * FROM ${versionTableName}`, connection);
            resolve(migrationsResult);
        });
    });
};

listFilesWithPrefix = (prefix) => {
    const fs = require('fs');
    const config = configManager.getConfiguration();

    try {
        const migrationsPath = config['migrationsPath'];

        const files = fs.readdirSync(migrationsPath);
        return files
            .filter(f => f.startsWith(prefix) && f.endsWith('.sql'))
            .map(file => {
                const sqlFileContent = fs.readFileSync(migrationsPath + '/' + file);
                return {
                    version: file.substr(1, 5),
                    path: migrationsPath + '/' + file,
                    checksum: checksum(sqlFileContent)
                };
            });
    } catch (e) {
        throw e;
    }
}

listMigrationFiles = () => {
    return listFilesWithPrefix('V');
};

listUndoFiles = () => {
    return listFilesWithPrefix('U');
}

module.exports = {
    status: async () => {
        await createVersionTableIfNotExists();
        const migrationFiles = listMigrationFiles();
        const migrationsInDB = await readMigrationsFromDB();

        migrationFiles.forEach(migrationFile => {
            const migrationInDB = migrationsInDB.find(m => m.version === migrationFile.version);

            if(migrationInDB) {
                if(migrationFile.checksum === migrationInDB.checksum) {
                    migrationFile['status'] = 'Done';
                } else {
                    migrationFile['status'] = 'Discrepancy'
                }
            } else {
                migrationFile['status'] = 'Pending';
            }

        });

        console.log(migrationFiles);
    }
};
