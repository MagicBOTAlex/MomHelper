import { start as jobnetStart } from "./src/jobnet/jobnet.js";
import { start as aseStart } from "./src/ase/ase.js";

setTimeout(() => {
  const currentHost = window.location.hostname;

  if (currentHost === "ase.candeno.com" || currentHost === "mitase.ase.dk") {
    console.log("You are on ase");
    aseStart(currentHost === "mitase.ase.dk");
  } else if (currentHost.includes("jobnet.dk")) {
    console.log("You are on a jobnet.dk domain");
    jobnetStart();
  }
}, 1500);
