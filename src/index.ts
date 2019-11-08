import boundExeca from 'lib/verify-dependency';


async function main() {
  try {
    await Promise.all([
      // async () => {
      //   const git = await boundExeca('git ^2.23.0');
      //   console.log(`We have Git version: ${git.version}`);
      //   const result = await git('status');
      //   console.log(result.stdout);
      // },
      async () => {
        const docker = await boundExeca('docker >=19.0.0');
        console.log(`We have Docker version: ${docker.version}`);
        const result = await docker('images ls');
        console.log(result.stdout);
      },
      async () => {
        // console.log(await assertExe('tar', {version: '>=3.0.0'}));
      },
    ].map(fn => fn()));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}


export default main();
