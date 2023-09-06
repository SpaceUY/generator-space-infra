const Generator = require("yeoman-generator");

// eslint-disable-next-line no-useless-escape
const regexDomain = /^(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}$/;

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.tfVarsPrompt = [
      {
        type: "input",
        name: "frontDomain",
        message: "URL for Frontend (Excluding http/https)",
        validate: input => regexDomain.test(input)
      },
      {
        type: "input",
        name: "backDomain",
        message: "URL for Backend (Excluding http/https)",
        default: ans => `api.${ans.frontDomain}`,
        validate: input => regexDomain.test(input)
      },
      {
        type: "input",
        name: "frontendAcmArn",
        message: "ARN of SSL Certificate in ACM for frontend"
      },
      {
        type: "input",
        name: "backendAcmArn",
        message: "ARN of SSL Certificate in ACM for backend",
        default: ans => ans.frontendAcmArn
      }
    ];
  }

  async addWorkspace(
    name,
    frontendDomain,
    backendDomain,
    frontendAcmArn,
    backendAcmArn
  ) {
    const workspaces = this.config.get("workspaces") || [];
    this.fs.write(
      this.destinationPath(`infrastructure/environments/${name}.tfvars`),
      `region = "${this.config.get("region")}"\nproject = "${this.config.get(
        "project"
      )}"\nfrontend_domain = "${frontendDomain}"\nbackend_domain = "${backendDomain}"\nfrontend_acm_arn = "${frontendAcmArn}"\nbackend_acm_arn = "${backendAcmArn}"\n`
    );
    const packageJson = this.fs.readJSON(this.destinationPath("package.json"));
    packageJson.scripts = {
      ...packageJson.scripts,
      [`workspace:${name}`]: `terraform -chdir=infrastructure workspace select ${name}`,
      [`apply:${name}`]: `npm run workspace:${name} && terraform -chdir=infrastructure apply -var-file=environments/${name}.tfvars`
    };
    this.fs.writeJSON("package.json", packageJson);
    workspaces.push(name);
    this.config.set("workspaces", workspaces);
  }
};
