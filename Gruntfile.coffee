module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    clean:
      tests:
        src : "test/**/*.js"
      main:
        src: "./*.js"

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
        banner: grunt.file.read "build/banner.txt"
      dist:
        src: "src/enum.js"
        dest: "./enum.js"

    uglify:
      options:
        banner: grunt.file.read "build/banner.min.txt"
      build:
        src: "src/enum.js"
        dest: "./enum.min.js"

    copy:
      main:
        files: [
          src: ['./*.js']
          dest: '../gh-pages/release/<%= pkg.version %>/'
        ]

    cmd:
      "git-commit":
        cmd: "git"
        args: ['log', '-1', '--format="%H"']
        set: "git.commit"


  grunt.loadNpmTasks "grunt-cafe-mocha"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-concat"

  grunt.registerTask "precopy", ->
    pkg = grunt.config "pkg"
    dir = (grunt.config "copy").main.files[0].dest

    if !grunt.file.isDir(dir)
      grunt.file.mkdir(dir)
      grunt.log.ok "Directory created: " + dir
    else
      grunt.log.ok "Directory already exists: " + dir


  grunt.registerMultiTask "cmd", ->
    done = @async()
    set = @data.set

    grunt.util.spawn
      cmd: @data.cmd
      args: @data.args
    ,
    (error, result, code) ->
      if (error)
        done(false)
        grunt.fail.warn(error)
      else
        result = String result

        grunt.config(set, result);
        grunt.log.ok result

        done()

  grunt.registerTask "test", ["coffee:tests", "cafemocha", "clean:tests", "jshint"]
  grunt.registerTask "build", ["cmd:git-commit", "test", "clean:main", "concat", "uglify", "precopy", "copy"]