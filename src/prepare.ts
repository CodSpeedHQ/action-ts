import * as core from "@actions/core";
import {exec} from "@actions/exec";
import {checkValgrindVersion} from "./helpers/valgrind";
import {downloadFile} from "./helpers/fetch";
import {ActionInputs} from "./interfaces";

const VALGRIND_CODSPEED_VERSION = "3.21.0-0codspeed1";

interface SystemInfo {
  os: string;
  osVersion: string;
  arch: string;
}

const getSystemInfo = async (): Promise<SystemInfo> => {
  // execute lsb_release -r -s and return the output
  let output = "";
  let ret = await exec("lsb_release -i -r -s", [], {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  });
  if (ret !== 0) {
    throw new Error("Failed to get system info");
  }
  const [os, osVersion] = output.trim().split("\n");
  output = "";
  ret = await exec("dpkg --print-architecture", [], {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  });
  if (ret !== 0) {
    throw new Error("Failed to get system info");
  }
  const arch = output.trim();
  return {os, osVersion, arch};
};

const prepare = async (inputs: ActionInputs): Promise<void> => {
  core.startGroup("Prepare environment");
  try {
    const sysInfo = await getSystemInfo();
    core.debug(`OS: ${sysInfo.os}`);
    core.debug(`OS Version: ${sysInfo.osVersion}`);
    core.debug(`Arch: ${sysInfo.arch}`);
    if (sysInfo.os !== "Ubuntu") {
      throw new Error("Only Ubuntu is supported for now");
    }
    if (sysInfo.arch !== "amd64") {
      throw new Error("Only amd64 is supported for now");
    }
    if (!["20.04", "22.04"].includes(sysInfo.osVersion)) {
      throw new Error("Only Ubuntu 20.04 and 22.04 are supported for now");
    }

    const valgrindDebUrl =
      "https://github.com/CodSpeedHQ/valgrind-codspeed/releases/download/" +
      `${VALGRIND_CODSPEED_VERSION}/valgrind_${VALGRIND_CODSPEED_VERSION}_ubuntu-${sysInfo.osVersion}_amd64.deb`;
    core.debug(`Instaling valgrind from ${valgrindDebUrl}`);
    const debFilePath = "/tmp/valgrind-codspeed.deb";
    await downloadFile(valgrindDebUrl, debFilePath);

    const sudo = inputs.noSudo ? "" : "sudo ";
    // always update the `apt` index before installing
    await exec(`${sudo}apt update`, [], {silent: true});
    await exec(`${sudo}apt install ${debFilePath}`, [], {silent: true});
    await checkValgrindVersion();
    if (!inputs.noPipInstall) {
      try {
        await exec("pip show pytest-codspeed", [], {
          silent: true,
        });
      } catch (e) {
        core.warning(
          "pytest-codspeed is not installed in your environment. Installing it..."
        );
        await exec("pip install pytest-codspeed", [], {
          silent: true,
        });
      }
    }
  } catch (error) {
    throw new Error(`Failed to prepare environment: ${error}`);
  }
  core.info("Environment ready");
  core.endGroup();
};

export default prepare;
