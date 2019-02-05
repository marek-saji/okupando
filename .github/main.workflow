workflow "Main" {
  on = "push"
  resolves = ["Lint"]
}

action "Build" {
  uses = "actions/npm@master"
  args = "install"
}

action "Lint" {
  uses = "actions/npm@master"
  needs = ["Build"]
  args = "run lint"
}
