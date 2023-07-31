source "https://rubygems.org"

# gem "jekyll", "~> 4.2.2"

group :jekyll_plugins do
  gem "github-pages", "~> 228"
  gem "jekyll-paginate", "~> 1.1"
  gem "jekyll-paginate-multiple", "~> 0.1.0"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

gem "webrick", "~> 1.8.1"

gem "kramdown", "~> 2.3"
gem "rogue", "~> 0.1.1"
