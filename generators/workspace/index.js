"use strict";
const WorkspaceSetup = require("../../util/workspaceSetup");
const chalk = require("chalk");

module.exports = class extends WorkspaceSetup {
  constructor(args, opts) {
    super(args, opts);
    this.argument("name", { type: String, required: true });
  }

  initializing() {
    this.workspaces = this.config.get("workspaces");
    if (this.workspaces.includes(this.options.name)) {
      this.log(`${chalk.cyan(this.options.name)} is already in use!`);
      this.env.error("Workspace already exists");
    }
  }

  prompting() {
    const prompts = [...this.tfVarsPrompt];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  async writing() {
    try {
      await this.addWorkspace(
        this.props.workspace,
        this.props.frontendDomain,
        this.props.backendDomain,
        this.props.frontendAcmArn,
        this.props.backendAcmArn
      );
      this.log(
        `New workspace created! To deploy, run ${chalk.cyan(
          `npm run apply:${this.props.workspace}`
        )}`
      );
    } catch (e) {
      console.error("Error encountered:");
      console.error(e);
    }
  }
};
