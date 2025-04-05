# Scrapper Project

A web scraping and presentation generation project using Node.js and various APIs.

## Table of Contents
-----------------

* [Introduction](#introduction)
* [Features](#features)
* [Getting Started](#getting-started)
* [Dependencies](#dependencies)


## Introduction
------------

This project uses web scraping and natural language processing to generate presentations from web pages. It utilizes various APIs to scrape web pages, summarize content, and generate slide variants.

## Features
--------

* Web scraping using Firecrawl API
* Content summarization using OpenAI API
* Slide variant generation using Alai API
* Presentation creation and management

## Getting Started
---------------

1. Clone the repository: 
2. Install dependencies: `npm install`
3. Set environment variables: `cp .env.sample .env` and update with your API keys
4. Adjust the `URL` in `index.js`
5. Run the script: `npm run script`

## Dependencies
------------

* `axios`: for making API requests
* `dotenv`: for environment variable management
* `firecrawl-js`: for web scraping
* `openai`: for content summarization
* `ws`: for WebSocket connections

