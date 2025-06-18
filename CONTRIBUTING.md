# Contributing to Serverless Event API

Thank you for considering contributing to this project!

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the mock API server:
   ```
   npm run mock-api
   ```

3. In a separate terminal, run the frontend server:
   ```
   npm run frontend
   ```

4. Open your browser to http://localhost:8081

## Project Structure

- `/functions` - Lambda function code
- `/frontend` - Frontend HTML/CSS/JS
- `/scripts` - Utility scripts
- `/tests` - Test files

## Code Style

- Use consistent indentation (2 spaces)
- Follow ESLint rules
- Write meaningful commit messages

## Testing

Before submitting a pull request, please test your changes:

1. Test the API endpoints
2. Test the frontend functionality
3. Ensure responsive design works on different screen sizes

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.