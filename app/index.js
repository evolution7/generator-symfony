'use strict';
var fs = require('fs');
var util = require('util');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');

var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({
      skipInstall: options['skip-install'],
      skipMessage: options['skip-install-message'],
      callback: function(res) {
        if (this.runComposer) {
          spawn('composer', ['update']);
        }
      }.bind(this)
    });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));

  // Defaults
  this.symfonyStandardDistribution = {
    username: 'symfony',
    repository: 'symfony-standard',
    commit: '2.3'
  };

};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.welcomeMessage = function welcomeMessage() {
  if (!this.options['skip-welcome-message']) {
    console.log(this.yeoman);
  }
};

AppGenerator.prototype.checkComposer = function checkComposer() {
  var cb = this.async();
  // Check if composer is installed globally
  this.runComposer = false;
  exec('composer', ['-V'], function (error, stdout, stderr) {
    if (error != null) {
      var prompts = [{
        type: 'confirm',
        name: 'continue',
        message: 'WARNING: Composer not found. Please install globally. Continue?',
        default: false
      }];
      this.prompt(prompts, function (answers) {
        if (answers.continue) {
          console.log('Please run composer after this generator completes.');
          console.log('See http://getcomposer.org for details.');
          console.log('');
          cb();  
        }
      }.bind(this));
    } else {
      this.runComposer = true;
      cb();
    }
  }.bind(this));
};

AppGenerator.prototype.askSymfonyStandard = function askSymfonyStandard() {
  var cb = this.async();

  var prompts = [{
    type: 'confirm',
    name: 'symfonyStandard',
    message: 'Would you like to use the Symfony "Standard Edition" distribution',
    default: true
  }];

  this.prompt(prompts, function (answers) {

    if (answers.symfonyStandard) {

      // Use symfony standard edition
      this.symfonyDistribution = this.symfonyStandardDistribution;

    } else {

      // Use custom distribution
      this.symfonyDistribution = null;

    }

    cb();
  }.bind(this));
};

AppGenerator.prototype.askSymfonyCustom = function askSymfonyCustom() {
  // Check if not using standard distribution
  if (this.symfonyDistribution == null) {
    var cb = this.async();

    console.log('Please provide GitHub details of the Symfony distribution you would like to use.');
    console.log('e.g. http://github.com/[username]/[repository]/tree/[commit].');

    var prompts = [
    {
      type: 'input',
      name: 'symfonyUsername',
      message: 'Username',
      default: this.symfonyStandardDistribution.username
    },
    {
      type: 'input',
      name: 'symfonyRepository',
      message: 'Repository',
      default: this.symfonyStandardDistribution.repository
    },
    {
      type: 'input',
      name: 'symfonyCommit',
      message: 'Commit (commit/branch/tag)',
      default: this.symfonyStandardDistribution.commit
    }
    ];

    this.prompt(prompts, function (values) {

      var repo = 'https://github.com/'
        + values.symfonyUsername
        + '/'
        + values.symfonyRepository
        + '/tree/'
        + values.symfonyCommit;

      console.log('Thanks! I\'ll use ' + repo);
      console.log('');

      // Use custom symfony distribution
      this.symfonyDistribution = {
        username: values.symfonyUsername,
        repository: values.symfonyRepository,
        commit: values.symfonyCommit
      };

      cb();
    }.bind(this));
  }
}

AppGenerator.prototype.askCssExtension = function askCssExtension() {
  var cb = this.async();

  var prompts = [{
    type: 'list',
    name: 'cssExtension',
    message: 'Which CSS extension tool would you like to use?',
    default: 'sass',
    choices: ['sass', 'compass']
  }];

  this.prompt(prompts, function (answers) {

    if (answers.cssExtension) {
      this.cssExtension = answers.cssExtension;
    } else {
      this.cssExtension = 'sass';
    }

    cb();
  }.bind(this));
};

