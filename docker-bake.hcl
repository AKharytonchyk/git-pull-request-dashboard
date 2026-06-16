# docker-bake.hcl — image build for the Diatreme TBD pipeline.
# tbd-ci.yaml / tbd-release.yaml inject:
#   VERSION    pr-<N> during CI, the semver tag during release (e.g. v1.4.0)
#   REGISTRY   container registry (default ghcr.io)
#   IMAGE_NAME <owner>/<base-name>, from the action's `image_name` input
#   PLATFORMS  comma-separated platforms
variable "VERSION"    { default = "latest" }
variable "REGISTRY"   { default = "ghcr.io" }
variable "IMAGE_NAME" { default = "magmamoose/git-pull-request-dashboard" }
variable "PLATFORMS"  { default = "linux/amd64,linux/arm64" }

group "default" {
  targets = ["app"]
}

target "app" {
  context    = "."
  dockerfile = "Dockerfile"
  platforms  = split(",", PLATFORMS)
  tags       = ["${REGISTRY}/${IMAGE_NAME}:${VERSION}"]
}
