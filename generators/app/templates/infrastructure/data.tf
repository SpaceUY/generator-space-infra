# Rarely will need to set this variable
variable "region_number" {
  # Arbitrary mapping of region name to number to use in
  # a VPC's CIDR prefix.
  default = {
    us-east-1      = 1
    us-east-2      = 2
    us-west-1      = 3
    us-west-2      = 4
    af-south-1     = 5
    ap-east-1      = 6
    ap-south-1     = 7
    ap-northeast-1 = 8
    ap-northeast-2 = 9
    ap-northeast-3 = 10
    ap-southeast-1 = 11
    ap-southeast-2 = 12
    ca-central-1   = 13
    eu-central-1   = 14
    eu-north-1     = 15
    eu-west-1      = 16
    eu-west-2      = 17
    eu-west-3      = 18
    eu-south-1     = 19
    me-south-1     = 20
    sa-east-1      = 21
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

variable "bitbucket_pipelines_ips" {
  default = [
    "34.199.54.113/32",
    "34.232.25.90/32",
    "34.232.119.183/32",
    "34.236.25.177/32",
    "35.171.175.212/32",
    "52.54.90.98/32",
    "52.202.195.162/32",
    "52.203.14.55/32",
    "52.204.96.37/32",
    "34.218.156.209/32",
    "34.218.168.212/32",
    "52.41.219.63/32",
    "35.155.178.254/32",
    "35.160.177.10/32",
    "34.216.18.129/32",
    "3.216.235.48/32",
    "34.231.96.243/32",
    "44.199.3.254/32",
    "174.129.205.191/32",
    "44.199.127.226/32",
    "44.199.45.64/32",
    "3.221.151.112/32",
    "52.205.184.192/32",
    "52.72.137.240/32"
  ]
}
