const fs = require('fs')
const yargs = require('yargs')
const chalk = require('chalk')

const options = yargs
  .usage('Usage: <filename.json> -c')
  .option('category', { alias: 'c', describe: 'WP Page Baker category' })
  .command('filename.json')
  .demandCommand(1)
  .argv

const pathSpecified = options._[0]
// Get content from specified
const docsContent = fs.readFileSync(pathSpecified)
// Define to JSON type
const docsJson = JSON.parse(docsContent)

/*
    {
      "filePath": "src\\components\\login\\login.tsx",
      "encapsulation": "shadow",
      "tag": "login",
      "readme": "# login\n\n\n",
      "docs": "",
      "docsTags": [],
      "usage": {},
      "props": [],
      "methods": [],
      "events": [],
      "styles": [],
      "slots": [],
      "dependents": [],
      "dependencies": [],
      "dependencyGraph": {}
    }
 */
const comps = docsJson.components

function makeShortcodes () {
  const shortcodes = comps.map(comp => {
    let props = ''
    let decls = ''
    comp.props.forEach(prop => {
      /* sample prop
           {
             "name": "intProp",
             "type": "number",
             "mutable": false,
             "attr": "int-prop",
             "reflectToAttr": false,
             "docs": "",
             "docsTags": [],
             "values": [
               {
                 "type": "number"
               }
             ],
             "optional": false,
             "required": false
           }
           */
      //  props
      decls += `
  $${prop.name} = $atts['${prop.name}'];`
      props += ` ${prop.attr}="$${prop.name}"`
    })

    const lowerDashed = comp.tag.replace(/-/g, '_')
    const phpFunction = `function ${lowerDashed}_function($atts = [], $content = null, $tag = '') {${decls}
  return '<${comp.tag} ${props}></${comp.tag}>';
}`

    const addFunction = `add_shortcode(${lowerDashed}, '${lowerDashed}_function');`

    return `${phpFunction}
    
${addFunction}`
  })

  const concatted = shortcodes.join('\n\n')

  console.log(chalk.blueBright.bold('WP Shortcodes\n'))
  console.log(chalk.white.bold(concatted + '\n\n\n'))

  return concatted
}

function makeBakerMaps () {
  /* Sample map
    vc_map( array(
      "name" => __("Bar tag test"),
      "base" => "bartag",
      "category" => __('Content'),
      "params" => array(
          array(
            "type" => "textfield",
            "holder" => "div",
            "class" => "",
            "heading" => __("Text"),
            "param_name" => "foo",
            "value" => __("Default params value"),
            "description" => __("Description for foo param.")
          )
      )
    ) );
  */

  // const propTypeMap = {
  //   'number': 'textfield'
  // }

  function makeBakerMap (comp) {
    const componentName = comp.tag
    let props = ''

    comp.props.forEach(prop => {
      /* Sample
        array(
            "type" => "textfield",
            "holder" => "div",
            "class" => "",
            "heading" => __("Text"),
            "param_name" => "foo",
            "value" => __("Default params value"),
            "description" => __("Description for foo param.")
          )
      */
    
      
      // let type = //typeMap[prop.type]
      props += `
    array(
      "type" => "textfield",
      "holder" => "div",
      "class" => "",
      "heading" => __("Text"),
      "param_name" => 
      "value" => __(${prop.default}),
      "description" => ("${prop.docs}"),
    )
      `
    })

    return `
vc_map( array(
  "name" => __("${componentName}"),
  "base" => "${comp.tag}",
  "category" => __('${options.category ? options.category : 'ParserGenerated'}'),
  "params" => array(${props})
) );`
  }

  const maps = comps.map(makeBakerMap)

  console.log(chalk.blueBright.bold('WP Page Baker shortcode map php code'))
  console.log(chalk.white.bold(maps.join('\n\n')))
  return maps
}

makeShortcodes()
makeBakerMaps()