AppGenerator.prototype.askFeatures = function askFeatures() {
  var cb = this.async();

  if (!this.options['skip-welcome-message']) {
    console.log('Out of the box I include Symfony, HTML5 Boilerplate, jQuery and Sass.');
  }

  var prompts = [{
    type: 'checkbox',
    name: 'features',
    message: 'What more would you like?',
    choices: [{
      name: 'Vagrant (requires "precise64" box)',
      value: 'vagrant',
      checked: true
    },
    {
      name: 'inuit.css',
      value: 'inuit',
      checked: true
    }, {
      name: 'Bootstrap',
      value: 'bootstrap',
      checked: false
    }]
  }];

  this.prompt(prompts, function (answers) {
    var features = answers.features;

    function hasFeature(feat) { return features.indexOf(feat) !== -1; }

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.vagrant = hasFeature('vagrant');
    this.inuit = hasFeature('inuit');
    this.bootstrap = hasFeature('bootstrap');

    cb();
  }.bind(this));
};

AppGenerator.prototype.symfonyBase = function symfonyBase() {
  var cb = this.async();
  var appPath = this.destinationRoot();
  this.remote(this.symfonyDistribution.username,
              this.symfonyDistribution.repository, 
              this.symfonyDistribution.commit,
              function (err, remote) {
                if (err) {
                  return cb(err);
                }
                remote.directory('app', path.join(appPath, 'app'));
                remote.directory('src', path.join(appPath, 'src'));
                remote.directory('web', path.join(appPath, 'web'));
                cb();
              });
}

AppGenerator.prototype.symfonyClear = function symfonyClear() {
  var cb = this.async();
  var custom = [
    'web/app_dev.php',
    'app/AppKernel.php',
    'app/config/config_dev.yml',
    'app/config/routing.yml',
    'app/Resources/views/base.html.twig',
    'src/Acme/DemoBundle/Resources/views/layout.html.twig'
  ];
  custom.forEach(function(file) {
    if (fs.existsSync(path.join(this.destinationRoot(),file))) {
      fs.unlinkSync(path.join(this.destinationRoot(),file));
    }
  }.bind(this));
  cb();
}

AppGenerator.prototype.symfonyCustom = function symfonyCustom() {
  this.copy('symfony/composer.json', 'composer.json');
  this.copy('symfony/app_dev.php', 'web/app_dev.php');
  this.copy('symfony/AppKernel.php', 'app/AppKernel.php');
  this.copy('symfony/config_dev.yml', 'app/config/config_dev.yml');
  this.copy('symfony/routing.yml', 'app/config/routing.yml');
  this.copy('symfony/base.html.twig', 'app/Resources/views/base.html.twig');
  this.copy('symfony/layout.html.twig', 'src/Acme/DemoBundle/Resources/views/layout.html.twig');
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('_Gruntfile.js', 'Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.template('_bower.json', 'bower.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.styles = function styles() {
  this.copy('styles/app.scss', 'web/styles/app.scss');
  this.copy('styles/print.css', 'web/styles/print.css');
};

AppGenerator.prototype.scripts = function scripts() {
  this.copy('scripts/app.js', 'web/scripts/app.js');
};

AppGenerator.prototype.gitInit = function gitInit() {
  var cb = this.async();
  spawn('git', ['init']).on('exit', function() {
    cb();
  });
}

AppGenerator.prototype.configureVagrant = function configureVagrant() {
  if (this.vagrant) {
    this.copy('vagrant/Vagrantfile', 'Vagrantfile');
    this.directory('vagrant/cookbooks', 'cookbooks');
    spawn('git', ['submodule','add','https://github.com/opscode-cookbooks/build-essential', 'cookbooks/build-essential']).on('exit', function() {
      spawn('git', ['submodule','add','https://github.com/opscode-cookbooks/ohai', 'cookbooks/ohai']).on('exit', function() {
        spawn('git', ['submodule','add','https://github.com/opscode-cookbooks/apt', 'cookbooks/apt']).on('exit', function() {
          spawn('git', ['submodule','add','https://github.com/opscode-cookbooks/apache2', 'cookbooks/apache2']).on('exit', function() {
            spawn('git', ['submodule','add','https://github.com/opscode-cookbooks/php', 'cookbooks/php']).on('exit', function() {
            });
          });
        });
      });
    });
  }
};

// AppGenerator.prototype.inuit = function inuit() {
//   if (this.inuit) {

//   }
// };

// AppGenerator.prototype.compass = function compass() {
//   if (this.compass) {

//   }
// };

// AppGenerator.prototype.bootstrap = function bootstrap() {
//   if (this.bootstrap) {

//   }
// };
