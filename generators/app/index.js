"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");

module.exports = class extends Generator {
  prompting() {
    const prompts = [
      {
        type: "input",
        name: "project",
        message:
          "Project Name. Keep short (16 characters or less); Used in AWS resources",
        validate: input =>
          /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(input) ||
          "Please input an alphanumerical name using only single dashes as dividers"
      },
      {
        type: "input",
        name: "profile",
        message: "AWS Profile Name",
        validate: input =>
          /^[a-z]+$/.test(input) ||
          "Please input only an alphabetical name in lowercase"
      },
      {
        type: "list",
        name: "region",
        message: "Which region will resources be deployed to",
        choices: [
          "us-east-1",
          "us-east-2",
          "us-west-1",
          "us-west-2",
          "af-south-1",
          "ap-east-1",
          "ap-south-1",
          "ap-northeast-1",
          "ap-northeast-2",
          "ap-northeast-3",
          "ap-southeast-1",
          "ap-southeast-2",
          "ca-central-1",
          "eu-central-1",
          "eu-north-1",
          "eu-west-1",
          "eu-west-2",
          "eu-west-3",
          "eu-south-1",
          "me-south-1",
          "sa-east-1"
        ],
        default: 0
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  configuring() {
    this.config.set("profile", this.props.profile);
    this.config.set("project", this.props.project);
    this.config.set("region", this.props.region);
  }

  writing() {
    this.fs.copy(
      this.templatePath(".gitignore"),
      this.destinationPath(".gitignore")
    );
    this.fs.copyTpl(
      this.templatePath("package.json"),
      this.destinationPath("package.json"),
      {
        appname: this.appname,
        awsprofile: this.props.profile
      }
    );
    this.fs.copy(
      this.templatePath("infrastructure/**"),
      this.destinationPath("infrastructure")
    );
    this.fs.copy(
      this.templatePath("remote-state/outputs.tf"),
      this.destinationPath("remote-state/outputs.tf")
    );
    this.fs.copy(
      this.templatePath("remote-state/variables.tf"),
      this.destinationPath("remote-state/variables.tf")
    );
    this.fs.copyTpl(
      this.templatePath("remote-state/main.tf"),
      this.destinationPath("remote-state/main.tf"),
      {
        profile: this.props.profile
      }
    );
    this.fs.copyTpl(
      this.templatePath("main.tf"),
      this.destinationPath("infrastructure/main.tf"),
      {
        profile: this.props.profile
      }
    );
    this.fs.copyTpl(
      this.templatePath("terraform.tfvars"),
      this.destinationPath("remote-state/terraform.tfvars"),
      {
        project: this.props.project,
        region: this.props.region
      }
    );
  }

  install() {
    this.installDependencies({
      npm: true,
      bower: false,
      yarn: false
    });
  }

  end() {
    this.log(
      `Template Bootstrapped! Make sure to assign valid aws credentials to the ${chalk.blue(
        this.props.profile
      )} profile.`
    );
    this.log(`Once ready, run ${chalk.blue("yo space-infra:deploy")}.`);
  }
};
