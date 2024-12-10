<div align="center">
<h1>CodSpeed Action</h1>

[![CI](https://github.com/CodSpeedHQ/action/actions/workflows/ci.yml/badge.svg)](https://github.com/CodSpeedHQ/action/actions/workflows/ci.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/CodSpeedHQ/action)](https://github.com/CodSpeedHQ/action/releases)
[![Discord](https://img.shields.io/badge/chat%20on-discord-7289da.svg)](https://discord.com/invite/MxpaCfKSqF)

GitHub Actions for running [CodSpeed](https://codspeed.io) in your CI.

</div>

# Usage

```yaml
- uses: CodSpeedHQ/action@v3
  with:
    # [REQUIRED for private repositories]
    # The CodSpeed upload token: can be found at https://codspeed.io/<org>/<repo>/settings
    # It's strongly recommended to use a secret for this value
    # If you're instrumenting a public repository, you can omit this value
    token: ""

    # [OPTIONAL]
    # The shell to run commands in.
    # Defaults to bash.
    # ⚠️ WARNING: if you use `defaults.run.shell`, you must still set this parameter.
    shell: ""

    # [REQUIRED]
    # The command used to run your codspeed benchmarks
    run: ""

    # [OPTIONAL]
    # The directory where the `run` command will be executed.
    # ⚠️ WARNING: if you use `defaults.run.working-directory`, you must still set this parameter.
    working-directory: ""

    # [OPTIONAL]
    # Comma-separated list of instruments to enable. Possible values: mongodb.
    instruments: ""

    # [OPTIONAL]
    # The name of the environment variable that contains the MongoDB URI to patch.
    # If not provided, user will have to provide it dynamically through a CodSpeed integration.
    # Only used if the `mongodb` instrument is enabled.
    mongo_uri_env_name: ""

    # [OPTIONAL]
    # A custom upload url, only if you are using an on premise CodSpeed instance
    upload-url: ""
```

# Example usage

## Python with `pytest` and [`pytest-codspeed`](https://github.com/CodSpeedHQ/pytest-codspeed)

This workflow will run the benchmarks found in the `tests/` folder and upload the results to CodSpeed.

It will be triggered on every push to the `main` branch and on every pull request.

```yaml
name: CodSpeed

on:
  push:
    branches:
      - "main" # or "master"
  pull_request:
  # `workflow_dispatch` allows CodSpeed to trigger backtest
  # performance analysis in order to generate initial data.
  workflow_dispatch:

jobs:
  benchmarks:
    name: Run benchmarks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v3
        with:
          python-version: "3.9"

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run benchmarks
        uses: CodSpeedHQ/action@v3
        with:
          token: ${{ secrets.CODSPEED_TOKEN }}
          run: pytest tests/ --codspeed
```

## Rust with `cargo-codspeed` and `codspeed-criterion-compat` / `codspeed-bencher-compat`

This workflow will run the benchmarks found in the `tests/` folder and upload the results to CodSpeed.

It will be triggered on every push to the `main` branch and on every pull request.

```yml
name: CodSpeed

on:
  push:
    branches:
      - "main" # or "master"
  pull_request:
  # `workflow_dispatch` allows CodSpeed to trigger backtest
  # performance analysis in order to generate initial data.
  workflow_dispatch:

jobs:
  name: Run benchmarks
  benchmarks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup rust toolchain, cache and cargo-codspeed binary
        uses: moonrepo/setup-rust@v0
        with:
          channel: stable
          cache-target: release
          bins: cargo-codspeed

      - name: Build the benchmark target(s)
        run: cargo codspeed build

      - name: Run the benchmarks
        uses: CodSpeedHQ/action@v3
        with:
          run: cargo codspeed run
          token: ${{ secrets.CODSPEED_TOKEN }}
```

## Node.js with `codspeed-node`, TypeScript and `vitest`

This workflow will run the benchmarks defined with `vitest`'s `bench` function and upload the results to CodSpeed.

It will be triggered on every push to the `main` branch and on every pull request.

```yml
name: CodSpeed

on:
  push:
    branches:
      - "main" # or "master"
  pull_request:
  # `workflow_dispatch` allows CodSpeed to trigger backtest
  # performance analysis in order to generate initial data.
  workflow_dispatch:

jobs:
  benchmarks:
    name: Run benchmarks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm install

      - name: Run benchmarks
        uses: CodSpeedHQ/action@v3
        with:
          run: npx vitest bench
          token: ${{ secrets.CODSPEED_TOKEN }}
```
