# Git Workflow Guide: Publishing Changes

This guide outlines the process for publishing changes to the Southern MN Science Fair Web Platform project using Git.

## Workflow Steps

### 1. Ensure Your Local Repository is Up to Date

Before making changes, always ensure your local repository is up to date with the latest changes from the remote repository.

```bash
git checkout main
git pull origin main
```

### 2. Create a New Branch

Create a new branch for your feature or bug fix. Use a descriptive name that reflects the purpose of your changes.

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

Make the necessary changes to the code in your local environment.

### 4. Stage Your Changes

Add your changes to the staging area.

```bash
git add .
```

Or to stage specific files:

```bash
git add path/to/specific/file
```

### 5. Commit Your Changes

Commit your staged changes with a descriptive commit message.

```bash
git commit -m "Add a concise, descriptive commit message"
```

### 6. Push Your Branch to the Remote Repository

Push your local branch to the remote repository.

```bash
git push -u origin feature/your-feature-name
```

### 7. Create a Pull Request

Go to the project repository on GitHub and create a new pull request:

1. Click on "Pull requests"
2. Click "New pull request"
3. Select your branch as the compare branch
4. Review your changes
5. Click "Create pull request"
6. Add a title and description for your pull request
7. Assign reviewers if necessary
8. Click "Create pull request"

### 8. Address Review Comments

If reviewers suggest changes:

1. Make the requested changes locally
2. Stage and commit the changes
3. Push the new commits to the same branch
4. The pull request will update automatically

### 9. Merge the Pull Request

Once your pull request has been approved:

1. Click "Merge pull request" on GitHub
2. Click "Confirm merge"
3. Delete the branch if it's no longer needed

### 10. Update Your Local Repository

After the merge, update your local main branch:

```bash
git checkout main
git pull origin main
```

## Best Practices

1. **Commit Often**: Make small, frequent commits that encapsulate a single logical change.

2. **Write Clear Commit Messages**: Use clear, concise commit messages that explain what the change does and why.

3. **Keep Branches Updated**: Regularly merge or rebase your feature branch with the main branch to avoid conflicts.

4. **Review Your Own Code**: Before creating a pull request, review your own changes to catch any obvious issues.

5. **Respect the Code Review Process**: Be open to feedback and address all comments thoroughly.

6. **Don't Force Push to Shared Branches**: Avoid force pushing to branches that others might be working on.

7. **Use .gitignore**: Ensure your .gitignore file is up to date to avoid committing unnecessary files.

## Handling Merge Conflicts

If you encounter merge conflicts:

1. Pull the latest changes from the main branch
2. Resolve conflicts in your local environment
3. Stage the resolved files
4. Commit the merge resolution
5. Push the changes to your feature branch

```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main
# Resolve conflicts
git add .
git commit -m "Resolve merge conflicts"
git push origin your-feature-branch
```
