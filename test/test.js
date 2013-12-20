/*global describe, beforeEach, it*/

var path    = require('path');
var helpers = require('yeoman-generator').test;
var assert  = require('assert');

describe('Symfony generator test', function () {
  var expected;
  beforeEach(function (done) {
    this.baseFiles = [
      
      'composer.json',
      'web/app_dev.php',
      'app/AppKernel.php',
      'app/config/config_dev.yml',
      'app/config/routing.yml',
      'app/Resources/views/base.html.twig',
      'src/Acme/DemoBundle/Resources/views/layout.html.twig',
      
      'Gruntfile.js',
      
      'package.json',

      '.gitignore',
      '.gitattributes',
      
      '.bowerrc',
      'bower.json',

      '.jshintrc',

      '.editorconfig',

      'web/styles/screen.scss',
      'web/styles/print.scss',
      
      'web/scripts/app.js',

      '.git'

    ];
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }
      this.symfony = helpers.createGenerator('symfony:app', [
        '../../app', [
          helpers.createDummyGenerator(),
          'mocha:app'
        ]
      ]);
      done();
    }.bind(this));
  });

  it('the generator can be required without throwing', function () {
    // not testing the actual run of generators yet
    this.app = require('../app');
  });

  it('creates expected files with Vagrant', function (done) {
    var expected = this.baseFiles;
    expected.push('Vagrantfile');
    expected.push('cookbooks');
    expected.push('cookbooks/app');
    
    helpers.mockPrompt(this.symfony, {
      symfonyStandard: 'y',
      // symfonyUsername: 'symfony',
      // symfonyRepository: 'symfony-standard',
      // symfonyCommit: '2.3',
      cssExtension: 'sass',
      features: [ 'vagrant' ]
    });

    this.symfony.options['skip-install'] = true;
    this.symfony.run({}, function () {
       helpers.assertFiles(expected);
       done();
    });
  });

  it('creates expected files without Vagrant', function (done) {
    var expected = this.baseFiles;

    helpers.mockPrompt(this.symfony, {
      symfonyStandard: 'y',
      // symfonyUsername: 'symfony',
      // symfonyRepository: 'symfony-standard',
      // symfonyCommit: '2.3',
      cssExtension: 'sass',
      features: [ ]
    });

    this.symfony.options['skip-install'] = true;
    this.symfony.run({}, function () {
       helpers.assertFiles(expected);
       done();
    });
  });
});
