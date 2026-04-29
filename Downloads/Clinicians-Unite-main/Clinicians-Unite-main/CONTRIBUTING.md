# Contributing to Clinicians Unite

## Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others succeed

## Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Write tests for new features
5. Commit with clear messages
6. Push to your fork
7. Create a Pull Request

## Branch Naming Convention
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

## Commit Message Format
```
type(scope): subject

body

footer
```

Examples:
- `feat(appointments): add appointment cancellation feature`
- `fix(auth): resolve token expiration issue`
- `docs(readme): update installation instructions`

## Pull Request Process
1. Update documentation
2. Add tests for new functionality
3. Ensure all tests pass
4. Follow the PR template
5. Request reviews from maintainers
6. Address review comments
7. Squash commits before merge

## Development Standards
- Use TypeScript
- Follow ESLint configuration
- Write meaningful tests (aim for >80% coverage)
- Use conventional commits
- Update docs for API changes

## Testing
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## Questions?
Open an issue or contact the maintainers.
