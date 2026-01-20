# gator

## Features

- Add RSS feeds from across the internet to be collected
- Store the collected posts in a PostgreSQL database
- Follow and unfollow RSS feeds that other users have added
- View summaries of the aggregated posts in the terminal, with a link to the full post

## Installation

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm package manager
- PostgreSQL 16+ (see [official docs](https://www.postgresql.org/docs/current/installation.html) for installation help)

### Setup

1. Clone the repository:

```
git clone https://github.com/maybethee/gator.git
cd gator
```

2. Install dependencies using npm:

```
npm install
```

3. Once connected to the server, create a new database:

```
sudo -u postgres psql
CREATE DATABASE gator;
```

4. Exit psql shell and run database migrations:

```
npm run migrate
```

## Usage

### Basic Usage

```
npm run start <command> <args>
```

### Available Commands

- help (lists commands/usage info)
- reset (resets database)
- register (registers a new user)
- login (logs in a registered user)
- users (lists all users)
- addfeed (adds a new feed to the database)
- feeds (lists all feeds in the database)
- follow (follows an existing feed in the database)
- unfollow (unfollows a followed feed)
- following (lists all feeds followed by logged in user)
- agg (regularly saves posts from followed feeds)
- browse (lists specified number of most recent posts from followed feeds)

## TODO

- make it more pleasant to look at
- add sorting and filtering options to the browse command
- add a TUI to view posts in CLI or redirect to browse

## Dependencies

- [drizzle-orm](https://orm.drizzle.team/)
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser/tree/master)
- [PostgreSQL](#prerequisites)

## License

This project is open source and available under the MIT License.
