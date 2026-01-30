import { start as jobnetStart } from "./src/jobnet/jobnet.js";
import { start as aseStart } from "./src/ase/ase.js";

setTimeout(() => {
  const currentHost = window.location.hostname;

  if (currentHost === "ase.candeno.com") {
    console.log("You are on ase.cardeno.com");
    aseStart();
  } else if (currentHost.includes("jobnet.dk")) {
    console.log("You are on a jobnet.dk domain");
    jobnetStart();
  }
}, 1500);
