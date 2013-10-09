# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.box = "precise64"

  config.vm.network :private_network, ip: "192.168.50.4"
  config.vm.network :public_network

  config.vm.synced_folder ".", "/vagrant", nfs: true
  
  config.vm.provision :chef_solo do |chef|
  
    chef.add_recipe "app"
  
  end

end
