const fs = require('fs')
const chalk = require('chalk')
const prompts = require('prompts')

const phpHead = `<?php
`
const phpTail = `
?>`

function makeTagTitleCase (str) {
  return str.split('-').map(str => str.charAt(0) ? str.charAt(0).toUpperCase() + str.substring(1) : str).join(' ')
}

exports = module.exports = class StencilParser {
  constructor (options, docs) {
    this.options = options
    this.docs = docs
  }

  /* Sample docs
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

  makeShortcodes () {
    const comps = this.docs.components
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
    $${prop.name} = $atts['${prop.attr.replace(/-/g, '_')}'];`
        props += ` ${prop.attr}="$${prop.name}"`
      })

      const lowerDashed = comp.tag.replace(/-/g, '_')
      const phpFunction = `function ${lowerDashed}_function($atts = [], $content = null, $tag = '') {${decls}
    return '<${comp.tag} ${props}></${comp.tag}>';
}`

      const addFunction = `add_shortcode('${lowerDashed}', '${lowerDashed}_function');`

      return `${phpFunction}
        
${addFunction}`
    })

    const concatted = shortcodes.join('\n\n')

    if (this.options.dry || this.options.debug) {
      console.log(chalk.blueBright.bold('WP Shortcodes\n'))
      console.log(chalk.white.bold(concatted + '\n\n\n'))
    }

    return phpHead + concatted + phpTail
  }

  makeBakerMap (comp) {
    const propList = []
    const snakeCaseTag = comp.tag.replace(/-/g, '_')
    const titleCaseTag = makeTagTitleCase(comp.tag)

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

      const titleCaseProp = makeTagTitleCase(prop.attr)

      const typeMap = new Map([['boolean', 'checkbox']])
      const type = typeMap.has(prop.type) ? typeMap.get(prop.type) : 'textfield'

      propList.push(`
      array(
        "type" => "${type}",
        "holder" => "div",
        "class" => "",
        "heading" => __("${titleCaseProp}"),
        "param_name" => "${prop.attr.replace(/-/g, '_')}",
        "value" => __(${prop.default ? prop.default : '""'}),
        "description" => ("${prop.docs}"),
      )`)
    })

    const hasContent = comp.slots.length > 0
    let containerBoilerplate = ''

    if (hasContent) {
      containerBoilerplate = `
      
      if ( class_exists( 'WPBakeryShortCodesContainer' ) ) {
        class WPBakeryShortCode_${snakeCaseTag} extends WPBakeryShortCodesContainer {}
      }
      `
    }

    return `
  vc_map( array(
    "name" => __("${titleCaseTag}"),
    "base" => "${snakeCaseTag}",
    "category" => __('${this.options.category ? this.options.category : 'ParserGenerated'}'),
    "params" => array(${propList.join(',')})
  )); ${containerBoilerplate}
  `
  }

  makeBakerMaps () {
    const comps = this.docs.components
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

    const maps = comps.map(this.makeBakerMap.bind(this))
    const mapsStr = maps.join('\n')

    if (this.options.dry || this.options.debug) {
      console.log(chalk.blueBright.bold('WP Page Baker shortcode map php code'))
      console.log(chalk.white.bold(mapsStr))
    }

    return phpHead + mapsStr + phpTail
  }

  async outputShortcodes () {
    const shortcodeFile = this.makeShortcodes()
    await this.writeOutput(this.options['shortcode-path'], shortcodeFile)
  }

  async outputBakerMaps () {
    const bakerFile = this.makeBakerMaps()
    await this.writeOutput(this.options['baker-path'], bakerFile)
  }

  async writeOutput (path, data) {
    let shouldWriteFile = true
    if (!this.options.yes && fs.existsSync(path)) {
      shouldWriteFile = (await prompts({
        type: 'confirm',
        name: 'value',
        message: `Overwrite existing file at ${path}? (use -y to overwrite automatically)`,
        initial: false
      })).value
    }

    if (shouldWriteFile) {
      fs.writeFile(path, data, (err) => {
        if (err) console.error(err)
      })

      console.log(chalk.blueBright.bold('Wrote generated file to:'), path)
    }
  }

  async outputAll () {
    await this.outputShortcodes()
    await this.outputBakerMaps()
  }
}
