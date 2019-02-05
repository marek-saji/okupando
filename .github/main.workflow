workflow "New workflow" {
  on = "push"
  resolves = ["Lint"]
}

action "Lint" {
  uses = "actions/npm@master"
  args = "run lint"
}
