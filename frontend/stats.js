const fs = require('fs');
const ts = require('ts-morph');
const path = require('path');
const glob = require('glob');

const getFileImports = (file) => {
  const project = new ts.Project();
  const sourceFile = project.createSourceFile(
    'dummy.ts',
    fs.readFileSync(path.join(__dirname, file), 'utf8')
  );
  const output = [];
  sourceFile.getImportDeclarations().forEach((importDecl) => {
    const module = importDecl.getModuleSpecifier().getLiteralText();
    const defaultimport = importDecl.getDefaultImport();
    if (defaultimport) {
      output.push({
        file,
        module,
        name: defaultimport.getText(),
        default: true,
      });
    }
    importDecl.getNamedImports().forEach((imp) => {
      output.push({
        file,
        module,
        name: imp.getName(),
        default: false,
      });
    });
  });
  return output;
};

const writeToFile = () => {
  const stream = fs.createWriteStream('stats.csv');
  glob(`${__dirname}/**/*.ts*`, {}, (err, files) => {
    stream.write(`${['file', 'module', 'name', 'default'].join(';')}\r\n`);
    files.forEach((file) => {
      if (!file.includes('node_modules')) {
        const short = file.substring(__dirname.length);
        getFileImports(short).forEach((stat) => {
          stream.write(`${Object.values(stat).join(';')}\r\n`);
        });
      }
    });
    stream.end();
    console.log('Done collecting stats');
  });
};

writeToFile();
