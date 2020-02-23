## Stencil Wordpress/Wordpress Page Baker Shortcode Generator


Wordpress is old and weird, so let's use web components! But we need to get them into wordpress..as shortcodes.

But if you want to use shortcodes you need to wrap the web component's properties! And edit php files..and then possibly make a WP Page Baker map for those shortcodes!

We don't want all of that, so here's a script that generates these files for you. 


In your `stencil.config.ts` you can set this up as part of your build process:
```
    {
      type: 'docs-custom',
      generator: (docs: JsonDocs) => {
        const parser = new StencilParser({
          'baker-path': 'gen-baker.php',
          'shortcode-path': 'gen-shortcodes.php',
          yes: true,
          debug: true
        }, docs)
        
        parser.outputAll()
          // Custom logic goes here
      }
    }
```