# SDK React example

## Introduction

In this project we are using Unissey SDK React. It uses the component `FullCapture` to perform video recording and picture capture.


## Get a personnal access token

First generate an access token by following this link. Make sure to include at least the `repo` and `read:packages` permission to the access token.

## Setup the project

-   Clone the repository

```bash
git clone git@github.com:unissey/sdk-web-examples.git
```

-   Change directory to sdk-react-demo

```bash
cd sdk-react-demo
```

-   Authenticate to github npm registry

Create `NPM_TOKEN` environnment variable with your github personnal token

```bash
export NPM_TOKEN = <Your github personnal token>
```

-   Install dependencies

```bash
npm install
```

## Run the project

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and your are done!
