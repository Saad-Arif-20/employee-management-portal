# Git Commands & Best Practices Guide

A comprehensive guide to Git version control for developers.

---

## Table of Contents
1. [Git Basics](#git-basics)
2. [Essential Commands](#essential-commands)
3. [Daily Workflow](#daily-workflow)
4. [Branching Strategy](#branching-strategy)
5. [Best Practices](#best-practices)
6. [Common Scenarios](#common-scenarios)
7. [Troubleshooting](#troubleshooting)

---

## Git Basics

### What is Git?
Git is a **distributed version control system** that tracks changes in your code over time. It allows multiple developers to work on the same project without conflicts.

### Key Concepts

**Repository (Repo)**: A folder containing your project and its entire history
**Commit**: A snapshot of your code at a specific point in time
**Branch**: A parallel version of your code
**Remote**: A version of your repository hosted on a server (e.g., GitHub, Azure DevOps)
**Clone**: A copy of a remote repository on your local machine

---

## Essential Commands

### 1. Setup & Configuration

```bash
# Set your name (appears in commits)
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Check your configuration
git config --list

# Set default branch name to 'main'
git config --global init.defaultBranch main
```

---

### 2. Creating & Cloning Repositories

```bash
# Initialize a new Git repository
git init

# Clone an existing repository
git clone <repository-url>

# Clone to a specific folder
git clone <repository-url> <folder-name>
```

**Example:**
```bash
git clone https://dev.azure.com/valus-io/v-web-team-projects/_git/coreview-react
```

---

### 3. Checking Status

```bash
# See what files have changed
git status

# See what's different in your files
git diff

# See differences in staged files
git diff --staged

# View commit history
git log

# View compact commit history
git log --oneline

# View history with graph
git log --graph --oneline --all
```

---

### 4. Staging & Committing

```bash
# Stage a specific file
git add <filename>

# Stage all changes
git add .
git add -A

# Stage only modified files (not new files)
git add -u

# Unstage a file
git restore --staged <filename>

# Commit staged changes
git commit -m "Your commit message"

# Stage and commit in one command
git commit -am "Your commit message"

# Amend the last commit (change message or add files)
git commit --amend
```

**Commit Message Best Practices:**
```bash
# Good commit messages
git commit -m "feat: Add user authentication"
git commit -m "fix: Resolve login button alignment issue"
git commit -m "docs: Update README with installation steps"
git commit -m "refactor: Simplify data fetching logic"

# Bad commit messages (avoid these)
git commit -m "fixed stuff"
git commit -m "changes"
git commit -m "asdfasdf"
```

---

### 5. Branching

```bash
# List all branches
git branch

# Create a new branch
git branch <branch-name>

# Switch to a branch
git checkout <branch-name>

# Create and switch to a new branch
git checkout -b <branch-name>

# Delete a branch
git branch -d <branch-name>

# Force delete a branch
git branch -D <branch-name>

# Rename current branch
git branch -m <new-name>
```

**Example Workflow:**
```bash
# Create a feature branch
git checkout -b feature/add-login

# Work on your feature...
git add .
git commit -m "feat: Add login form"

# Switch back to main
git checkout main

# Delete the feature branch (after merging)
git branch -d feature/add-login
```

---

### 6. Merging

```bash
# Merge a branch into current branch
git merge <branch-name>

# Merge without fast-forward (creates merge commit)
git merge --no-ff <branch-name>

# Abort a merge
git merge --abort
```

---

### 7. Remote Repositories

```bash
# View remote repositories
git remote -v

# Add a remote repository
git remote add <name> <url>

# Remove a remote
git remote remove <name>

# Rename a remote
git remote rename <old-name> <new-name>

# Change remote URL
git remote set-url <name> <new-url>
```

**Example:**
```bash
# Add Azure DevOps as remote
git remote add origin https://dev.azure.com/valus-io/v-web-team-projects/_git/coreview-react

# Add GitHub as another remote
git remote add github https://github.com/username/repo.git
```

---

### 8. Pushing & Pulling

```bash
# Push to remote repository
git push <remote> <branch>

# Push and set upstream (first time)
git push -u origin main

# Push all branches
git push --all

# Force push (DANGEROUS - use with caution)
git push --force

# Safer force push
git push --force-with-lease

# Pull changes from remote
git pull

# Pull from specific remote/branch
git pull <remote> <branch>

# Fetch changes without merging
git fetch

# Fetch from all remotes
git fetch --all
```

---

### 9. Undoing Changes

```bash
# Discard changes in working directory
git restore <filename>

# Discard all changes
git restore .

# Unstage a file
git restore --staged <filename>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert a commit (creates new commit)
git revert <commit-hash>

# Reset to a specific commit
git reset --hard <commit-hash>
```

---

### 10. Stashing

```bash
# Save current changes temporarily
git stash

# Save with a message
git stash save "Work in progress on feature X"

# List all stashes
git stash list

# Apply most recent stash
git stash apply

# Apply and remove stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Delete a stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

---

## Daily Workflow

### Starting Your Day

```bash
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Create a feature branch
git checkout -b feature/new-feature

# 4. Start coding!
```

### During Development

```bash
# Check what you've changed
git status

# Stage your changes
git add .

# Commit your changes
git commit -m "feat: Add new feature"

# Push to remote
git push -u origin feature/new-feature
```

### Ending Your Day

```bash
# Save work in progress
git stash save "WIP: Working on feature X"

# Or commit and push
git add .
git commit -m "WIP: Partial implementation of feature X"
git push
```

---

## Branching Strategy

### Common Branch Types

```
main (or master)
├── develop
│   ├── feature/user-authentication
│   ├── feature/dashboard-redesign
│   └── feature/api-integration
├── hotfix/critical-bug-fix
└── release/v1.2.0
```

### Branch Naming Conventions

```bash
# Features
feature/add-login
feature/user-profile
feature/payment-integration

# Bug fixes
fix/login-button-alignment
fix/memory-leak
bugfix/crash-on-startup

# Hotfixes (urgent production fixes)
hotfix/security-patch
hotfix/critical-error

# Releases
release/v1.0.0
release/v2.1.0

# Documentation
docs/update-readme
docs/api-documentation

# Refactoring
refactor/simplify-auth-logic
refactor/optimize-database-queries
```

---

## Best Practices

### 1. Commit Often, Push Regularly

✅ **DO:**
```bash
# Make small, focused commits
git commit -m "feat: Add login form"
git commit -m "feat: Add form validation"
git commit -m "style: Improve login button styling"
```

❌ **DON'T:**
```bash
# One massive commit with everything
git commit -m "Added entire authentication system with styling and tests"
```

---

### 2. Write Meaningful Commit Messages

✅ **DO:**
```bash
git commit -m "fix: Resolve null pointer exception in user profile"
git commit -m "feat: Add email validation to registration form"
git commit -m "docs: Update API documentation for auth endpoints"
```

❌ **DON'T:**
```bash
git commit -m "fixed bug"
git commit -m "changes"
git commit -m "stuff"
```

**Conventional Commits Format:**
```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting, semicolons, etc.)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks
```

---

### 3. Never Commit Sensitive Data

❌ **NEVER commit:**
- API keys
- Passwords
- Database credentials
- `.env` files with secrets
- Private keys
- Access tokens

✅ **Instead:**
```bash
# Use .gitignore
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
echo "secrets/" >> .gitignore

# Use environment variables
# Create .env.example as a template
DATABASE_URL=your_database_url_here
API_KEY=your_api_key_here
```

---

### 4. Use .gitignore Properly

```bash
# .gitignore example for Node.js project
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
```

---

### 5. Pull Before Push

```bash
# Always pull before pushing
git pull origin main
git push origin main

# If conflicts occur, resolve them before pushing
```

---

### 6. Review Before Committing

```bash
# Check what you're about to commit
git status
git diff

# Stage files
git add .

# Review staged changes
git diff --staged

# Commit
git commit -m "Your message"
```

---

### 7. Keep Your Branch Up to Date

```bash
# Regularly merge main into your feature branch
git checkout feature/my-feature
git merge main

# Or rebase (cleaner history)
git rebase main
```

---

### 8. Don't Force Push to Shared Branches

❌ **NEVER do this on main/develop:**
```bash
git push --force origin main
```

✅ **Only force push on your own feature branches:**
```bash
git push --force origin feature/my-feature
```

---

## Common Scenarios

### Scenario 1: Accidentally Committed to Wrong Branch

```bash
# You're on main but should be on a feature branch
git checkout -b feature/my-feature  # Create correct branch
git checkout main                   # Go back to main
git reset --hard HEAD~1             # Undo commit on main
git checkout feature/my-feature     # Your commit is safe here
```

---

### Scenario 2: Need to Undo Last Commit

```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes and commit
git reset --hard HEAD~1
```

---

### Scenario 3: Merge Conflicts

```bash
# When you see conflicts after merge/pull
git status  # See conflicted files

# Open files and resolve conflicts
# Look for markers:
<<<<<<< HEAD
Your changes
=======
Their changes
>>>>>>> branch-name

# After resolving
git add <resolved-files>
git commit -m "Merge: Resolve conflicts"
```

---

### Scenario 4: Forgot to Create Feature Branch

```bash
# You made changes on main by mistake
git stash                           # Save your changes
git checkout -b feature/my-feature  # Create feature branch
git stash pop                       # Apply your changes
git add .
git commit -m "feat: My feature"
```

---

### Scenario 5: Need to Remove File from Git (but keep locally)

```bash
# Remove from Git but keep on disk
git rm --cached <filename>

# Add to .gitignore
echo "<filename>" >> .gitignore

# Commit
git commit -m "chore: Remove sensitive file from Git"
```

---

### Scenario 6: Accidentally Committed node_modules

```bash
# Remove from Git
git rm -r --cached node_modules

# Add to .gitignore
echo "node_modules/" >> .gitignore

# Commit
git commit -m "chore: Remove node_modules from repository"
git push
```

---

## Troubleshooting

### Problem: "fatal: not a git repository"

**Solution:**
```bash
# Initialize Git in the directory
git init
```

---

### Problem: "Your branch is ahead of 'origin/main' by X commits"

**Solution:**
```bash
# Push your commits
git push origin main
```

---

### Problem: "Updates were rejected because the tip of your current branch is behind"

**Solution:**
```bash
# Pull first, then push
git pull origin main
git push origin main
```

---

### Problem: "Merge conflict"

**Solution:**
```bash
# 1. See conflicted files
git status

# 2. Open and resolve conflicts manually

# 3. Stage resolved files
git add <resolved-files>

# 4. Complete the merge
git commit -m "Merge: Resolve conflicts"
```

---

### Problem: "Detached HEAD state"

**Solution:**
```bash
# Create a branch from current state
git checkout -b recovery-branch

# Or go back to a branch
git checkout main
```

---

## Quick Reference Cheat Sheet

```bash
# Setup
git config --global user.name "Name"
git config --global user.email "email@example.com"

# Create/Clone
git init
git clone <url>

# Status
git status
git log --oneline

# Stage & Commit
git add .
git commit -m "message"

# Branch
git branch                    # List
git checkout -b <branch>      # Create and switch
git checkout <branch>         # Switch
git branch -d <branch>        # Delete

# Remote
git remote -v
git remote add origin <url>

# Push & Pull
git pull
git push
git push -u origin main

# Undo
git restore <file>            # Discard changes
git reset --soft HEAD~1       # Undo commit, keep changes
git reset --hard HEAD~1       # Undo commit, discard changes

# Stash
git stash
git stash pop
git stash list
```

---

## Additional Resources

- **Official Git Documentation**: https://git-scm.com/doc
- **GitHub Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Interactive Git Tutorial**: https://learngitbranching.js.org/
- **Git Visualizer**: https://git-school.github.io/visualizing-git/

---

**Remember**: Git is a powerful tool, but it takes practice. Don't be afraid to experiment in a test repository!

**Last Updated**: December 2025
