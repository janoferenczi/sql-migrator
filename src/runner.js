const configManager = require('./configManager');

module.exports = {
    runQuery: async (query, connection) => {
        return new Promise((resolve, reject) => {
            connection.query(query, (error, results) => {
                if(error)
                    reject(error)

                resolve(results);
            });
        });
    },
    connectAndRun: async (fun) => {
        const config = configManager.getConfiguration();
        const mysql = require('mysql');
        const connection = mysql.createConnection({
            host: config['url'],
            port: config['port'],
            user: config['username'],
            password: config['password'],
            database: config['database']
        });
        connection.connect();

        await fun(connection);

        connection.end();
    }
}
