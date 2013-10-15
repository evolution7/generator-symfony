# Symfony 2 app generator

Yeoman generator that scaffolds out a Symfony 2 PHP web app.

## Features

* Symfony 2 Standard Edition
* Built-in preview server with LiveReload
* Automagically compile Compass
* CSS Autoprefixing
* Leaner Modernizr builds

For more information on what `generator-symfony` can do for you, take a look at the [Grunt tasks](https://github.com/evolution7/generator-symfony/blob/master/app/templates/_package.json) used in our `package.json`.

## Prerequisites

Things you probably need:

- npm
- php
- php-intl
- composer
- compass
- vagrant
- VirtualBox

## Getting Started

- Install: `npm install -g generator-symfony`
- Run: `yo symfony`
- Run: 'grunt build' once
- Run `grunt watch` for development, point your browser at app_dev.php
- Run `grunt build` for production deployment/access via app.php

## Options

* `--skip-install`

  Skips the automatic execution of `bower`, `npm` and `composer` after scaffolding has finished.

## Contribute

`generator-symfony` is fork-friendly and you can always maintain a custom version which you `npm install && npm link` to continue using via `yo symfony` or a name of your choosing.

## License

[MIT license](https://github.com/evolution7/generator-symfony/blob/master/LICENSE)
Copyright (c) 2013, Evolution 7.
