'use strict';
var fs = require('fs');
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');

var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({
      skipInstall: options['skip-install'],
      skipMessage: options['skip-install-message'],
      callback: function(res) {
        spawn('composer', ['update']);
      }.bind(this)
    });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askSymfonyStandard = function askSymfonyStandard() {
  var cb = this.async();

  this.symfonyStandardDistribution = {
    username: 'symfony',
    repository: 'symfony-standard',
    commit: '2.3'
  };

  this.symfonyDistribution = null;

  if (!this.options['skip-welcome-message']) {
    console.log(this.yeoman);
  }

  var prompts = [{
    type: 'confirm',
    name: 'standard',
    message: 'Would you like to use the Symfony "Standard Edition" distribution',
    default: true
  }];

  this.prompt(prompts, function (answers) {

    if (answers.standard) {

      // Use symfony standard edition
      this.symfonyDistribution = this.symfonyStandardDistribution;

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
      name: 'username',
      message: 'Username',
      default: this.symfonyStandardDistribution.username
    },
    {
      type: 'input',
      name: 'repository',
      message: 'Repository',
      default: this.symfonyStandardDistribution.repository
    },
    {
      type: 'input',
      name: 'commit',
      message: 'Commit (commit/branch/tag)',
      default: this.symfonyStandardDistribution.commit
    }
    ];

    this.prompt(prompts, function (values) {

      var repo = 'https://github.com/'
        + values.username
        + '/'
        + values.repository
        + '/tree/'
        + values.commit;

      console.log('Thanks! I\'ll use ' + repo);
      console.log('');

      // Use custom symfony distribution
      this.symfonyDistribution = [{
        user: values.username,
        repo: values.repository,
        commit: values.commit
      }];

      cb();
    }.bind(this));
  }
}

AppGenerator.prototype.askFor = function askFor() {
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
    }
    // , {
    //   name: 'inuit.css',
    //   value: 'inuit',
    //   checked: true
    // }, {
    //   name: 'Compass',
    //   value: 'compass',
    //   checked: false
    // }, {
    //   name: 'Bootstrap',
    //   value: 'bootstrap',
    //   checked: false
    // }
    ]
  }];

  this.prompt(prompts, function (answers) {
    var features = answers.features;

    function hasFeature(feat) { return features.indexOf(feat) !== -1; }

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.vagrant = hasFeature('vagrant');
    // this.inuit = hasFeature('inuit');
    // this.compass = hasFeature('compass');
    // this.bootstrap = hasFeature('bootstrap');
    this.bootstrap = 0;

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

AppGenerator.prototype.scss = function scss() {
  this.copy('scss/screen.scss', 'web/scss/screen.scss');
  this.copy('scss/print.scss', 'web/scss/print.scss');
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
