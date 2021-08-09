import arg from 'arg';
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import moment from 'moment';
import prompt from 'prompt';
import { exit } from 'process';
import dotenv from 'dotenv';

const SIM_CONFIG_FOLDERS = [
  'datapools',
  'authprofiles',
  'transferconfigs',
  'users'
];

function makeID(length) {
  let result = '';
  const characters = 'ABCDEF0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--env': String,
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    env: args['--env'] || false,
  };
}

const getProjectName = () => new Promise((resolve, reject) => {
  prompt.get(['projectName'], function (err, result) {
    resolve(result.projectName);
  });
});

const getSiteCode = () => new Promise((resolve, reject) => {
  prompt.get(['sitecode'], function (err, result) {
    resolve(result.sitecode);
  });
});

const replaceEnv = () => {

};


export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  let contents = '';

  const workingDir = process.cwd();
  if (!options.env || options.env === '') {
    console.error('You must specify an environment!');
    process.exit('You must specify an environment!');
  }

  // console.log(options.siteCode);

  const envFile = path.join(process.cwd(), `${options.env}.env`);
  console.log('envFile', envFile);

  try {
    contents = fs.readFileSync(envFile, 'utf8').toString()
  } catch (err) {
    console.error(err.message)
    exit();
  }

  const env = dotenv.parse(contents);

  const compileDir = path.join(process.cwd(), `__compiled_${options.env}`);

  if (!fs.existsSync(compileDir)) {
    fs.mkdirSync(compileDir);
  }

  fs.readdir(process.cwd(), function (err, files) {
    files.forEach(function (file, index) {

      if (file === `__compiled_${options.env}`) {
        return;
      }

      if (file.includes('.env')) {
        return;
      }

      var fromPath = path.join(process.cwd(), file);
      var toPath = path.join(compileDir, file);
      const stat = fs.statSync(fromPath);

      console.log('Copying: ', fromPath);

      fse.copySync(fromPath, toPath)

      if (SIM_CONFIG_FOLDERS.includes(file)) {

        const processFiles = fs.readdirSync(toPath);

        processFiles.forEach(function (processFile, index) {
          console.log('Processing file: ', processFile);

          const stat = fs.statSync(path.join(toPath, processFile));

          if (stat.isDirectory()) return;

          const fileBuffer = fs.readFileSync(path.join(toPath, processFile), 'utf8');

          let result = fileBuffer;

          for (const key of Object.keys(env)) {
            const find = new RegExp(`@${key}@`, 'g');
            const value = env[key];
            result = result.replace(find, value);
          }
          fs.writeFileSync(path.join(toPath, processFile), result, 'utf8');

        });

      }

    });

  });

  // const projectName = await getProjectName();

  // switch (options.template.toLowerCase()) {
  //   case 'avarn':
  //     // console.log('Avarn');
  //     if (!options.siteCode) {
  //       prompt.start();
  //       const siteCode = await getSiteCode();
  //       // console.log(siteCode);
  //       const enc = path.join(__dirname, 'AVARN_Template.dsc');
  //       contents = fs.readFileSync(enc, 'utf8').toString();

  //       contents = contents.replace(/Avarn/g, projectName);
  //       contents = contents.replace(/999/g, siteCode);

  //       const keys = [
  //         makeID(32),
  //         makeID(32),
  //         makeID(32),
  //       ];

  //       for (let i = 0; i < keys.length; i++) {
  //         contents = contents.replace('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', keys[i]);
  //       }

  //       // console.log(contents);

  //     }
  //     break;
  //   default:
  //     console.error('Requested template not found!');
  //     break;
  // }

  // const fileName = path.join(process.cwd(), `${ moment().format('YYYY-MM-DD') }_${ projectName }.dsc`);
  // // const fileName = path.join(process.cwd(), `test.html`);

  // const stream = fs.createWriteStream(fileName);

  // stream.once('open', function (fd) {
  //   stream.end(contents);
  //   console.log(`Created file ${ fileName }`);
  // });


}
