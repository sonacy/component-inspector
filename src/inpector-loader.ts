const { getOptions } = require('loader-utils')
const { parse } = require('@babel/parser')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const { jsxAttribute, jsxIdentifier, stringLiteral } = require('@babel/types')

function InspectorLoader(this: any, source: string) {
  if (this.mode === 'development' || process.env.NODE_ENV === 'development') {
    const options = getOptions(this)
    const rootPath = this.rootContext
    const filePath = this.resourcePath
    let relativePath = filePath
    if (rootPath) {
      const idx = filePath.indexOf(rootPath)
      if (idx >= 0) {
        relativePath = filePath.slice(rootPath.length)
      }
    }

    if (options && options.exclude && options.exclude.length > 0) {
      const skipFiles = options.exclude.filter((x: string) => filePath.includes(x))
      if (skipFiles && skipFiles.length > 0) {
        return source
      }
    }

    const ast = parse(source, {
      sourceType: 'module',
      allowUndeclaredExports: true,
      allowImportExportEverywhere: true,
      plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'],
    })

    traverse(ast, {
      enter(path: any) {
        if (path.type === 'JSXOpeningElement') {
          const node = path.node as any
          if (node.name.name && node.name.name !== 'Fragment') {
            const filenameAttr = jsxAttribute(jsxIdentifier('data-inspector-filename'), stringLiteral(filePath))
            const lineAttr = jsxAttribute(
              jsxIdentifier('data-inspector-line'),
              stringLiteral(node.loc.start.line.toString())
            )
            const columnAttr = jsxAttribute(
              jsxIdentifier('data-inspector-column'),
              stringLiteral(node.loc.start.column.toString())
            )
            const relativePathAttr = jsxAttribute(
              jsxIdentifier('data-inspector-relative-path'),
              stringLiteral(relativePath)
            )
            node.attributes.push(filenameAttr, lineAttr, columnAttr, relativePathAttr)
          }
        }
      },
    })

    const { code } = generate(ast)

    return code
  }
  return source
}

module.exports = InspectorLoader
