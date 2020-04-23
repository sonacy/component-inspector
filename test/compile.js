const path = require('path')
const webpack = require('webpack')
const fs = require('memfs')
const joinPath = require('memory-fs/lib/join')

function ensureWebpackMemoryFs(fs) {
  // Return it back, when it has Webpack 'join' method
  if (fs.join) {
    return fs
  }

  // Create FS proxy, adding `join` method to memfs, but not modifying original object
  const nextFs = Object.create(fs)
  nextFs.join = joinPath

  return nextFs
}

module.exports = (fixture, options = {}) => {
  const compiler = webpack({
    mode: 'development',
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.tsx$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
            {
              loader: path.resolve(__dirname, '../dist/inpector-loader.js'),
            },
          ],
        },
      ],
    },
  })

  compiler.outputFileSystem = ensureWebpackMemoryFs(fs)

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)

      if (stats && stats.hasErrors()) reject(new Error(stats.toJson().errors))

      resolve(stats)
    })
  })
}
