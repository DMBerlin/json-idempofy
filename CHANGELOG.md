# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0](https://github.com/DMBerlin/json-idempofy/compare/v1.0.0...v1.0.0) (2024-01-01)

### 🚀 Features

#### Core Fingerprinting Engine

- **4 Fingerprinting Strategies**: strict, selective, semantic, and custom strategies for different use cases
- **Multiple Hashing Algorithms**: SHA-256, SHA-512, HMAC-SHA256, and HMAC-SHA512 with configurable secret keys
- **JSON Canonicalization Scheme (JCS)**: RFC 8785 compliant deterministic JSON serialization
- **Nested Field Access**: Dot notation and bracket indexing for deep object traversal (`user.profile.name`, `items[0].id`)
- **Field Transformations**: Built-in transformations (`$lower`, `$upper`, `$trim`, `$round`, `$date`, `$if`, `$default`, `$replace`, `$exists`)

#### Developer Experience

- **TypeScript Support**: Full type safety with comprehensive interfaces
- **Zero Dependencies**: Uses only Node.js built-in modules (`crypto`, `JSON.stringify`)
- **Multiple API Styles**: Static methods (`Idempofy.strict()`) and detailed results (`Idempofy.detailed()`)
- **Collision Risk Assessment**: Built-in risk evaluation for different hash lengths
- **Comprehensive Error Handling**: Detailed error messages and validation

#### Quality & Testing

- **95.89% Test Coverage**: 145 comprehensive tests covering all functionality
- **Coverage Enforcement**: Pre-commit hooks and CI pipeline enforce 90% coverage thresholds
- **Quality Gates**: ESLint, Prettier, Husky, and Commitlint for code quality
- **CI/CD Pipeline**: Automated testing, linting, and release workflows
- **Performance Optimized**: Single consolidated implementation for nested field access

#### Real-World Use Cases

- **Open Finance Integration**: Prevents duplicate transactions when switching providers
- **Microservice Idempotency**: Reliable fingerprinting for API transactions
- **Data Deduplication**: Identifies identical payloads across different systems
- **Audit Trails**: Consistent hashing for compliance and tracking

### 🛠️ Technical Implementation

#### Hashing & Security

- **HMAC Support**: Keyed hashing with secret keys and key IDs for enhanced security
- **Algorithm Flexibility**: Easy switching between SHA-256/512 and HMAC variants
- **Key Management**: Built-in secret key generation and validation
- **Collision Prevention**: Risk assessment and recommendations for hash selection

#### Data Processing

- **Smart Normalization**: Handles dates, numbers, strings, and nested objects consistently
- **Circular Reference Handling**: Safe processing of complex object graphs
- **Edge Case Support**: Null, undefined, empty objects, arrays, and primitive values
- **Dot Key Ambiguity**: Enhanced parser handles keys containing dots vs. nested paths

#### Performance & Reliability

- **Optimized Algorithms**: Single-pass processing for nested field access
- **Memory Efficient**: WeakSet-based circular reference detection
- **Deterministic Output**: Consistent results regardless of object key order
- **Error Recovery**: Graceful handling of malformed data and edge cases

### 📊 Coverage & Quality Metrics

- **145 Tests**: Comprehensive test suite covering all functionality
- **95.89% Statement Coverage**: Excellent code coverage
- **92.68% Branch Coverage**: Thorough conditional logic testing
- **96.58% Line Coverage**: Nearly complete line coverage
- **Zero Dependencies**: Dependency-free implementation
- **TypeScript**: Full type safety and IntelliSense support

### 🔧 Development Tools

- **Jest Configuration**: Coverage thresholds and comprehensive reporting
- **ESLint + Prettier**: Code formatting and linting standards
- **Husky Hooks**: Pre-commit and commit message validation
- **GitHub Actions**: Automated CI/CD with coverage enforcement
- **Release Automation**: Automated versioning and changelog generation

### 📚 Documentation & Examples

- **Comprehensive README**: Product-focused documentation with use cases
- **Strategy Comparison**: Detailed explanation of fingerprinting approaches
- **Real-World Examples**: Open Finance scenario with generic provider names
- **API Documentation**: Complete method signatures and usage examples
- **Performance Benchmarks**: Optimization verification and comparison

### 🎯 Production Ready

- **Enterprise Grade**: Robust error handling and edge case coverage
- **Scalable**: Efficient algorithms suitable for high-volume processing
- **Maintainable**: Clean code architecture with comprehensive testing
- **Secure**: HMAC support for sensitive data fingerprinting
- **Reliable**: Deterministic output ensures consistent behavior
