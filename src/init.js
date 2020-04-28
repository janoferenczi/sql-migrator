import * as fs from 'fs'

module.exports = {
    init: () => {
        const configFilePath = require('./cli').configFilePath;

        fs.readFile(configFilePath, 'utf-8', (error) => {
            if(error) {
                const config = {
                    url: 'localhost',
                    port: '3306',
                    username: '',
                    password: '',
                    database: '',
                    migrationsPath: './migrations',
                };

                fs.writeFile(configFilePath, JSON.stringify(config, null, '\t'), (error) => {
                    console.log(error);
                });
            } else {
                throw new Error("Config file already exists");
            }
        }); 
    }
}
