const fs = require('fs')
const yargs = require('yargs')
const sanitize = require('sanitize-filename')
const StencilParser = require('./stencil-parser')

const cliOptions = yargs
  .usage('Usage: <filename.json>')
  .version()
  .option('category', { type: 'string', alias: 'c', describe: 'WP Page Baker category' })
  .option('dry', { type: 'bool', alias: 'dr', describe: 'Dry run, output to console instead of files' })
  .option('baker-path', { type: 'string', alias: 'bp', describe: 'WP Page baker output path', default: 'gen-baker.php' })
  .option('shortcode-path', { type: 'string', alias: 'sp', describe: 'WP Shortcode php file output path', default: 'gen-shortcodes.php' })
  .coerce(['baker-path', 'shortcode-path'], sanitize)
  .option('yes', { alias: 'y', describe: 'Automatically overwrite files and skip all prompts' })
  .option('debug', { alias: 'd', describe: 'Enable debug logs, log generated files (but still write files)' })
  .command('filename.json')
  .demandCommand(1)
  .argv

if (cliOptions.debug) {
  console.log('Yargs Argv', cliOptions)
}

const pathSpecified = cliOptions._[0]
// Get content from specified
const docsContent = fs.readFileSync(pathSpecified)
// Define to JSON type
const docsJson = JSON.parse(docsContent)


new StencilParser(cliOptions, docsJson).outputAll()