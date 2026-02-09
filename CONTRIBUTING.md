# Contributing to Ask Ansar

Thank you for your interest in contributing to Ask Ansar! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Ask-Ansar.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m "Add your meaningful commit message"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting and naming conventions
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic

### Component Structure

```typescript
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export default function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

### Commit Messages

Follow conventional commit format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add voice input support
fix: resolve chat history loading issue
docs: update installation instructions
```

### Testing

- Test on both iOS and Android when possible
- Test on physical devices for best results
- Ensure the app works in both online and offline modes
- Test authentication flows thoroughly

### Database Changes

If you need to modify the database schema:

1. Create a new migration file in `supabase/migrations/`
2. Use descriptive migration names
3. Include rollback instructions in comments
4. Test migrations on a development database first

### Pull Request Process

1. Update the README.md if needed
2. Add screenshots for UI changes
3. Describe your changes in detail in the PR description
4. Link any related issues
5. Wait for code review and address feedback

## Areas for Contribution

### High Priority

- Improve AI response accuracy
- Add more Islamic topics to knowledge base
- Enhance search functionality
- Improve offline mode capabilities
- Add unit and integration tests

### Features Welcome

- Additional language support
- Dark mode improvements
- Accessibility enhancements
- Performance optimizations
- UI/UX improvements

### Documentation

- Tutorial videos
- API documentation
- Architecture diagrams
- User guides

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

Thank you for contributing to Ask Ansar!
