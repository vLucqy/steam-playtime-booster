import SteamUser from "steam-user";
import chalk from "chalk";
import fetch from "node-fetch";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

const client = new SteamUser();

client.logOn({
  //Do Not Delete the quotations !
  accountName: "YOUR_STEAM_USERNAME",
  password: "YOUR_STEAM_PASSWORD",
});

client.on("steamGuard", async (_, callback, lastCodeWrong) => {
  if (lastCodeWrong) {
    console.log(chalk.red("Steam Guard code was incorrect."));
  }

  const code = await rl.question("Steam Guard Code: ");
  callback(code.trim());
});

client.on("loggedOn", async () => {
  console.log(chalk.green("Logged in"));

  client.setPersona(SteamUser.EPersonaState.Online);

  const appId = Number(await rl.question("Enter AppID: "));

  if (Number.isNaN(appId)) {
    console.log(chalk.red("Invalid AppID"));
    process.exit(1);
  }

  client.gamesPlayed(appId);

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}`,
    );

    const data = await res.json();

    const gameName = data?.[appId]?.success
      ? data[appId].data.name
      : `Unknown Game (${appId})`;

    console.log(chalk.bgBlueBright.black(` ${gameName} `));

    console.log(`[${chalk.green("LOG")}]: Game launched successfully`);
  } catch (err) {
    console.log(`[${chalk.red("FETCH ERROR")}]:`, err.message);
  }
});

client.on("error", (err) => {
  console.log(`[${chalk.red("ERROR")}]:`, err.message);

  console.log(`[${chalk.yellow("ERESULT")}]:`, err.eresult);
});

client.on("disconnected", (eresult, msg) => {
  console.log(`[${chalk.red("DISCONNECTED")}]:`, eresult, msg);
});
