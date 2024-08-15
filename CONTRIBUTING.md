# Welcome to the drikkeleker contribution guide <!-- omit in toc -->

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected on [drikkeleker.abakus.no](https://drikkeleker.abakus.no) ✨.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a pull request and getting it merging in.

## Are you new to open source contributing?

Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Report or find an issues

Issues are tracked in the [issues tab](https://github.com/webkom/drikkeleker/issues).

If you want to contribute but don't know what to do, the issue-tab is the place to go.

If you encounter any problem, feel free to add a new issue if it does not exist.

## How to contribute

### Create a fork and set up your local environment

> When you create a fork you have your own copy of the repository where you have full access, without requiring to be granted write access to this repo. After you push your changes to your fork you can create a pull request to this repository.

1. Create a fork of the repository.

- Using GitHub Desktop:

  - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
  - Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

2. Set up dev environment

- Install or update to **Node.js** if you don't already have it.

3. Create a working branch and start coding!

### Commit your changes

Before you commit your changes, ensure that the styling is up to code by running

```
yarn prettier
```

Commit the changes once you are happy with them. Commit messages are to be thoroughly written. Here are our "rules":

1. Write in the imperative mood ("Fix" instead of "Fixing", "Fixed", etc.).
2. Limit the subject line to 50 characters.
3. Capitalize only the first letter in the subject line.
4. Do not put a period at the end of the subject line.
5. Add a body (multi-line message) with an explanation, which means we do not recommend using `-m` argument when you run `git commit`.
6. Put a blank line between the subject line and the body.
7. Describe what was done and why, but not how.

Do this ✅

```txt
Fix foo to enable bar

This fixes the broken behavior of the component by doing xyz.
```

Not this ❌

```txt
fixed bug
```

Remember to amend your commits if the changes should have been part of a previous commit. Examples of this are formatting and misspellings. For more information on how to rewrite your Git history, read [this article](https://thoughtbot.com/blog/git-interactive-rebase-squash-amend-rewriting-history).

### Pull request

When you're finished with the changes, create a pull request, also known as a PR. This can be done from the GitHub UI or through the [GitHub CLI](https://cli.github.com/manual/gh_pr_create).

### Your PR is merged!

Congratulations 🎉🎉 Webkom thanks you ✨.

Once your PR is merged, your contributions will be publicly visible on [drikkeleker.abakus.no](https://drikkeleker.abakus.no).

If your contribution is deemed worthy, you might be qualified for a LEGO-pin! We will try to make contact, but please reach out if we don't manage.
