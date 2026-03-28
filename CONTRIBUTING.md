# Contributing to OPenFeed
Thanks for taking the time to contribute ❤️ All types of contributions are encouraged and valued!

## How to Report a Bug
We use GitHub issues to track bugs and errors. If you run into an issue with the project:

1. **Open an Issue.**
2. **Explain the behavior you expected and the actual behavior.**
3. **Provide as much context as possible and describe the reproduction steps.**

A good bug report includes isolated code examples and steps to reproduce the issue.

## How to Request a New Feature

Enhancement suggestions are tracked as GitHub issues.

1. Use a clear and descriptive title for the issue.
2. Provide a detailed description of the enhancement.
3. Explain the current behavior and what you expect to happen.
4. Include screenshots or examples when applicable.
5. Describe why this enhancement would be useful for Dcup users.

Describe why this enhancement would be useful for Dcup users.

## How to Contribute Code to OpenFeed

### Working on Your First Pull Request?

## Opening a Pull Request
1. Fork the Repository:
```bash
git clone https://github.com/OpenFeed-ink/openfeed.git
cd openfeed
git remote add upstream https://github.com/OpenFeed-ink/openfeed.git
```
2. Sync Your Local Main Branch:
```bash
git checkout main
git pull upstream main
```
3. Install Dependencies:
```bash
npm install
```
4. Setting Up the Development Environment
    - Copy `.env.example` into `.env`: Update the .env file with your settings.
    - Launch Required Services: Start PostgreSQL, Redis
5. Start the Development Server:
```bash
npm run dev
```
6. Create a New Topic Branch:
```bash
git checkout -b feature/my-feature
```
7. Make Your Changes, Commit, and Push:
```bash
git push -u origin feature/my-feature
```
8. Open a Pull Request on GitHub:
Describe your changes clearly and reference any related issues.

### Merge Strategy

We use **squash & merge** to keep the main branch history clean.

Now you're ready to start building!

---

Happy coding! 🚀
