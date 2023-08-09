terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.16.0"
    }
  }

  backend "s3" {
    key = "terraform.tfstate"
    profile = "<%= profile %>"
  }
}

provider "aws" {
  region = var.region
  profile = "<%= profile %>"

  default_tags {
    tags = {
      "Managed By" = "Terraform"
      Project      = var.project
      Workspace    = terraform.workspace
    }
  }
}

locals {
  name_prefix = "${var.project}--${terraform.workspace}"
}
