module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    clean:
      tests:
        src : "test/**/*.js"

    cafemocha:
      src: 'test/**/*.js'
      options:
        ui: 'tdd'

    coffee:
      tests:
        expand: true
        flatten: true
        cwd: 'test'
        src: ['*.coffee']
        dest: 'test'
        ext: '.js'

    jshint:
      files: ["src/**/*.js"],
      options:
        expr: true
        strict: true
        latedef: true

    concat:
      options:
        separator: "\n\n\n"
        banner: grunt.file.read "build/banner.txt"
      dist:
        src: "src/enum.js"
        dest: "./enum.js"

    uglify:
      options:
        banner: grunt.file.read "build/banner.min.txt"
      build:
        src: "src/enum.js"
        dest: "./<%= pkg.name.replace('-','.') %>.min.js"

    copy:
      files: [
        src: ['path/*.js']
        dest: '../gh-pages/release/<%= pkg.version %>/'
      ]


  grunt.loadNpmTasks "grunt-cafe-mocha"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-copy"

  grunt.registerTask "precopy", ->
    pkg = grunt.config "pkg"
    dir = (grunt.config "copy").files[0].dest

    if !grunt.file.isDir(dir)
      grunt.file.mkdir(dir)
      grunt.log.ok "Directory created: " + dir
    else
      grunt.log.ok "Directory already exists: " + dir

  grunt.registerTask "test", ["coffee:tests", "cafemocha", "clean:tests", "jshint"]
  grunt.registerTask "build", ["test", "uglify", "precopy", "copy"]