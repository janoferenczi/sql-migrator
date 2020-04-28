import * as fs from 'fs'

module.exports = {
    getConfiguration: () => {
        const configContent = fs.readFileSync(require('./cli').configFilePath, 'utf-8');

        return JSON.parse(configContent);
    }
}
