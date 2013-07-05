module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    cafemocha:
      src: 'test/**/*.js'
      options:
        ui: 'tdd'

  grunt.loadNpmTasks "grunt-cafe-mocha"

  grunt.registerTask "test", "cafemocha"
  grunt.registerTask "default", ["cafemocha"]