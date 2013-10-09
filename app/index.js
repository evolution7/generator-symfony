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
        this.spawnCommand('composer', ['update']);
      }.bind(this)
    });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  if (!this.options['skip-welcome-message']) {
    console.log(this.yeoman);
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
  this.remote('symfony', 'symfony-standard', 'v2.3.5', function (err, remote) {
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
  fs.unlink(path.join(this.destinationRoot(),'web/app_dev.php'));
  fs.unlink(path.join(this.destinationRoot(),'app/AppKernel.php'));
  fs.unlink(path.join(this.destinationRoot(),'app/Resources/views/base.html.twig'));
  fs.unlink(path.join(this.destinationRoot(),'src/Acme/DemoBundle/Resources/views/layout.html.twig'));
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

AppGenerator.prototype.manifests = function manifests() {
  this.mkdir('web/manifests');
  this.copy('manifests/header.html', 'web/manifests/header.html');
  this.copy('manifests/footer.html', 'web/manifests/footer.html');
}

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
    this.spawnCommand('git', ['submodule','add','https://github.com/opscode-cookbooks/build-essential', 'cookbooks/build-essential']);
    this.spawnCommand('git', ['submodule','add','https://github.com/opscode-cookbooks/ohai', 'cookbooks/ohai']);
    this.spawnCommand('git', ['submodule','add','https://github.com/opscode-cookbooks/apt', 'cookbooks/apt']);
    this.spawnCommand('git', ['submodule','add','https://github.com/opscode-cookbooks/apache2', 'cookbooks/apache2']);
    this.spawnCommand('git', ['submodule','add','https://github.com/opscode-cookbooks/php', 'cookbooks/php']);
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
