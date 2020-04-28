import arg from 'arg';
const init = require('./init');
const versioner = require('./versioner');


function parseArgumentsIntoOptions(rawArgs) {
    const args = arg({
        '--init': String
    });

    return {
        command: args._[0] || false
    }
}

export const configFilePath = 'sql-migrator-conf.json';
export async function cli(args) {
    const options = parseArgumentsIntoOptions(args);
    const command = options['command'];

    if(command === 'init') {
        init.init();
    }
    
    if(command === 'status') {
        await versioner.status();
    }

}
