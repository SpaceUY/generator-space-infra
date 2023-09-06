/* eslint-disable camelcase */
"use strict";
const WorkspaceSetup = require("./workspaceSetup");
const chalk = require("chalk");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

module.exports = class extends WorkspaceSetup {
  async initializing() {
    const profile = this.config.get("profile");
    try {
      await exec(`aws --profile ${profile} iam get-user`);
    } catch (e) {
      this.env.error(e.stderr.trim());
    }
  }

  prompting() {
    const prompts = [
      {
        type: "input",
        name: "workspace",
        message: "Choose an initial workspace/environment to create",
        default: "staging"
      },
      ...this.tfVarsPrompt
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  async writing() {
    try {
      if (!this.config.get("remoteStateDeployed1")) {
        this.log(`Deploying ${chalk.cyan("remote-state")}...`);
        await exec("terraform -chdir=remote-state init");
        await exec("terraform -chdir=remote-state apply -auto-approve");
        this.config.set("remoteStateDeployed1", true);
      }

      if (!this.config.get("remoteStateDeployed2")) {
        this.log(
          `Setting up ${chalk.cyan("backend.conf")} for ${chalk.cyan(
            "remote-state"
          )}...`
        );
        const bucket = (
          await exec("terraform -chdir=remote-state output state_bucket")
        ).stdout
          .replace(/"/g, "")
          .trim();
        const region = (
          await exec("terraform -chdir=remote-state output region")
        ).stdout
          .replace(/"/g, "")
          .trim();
        const kms_key_id = (
          await exec("terraform -chdir=remote-state output kms_key")
        ).stdout
          .replace(/"/g, "")
          .trim();
        const dynamodb_table = (
          await exec("terraform -chdir=remote-state output dynamodb_table")
        ).stdout
          .replace(/"/g, "")
          .trim();
        this.fs.copyTpl(
          this.templatePath("backend.conf"),
          this.destinationPath("backend.conf"),
          {
            bucket,
            region,
            kms_key_id,
            dynamodb_table
          }
        );
        this.fs.copyTpl(
          this.templatePath("main.tf"),
          this.destinationPath("remote-state/main.tf"),
          {
            profile: this.config.get("profile")
          }
        );
      }

      const afterCommit = new Promise((resolve, reject) => {
        this.fs.commit([], async e => {
          if (e) {
            return reject(e);
          }

          try {
            if (!this.config.get("remoteStateDeployed2")) {
              this.log("Migrating state to s3 backend...");
              await exec(
                "terraform -chdir=remote-state init -backend-config=../backend.conf -force-copy"
              );
              this.log(`${chalk.cyan("remote-state")} setup complete!`);
              this.config.set("remoteStateDeployed2", true);
            }

            this.log(`Deploying ${chalk.cyan("infrastructure")}...`);
            await exec(
              "terraform -chdir=infrastructure init -backend-config=../backend.conf"
            );
            await this.addWorkspace(
              this.props.workspace,
              this.props.frontDomain,
              this.props.backDomain,
              this.props.frontendAcmArn,
              this.props.backendAcmArn
            );
            this.log(
              `Infrastructure ready to deploy! Make any additional changes (if needed) and run ${chalk.cyan(
                `npm run apply:${this.props.workspace}`
              )}`
            );
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
      await afterCommit;
    } catch (e) {
      console.error("Error encountered:");
      console.error(e);
    }
  }
};
