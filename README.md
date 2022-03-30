# BackEnd NC News Project

This project is a backend news service, it has been designed with the intended purpose to be functional with the future frontend project to make a fully functioning website.

This server can be used to create topics and add articles as well as comment on the articles relevant to the topic that is being discussed, future additions will see like button integration with real time changes being added when a post is liked or when a comment is posted or even when an article is deleted.

It has been tested thoroughly to ensure a secure and reliable experience and it has been built as efficiently as possible.

# Hosting

> > hosting stuff will be added here <<

# Cloning the Repo

In order to clone the repository, you must enter the following commands into the terminal:

```bash
$ git clone https://github.com/YousefToast/Back-End-News-Project
$ cd nc-news
$ code .
```

# Installing dependencies

To ensure the right dependencies are added, just enter the following command into the vs code terminal:

```bash
$ npm install
```

This command should install all the dependencies used to create this project and should get you set up to use the repository.

# Seeding the Local Database

In order to seed the database, all you have to do is run 2 commands to create the database and run the data seed to populate the database with all the information:

```bash
$ npm run setup-dbs
$ npm run seed
```

# Running the tests

Finally to run the tests you need to run one command:

```bash
$ npm run test
```

Doing this will run the tests but do make sure that jest is installed in your package.json file.

# Creating your .env files

In order to connect the two databases, two .env files must be created. One will be for the test and the other for the development.
Once created ensure you add

```bash
'PGDATABASE="SQL-file-name-here"'
```

This will connect the two databases and make them accessible for any future
changes.

# Node.js and Postgres

For test and development, you will need Node.js and Postgres installed. The minimum Versions needed to run the project:

- NodeJS: v16.14
- Postgres: V14
