include_recipe "build-essential"

include_recipe "apt"

include_recipe "php"

package "php-apc" do
  action :install
end

package "php5-mysql" do
  action :install
end

package "php5-intl" do
  action :install
end

include_recipe "apache2"

include_recipe "apache2::mod_php5"

web_app "app" do
  server_name node['hostname']
  server_aliases [node['hostname']]
  docroot "/vagrant"
  allow_override "All"
end
